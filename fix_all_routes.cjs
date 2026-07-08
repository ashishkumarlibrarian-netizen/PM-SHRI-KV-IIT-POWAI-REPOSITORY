const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf-8');
const lines = code.split('\n');

const asyncHandler = `
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
`;

if (!code.includes('const asyncHandler')) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('const app = express();')) {
      lines.splice(i + 1, 0, asyncHandler);
      break;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.match(/^app\.(get|post|put|delete)\("/)) {
      lines[i] = line.replace(/async \(req, res\) => \{/, 'asyncHandler(async (req, res, next) => {');
    }
  }
  
  // Now replace the closing brackets.
  // Each route currently ends with "});". Because we added asyncHandler(, we need to change "});" to "}));".
  // But wait! They already end with "});"!
  // If the old line was `app.get("/api/events", async (req, res) => {`
  // it becomes `app.get("/api/events", asyncHandler(async (req, res, next) => {`
  // The closing is `});`, which we must change to `}));`.
  
  // We can just iterate backwards to find the `});` for each matched route.
  let inRoute = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^app\.(get|post|put|delete)\(".*asyncHandler/)) {
      inRoute = true;
    }
    if (inRoute && lines[i] === '});') {
      lines[i] = '}));';
      inRoute = false;
    }
  }

  fs.writeFileSync('server.ts', lines.join('\n'));
}
