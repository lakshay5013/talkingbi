const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

const dbPath = path.join(__dirname, 'database.sqlite');
const ordersCsvPath = path.join(__dirname, '..', 'Orders.csv');
const detailsCsvPath = path.join(__dirname, '..', 'Details.csv');

const db = new sqlite3.Database(dbPath);

const readCsv = (filePath) =>
  new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });

const parseNumber = (value) => {
  const parsed = Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

const monthFromDate = (dateValue) => {
  if (!dateValue) return '';
  const parts = String(dateValue).split('-');
  if (parts.length === 3) {
    return parts[1].padStart(2, '0');
  }
  return '';
};

async function runImport() {
  try {
    const [ordersRows, detailsRows] = await Promise.all([
      readCsv(ordersCsvPath),
      readCsv(detailsCsvPath),
    ]);

    const orderById = new Map();
    for (const row of ordersRows) {
      const id = row['Order ID'];
      if (id) {
        orderById.set(id, row);
      }
    }

    db.serialize(() => {
      db.run('DROP TABLE IF EXISTS orders');
      db.run(`
        CREATE TABLE orders (
          Order_ID TEXT,
          Date TEXT,
          Month TEXT,
          CustomerName TEXT,
          Ship_State TEXT,
          Ship_City TEXT,
          Status TEXT,
          Category TEXT,
          Sub_Category TEXT,
          Qty INTEGER,
          Amount REAL,
          Profit REAL,
          PaymentMode TEXT,
          B2B TEXT,
          SKU TEXT
        )
      `);

      const insertStmt = db.prepare(
        'INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );

      let count = 0;
      for (const detail of detailsRows) {
        const orderId = detail['Order ID'] || '';
        const order = orderById.get(orderId) || {};

        const date = order['Order Date'] || '';
        const month = monthFromDate(date);

        insertStmt.run(
          orderId,
          date,
          month,
          order['CustomerName'] || '',
          order['State'] || '',
          order['City'] || '',
          'Completed',
          detail['Category'] || '',
          detail['Sub-Category'] || '',
          parseNumber(detail['Quantity']),
          parseNumber(detail['Amount']),
          parseNumber(detail['Profit']),
          detail['PaymentMode'] || '',
          'False',
          ''
        );

        count += 1;
      }

      insertStmt.finalize((err) => {
        if (err) {
          console.error('Error finalizing insert statement:', err.message);
        }
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_orders_state ON orders(Ship_State)');
      db.run('CREATE INDEX IF NOT EXISTS idx_orders_category ON orders(Category)');
      db.run('CREATE INDEX IF NOT EXISTS idx_orders_month ON orders(Month)');

      db.close(() => {
        console.log(`Import completed successfully. Inserted ${count} rows.`);
      });
    });
  } catch (err) {
    console.error('Import failed:', err.message);
    db.close();
    process.exit(1);
  }
}

runImport();
