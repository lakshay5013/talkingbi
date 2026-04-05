const { execSync } = require('child_process');
const fs = require('fs');
try {
  const out = execSync('node import_data.js', { encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync('output.log', "SUCCESS:\n" + out);
} catch (e) {
  fs.writeFileSync('output.log', "ERROR STATUS: " + e.status + "\nSTDOUT:\n" + e.stdout + "\nSTDERR:\n" + e.stderr);
}
