'use strict';

const MULTI_QUERY_PATTERNS = [
    /\bcompare\b/i,
    /\bvs\b/i,
    /\bgrowth\b/i,
    /trend\s*\+\s*breakdown/i,
    /top\s+and\s+bottom/i,
];

const SCHEMA_CACHE_TTL_MS = 5 * 60 * 1000;
let schemaCache = null;

function extractSqlFromText(text) {
    if (!text || typeof text !== 'string') return '';
    const fenced = text.match(/```(?:sql)?\s*([\s\S]*?)```/i);
    const raw = fenced ? fenced[1] : text;
    return raw.trim().replace(/;+\s*$/, '');
}

function sanitizeSelectSql(sql) {
    if (!sql) throw new Error('Empty SQL generated.');

    const cleaned = sql.trim().replace(/;+\s*$/, '');
    const lowered = cleaned.toLowerCase();

    if (!lowered.startsWith('select')) {
        throw new Error('Only SELECT queries are allowed.');
    }

    const blocked = ['insert ', 'update ', 'delete ', 'drop ', 'alter ', 'create ', 'pragma ', 'attach ', 'detach '];
    for (const kw of blocked) {
        if (lowered.includes(kw)) {
            throw new Error(`Blocked SQL keyword detected: ${kw.trim()}`);
        }
    }

    return cleaned;
}

function isMultiQuery(userQuery) {
    if (!userQuery) return false;
    return MULTI_QUERY_PATTERNS.some((pattern) => pattern.test(userQuery));
}

function detectMultiIntent(userQuery = '') {
    const q = userQuery.toLowerCase();
    if (/\bgrowth\b|\bincrease\b|\bdecrease\b|\bchange\b/.test(q)) return 'growth';
    if (/\btrend\b|over time|month\s*on\s*month|year\s*on\s*year/.test(q)) return 'trend_comparison';
    if (/\bkpi\b|summary|overview/.test(q)) return 'kpi';
    if (/compare|\bvs\b|top\s+and\s+bottom/.test(q)) return 'comparison';
    return 'mixed';
}

function decideSingleChartType(userQuery, rows = [], sql = '') {
    const query = (userQuery || '').toLowerCase();
    const sqlLower = (sql || '').toLowerCase();

    if (/month|date|year|quarter|trend|over time/.test(query) || /group by\s+(month|date)/.test(sqlLower)) {
        return 'line';
    }
    if (/distribution|histogram|frequency/.test(query)) {
        return 'histogram';
    }
    if (/percentage|percent|share|ratio/.test(query)) {
        return 'pie';
    }
    if (/compare|\bby\b|top|bottom|vs/.test(query)) {
        return 'bar';
    }

    if (rows.length > 0) {
        const sample = rows[0];
        const keys = Object.keys(sample);
        const numericKeys = keys.filter((k) => typeof sample[k] === 'number');
        if (numericKeys.length === 0) return 'table';
        if (keys.some((k) => /month|date|year/i.test(k))) return 'line';
        if (keys.length <= 2) return 'bar';
    }

    return 'table';
}

function chooseXYKeys(rows = []) {
    if (!rows.length) return { xKey: null, yKey: null };
    const sample = rows[0];
    const keys = Object.keys(sample);
    const numericKeys = keys.filter((k) => typeof sample[k] === 'number');
    const xKey = keys.find((k) => !numericKeys.includes(k)) || keys[0] || null;
    const yKey = numericKeys[0] || keys[1] || keys[0] || null;
    return { xKey, yKey };
}

function getFirstNumericValue(row = {}) {
    for (const value of Object.values(row)) {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
    }
    return 0;
}

function normalizeRows(rows = []) {
    if (!Array.isArray(rows)) return [];
    return rows.map((row, idx) => {
        const entries = Object.entries(row || {});
        const numEntry = entries.find(([, value]) => typeof value === 'number');
        const labelEntry = entries.find(([, value]) => typeof value !== 'number');
        return {
            name: labelEntry ? String(labelEntry[1]) : `Item ${idx + 1}`,
            value: numEntry ? Number(numEntry[1] || 0) : 0,
        };
    });
}

