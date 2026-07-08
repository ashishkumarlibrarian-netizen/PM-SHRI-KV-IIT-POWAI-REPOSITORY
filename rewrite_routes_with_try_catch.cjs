const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace all app.VERB("/path", async (req, res) => { ... }) with try/catch wrapping
// Actually, it's easier to just use an async handler wrapper
const asyncHandlerCode = `
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
`;

if (!code.includes('const asyncHandler')) {
  code = code.replace('const app = express();', 'const app = express();\n' + asyncHandlerCode);
  
  // Now replace all `app.get("...", async (req, res) => {` with `app.get("...", asyncHandler(async (req, res) => {`
  const verbs = ['get', 'post', 'put', 'delete'];
  for (const verb of verbs) {
    const regex = new RegExp(\`app\.\${verb}\\((["'].*?["']),\\s*async\\s*\\(req,\\s*res\\)\\s*=>\\s*\\{\`, 'g');
    code = code.replace(regex, (match, path) => \`app.\${verb}(\${path}, asyncHandler(async (req, res) => {\`);
    
    // Also we need to close the parenthesis at the end of the route.
    // This is hard to do with regex reliably.
  }
}
// Actually, maybe I can just do a simple replacement if I'm careful.
