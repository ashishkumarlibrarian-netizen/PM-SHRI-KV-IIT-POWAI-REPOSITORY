const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `
const defaultLibrarySettings = {
  logoUrl: "",
  name: "PM Shri Kendriya Vidyalaya",
  tag: "IIT Powai Library"
};
`;

const newCode = `
const defaultLibrarySettings = {
  logoUrl: "",
  name: "PM Shri Kendriya Vidyalaya",
  tag: "IIT Powai Library",
  headerTitle: "KV IIT Powai Digital Library Hub"
};
`;

code = code.replace(oldCode.trim(), newCode.trim());

const oldPutCode = `
    const { logoUrl, name, tag } = req.body;
    if (logoUrl !== undefined) librarySettings.logoUrl = logoUrl;
    if (name !== undefined) librarySettings.name = name;
    if (tag !== undefined) librarySettings.tag = tag;
`;

const newPutCode = `
    const { logoUrl, name, tag, headerTitle } = req.body;
    if (logoUrl !== undefined) librarySettings.logoUrl = logoUrl;
    if (name !== undefined) librarySettings.name = name;
    if (tag !== undefined) librarySettings.tag = tag;
    if (headerTitle !== undefined) librarySettings.headerTitle = headerTitle;
`;

code = code.replace(oldPutCode.trim(), newPutCode.trim());

fs.writeFileSync('server.ts', code);