function mergeSeriesForComparison(currentRows, previousRows) {
    const current = normalizeRows(currentRows);
    const previous = normalizeRows(previousRows);

    const map = new Map();
    for (const row of current) {
        map.set(row.name, { name: row.name, current: row.value, previous: 0 });
    }
    for (const row of previous) {
        const existing = map.get(row.name) || { name: row.name, current: 0, previous: 0 };
        existing.previous = row.value;
        map.set(row.name, existing);
    }
    return Array.from(map.values());
}

function buildFallbackSql(userQuery = '', mode = 'single') {
    const q = userQuery.toLowerCase();

    if (mode === 'multi' || /compare|\bvs\b|growth/.test(q)) {
        return "SELECT Month as name, ROUND(COALESCE(SUM(Amount), 0), 2) as value FROM orders WHERE Month != '' GROUP BY Month ORDER BY Month ASC";
    }

    if (/profit/.test(q)) {
        return 'SELECT ROUND(COALESCE(SUM(Profit), 0), 2) as total FROM orders';
    }

    if (/order|count/.test(q)) {
        return 'SELECT COUNT(Order_ID) as total FROM orders';
    }

    if (/category|top|bottom/.test(q)) {
        return "SELECT Category as name, ROUND(COALESCE(SUM(Amount), 0), 2) as value FROM orders WHERE Category != '' GROUP BY Category ORDER BY value DESC LIMIT 10";
    }

    return 'SELECT ROUND(COALESCE(SUM(Amount), 0), 2) as total FROM orders';
}

async function getSchemaDescription(queryFn) {
    if (schemaCache && (Date.now() - schemaCache.ts < SCHEMA_CACHE_TTL_MS)) {
        return schemaCache.value;
    }

    const tables = await queryFn("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    const parts = [];

    for (const table of tables) {
        const tableName = table.name;
        const columns = await queryFn(`PRAGMA table_info(${tableName})`);
        const colText = columns.map((c) => `${c.name} (${c.type || 'TEXT'})`).join(', ');
        parts.push(`Table ${tableName}: ${colText}`);
    }

    const schema = parts.join('\n');
    schemaCache = { ts: Date.now(), value: schema };
    return schema;
}

function buildSqlPrompt(schema, userQuery) {
    return [
        'You are a SQL expert.',
        '',
        'Database schema:',
        schema,
        '',
        'Convert the following query into SQL:',
        userQuery,
        '',
        'Rules:',
        '- Use correct table/column names',
        '- Use aggregation when needed (SUM, COUNT, AVG)',
        '- Use GROUP BY when required',
        '- Use WHERE for filtering',
        '- Return ONLY SQL',
        '- No explanation',
    ].join('\n');
}

function buildSubQueryPrompt(userQuery) {
    return [
        'You are an analytics expert.',
        '',
        'Break this query into multiple meaningful sub-queries:',
        userQuery,
        '',
        'Return JSON:',
        '{',
        '  "queries": [',
        '    "sub-query 1",',
        '    "sub-query 2"',
        '  ]',
        '}',
    ].join('\n');
}

function buildSqlCorrectionPrompt(schema, userQuery, failedSql, errorMsg) {
    return [
        'You are a SQL expert. The previous SQL failed.',
        '',
        'Database schema:',
        schema,
        '',
        'Original user query:',
        userQuery,
        '',
        'Failed SQL:',
        failedSql,
        '',
        'Error:',
        errorMsg,
        '',
        'Fix the SQL. Return ONLY corrected SQL. No explanation.',
    ].join('\n');
}

async function callGroq({ apiKey, model, prompt, expectJson = false }) {
    if (!apiKey || typeof fetch !== 'function') {
        throw new Error('LLM is unavailable.');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            temperature: 0,
            max_tokens: 900,
            response_format: expectJson ? { type: 'json_object' } : undefined,
            messages: [
                { role: 'system', content: 'You produce accurate and concise outputs.' },
                { role: 'user', content: prompt },
            ],
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Groq request failed: ${response.status} ${text.slice(0, 120)}`);
    }

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('Empty LLM output.');
    return content;
}

function fallbackMultiSubQueries(userQuery = '') {
    const q = userQuery.toLowerCase();

    if (/top\s+and\s+bottom/.test(q)) {
        return [
            `${userQuery} - top segment`,
            `${userQuery} - bottom segment`,
        ];
    }

    if (/growth|\bvs\b|compare/.test(q)) {
        return [
            `${userQuery} for current period`,
            `${userQuery} for previous period`,
        ];
    }

    return [
        userQuery,
        `${userQuery} trend`,
    ];
}

async function generateSqlFromQuery({ schema, userQuery, apiKey, model }) {
    const prompt = buildSqlPrompt(schema, userQuery);
    const completion = await callGroq({ apiKey, model, prompt, expectJson: false });
    return sanitizeSelectSql(extractSqlFromText(completion));
}

async function breakIntoSubQueries({ userQuery, apiKey, model }) {
    try {
        const prompt = buildSubQueryPrompt(userQuery);
        const completion = await callGroq({ apiKey, model, prompt, expectJson: true });
        const parsed = JSON.parse(completion);
        if (Array.isArray(parsed?.queries) && parsed.queries.length > 0) {
            return parsed.queries.slice(0, 4).map((q) => String(q).trim()).filter(Boolean);
        }
    } catch (_err) {
        // Fallback below
    }
    return fallbackMultiSubQueries(userQuery);
}

async function executeSqlWithRetry({ queryFn, schema, userQuery, sql, apiKey, model, mode }) {
    const firstSql = sanitizeSelectSql(sql);

    try {
        const rows = await queryFn(firstSql);
        return { sql: firstSql, rows, retried: false, fallbackUsed: false };
    } catch (firstErr) {
        try {
            const correctionPrompt = buildSqlCorrectionPrompt(schema, userQuery, firstSql, firstErr.message);
            const correctedRaw = await callGroq({ apiKey, model, prompt: correctionPrompt, expectJson: false });
            const correctedSql = sanitizeSelectSql(extractSqlFromText(correctedRaw));
            const rows = await queryFn(correctedSql);
            return { sql: correctedSql, rows, retried: true, fallbackUsed: false };
        } catch (_retryErr) {
            const fallbackSql = sanitizeSelectSql(buildFallbackSql(userQuery, mode));
            const rows = await queryFn(fallbackSql);
            return { sql: fallbackSql, rows, retried: true, fallbackUsed: true };
        }
    }
}

function buildEmptySingleResponse(sql = '') {
    return {
        type: 'single',
        data: [],
        chartType: 'table',
        xKey: null,
        yKey: null,
        sql,
        empty: true,
    };
}

function buildSingleResponse({ userQuery, sql, rows }) {
    if (!rows || rows.length === 0) return buildEmptySingleResponse(sql);

    const chartType = decideSingleChartType(userQuery, rows, sql);
    const { xKey, yKey } = chooseXYKeys(rows);

    return {
        type: 'single',
        data: rows,
        chartType,
        xKey,
        yKey,
        sql,
        empty: false,
    };
}

function buildMultiResponse({ userQuery, subResults }) {
    const intent = detectMultiIntent(userQuery);
    const chartSet = [];

    if (!subResults.length) {
        return {
            type: 'multi',
            charts: [],
            intent,
            empty: true,
        };
    }

    const first = subResults[0];
    const second = subResults[1];

    if ((intent === 'comparison' || intent === 'growth' || intent === 'trend_comparison') && second) {
        const merged = mergeSeriesForComparison(first.rows, second.rows);
        if (merged.length > 0) {
            const chartType = intent === 'trend_comparison' ? 'multi-line' : 'grouped-bar';
            chartSet.push({
                chartType,
                label: intent === 'growth' ? 'Growth Comparison' : 'Comparison',
                data: merged,
                xKey: 'name',
                yKey: 'current',
            });

            if (intent === 'growth') {
                const currentTotal = first.rows.reduce((sum, row) => sum + getFirstNumericValue(row), 0);
                const previousTotal = second.rows.reduce((sum, row) => sum + getFirstNumericValue(row), 0);
                const growthPct = previousTotal === 0 ? null : Number((((currentTotal - previousTotal) / previousTotal) * 100).toFixed(2));
                chartSet.push({
                    chartType: 'cards',
                    label: 'KPI Summary',
                    data: [{ currentTotal, previousTotal, growthPct }],
                    xKey: 'metric',
                    yKey: 'value',
                });
            }
        }
    }

    if (chartSet.length === 0) {
        for (const item of subResults) {
            const normalized = normalizeRows(item.rows);
            chartSet.push({
                chartType: normalized.length > 0 ? 'bar' : 'table',
                label: item.subQuery,
                data: normalized.length > 0 ? normalized : item.rows,
                xKey: normalized.length > 0 ? 'name' : chooseXYKeys(item.rows).xKey,
                yKey: normalized.length > 0 ? 'value' : chooseXYKeys(item.rows).yKey,
            });
        }
    }

    return {
        type: 'multi',
        charts: chartSet,
        intent,
        subQueries: subResults.map((item) => ({
            query: item.subQuery,
            sql: item.sql,
            rowCount: Array.isArray(item.rows) ? item.rows.length : 0,
        })),
        empty: chartSet.every((chart) => !Array.isArray(chart.data) || chart.data.length === 0),
    };
}

async function runUnifiedAgent({ userQuery, queryFn, apiKey, model }) {
    if (!userQuery || !String(userQuery).trim()) {
        return {
            type: 'single',
            data: [],
            chartType: 'table',
            xKey: null,
            yKey: null,
            sql: '',
            empty: true,
        };
    }

    const schema = await getSchemaDescription(queryFn);
    const mode = isMultiQuery(userQuery) ? 'multi' : 'single';

    if (mode === 'single') {
        let sql;
        try {
            sql = await generateSqlFromQuery({ schema, userQuery, apiKey, model });
        } catch (_err) {
            sql = buildFallbackSql(userQuery, 'single');
        }

        const result = await executeSqlWithRetry({
            queryFn,
            schema,
            userQuery,
            sql,
            apiKey,
            model,
            mode: 'single',
        });

        return {
            ...buildSingleResponse({ userQuery, sql: result.sql, rows: result.rows }),
            queryMode: mode,
            schema,
            retryUsed: result.retried,
            fallbackUsed: result.fallbackUsed,
        };
    }

    const subQueries = await breakIntoSubQueries({ userQuery, apiKey, model });
    const subResults = [];

    for (const subQuery of subQueries) {
        let sql;
        try {
            sql = await generateSqlFromQuery({ schema, userQuery: subQuery, apiKey, model });
        } catch (_err) {
            sql = buildFallbackSql(subQuery, 'multi');
        }

        const executed = await executeSqlWithRetry({
            queryFn,
            schema,
            userQuery: subQuery,
            sql,
            apiKey,
            model,
            mode: 'multi',
        });

        subResults.push({
            subQuery,
            sql: executed.sql,
            rows: executed.rows,
            retryUsed: executed.retried,
            fallbackUsed: executed.fallbackUsed,
        });
    }

    return {
        ...buildMultiResponse({ userQuery, subResults }),
        queryMode: mode,
        schema,
        retryUsed: subResults.some((s) => s.retryUsed),
        fallbackUsed: subResults.some((s) => s.fallbackUsed),
    };
}

module.exports = {
    runUnifiedAgent,
    isMultiQuery,
    decideSingleChartType,
    buildSqlPrompt,
    buildSubQueryPrompt,
};
