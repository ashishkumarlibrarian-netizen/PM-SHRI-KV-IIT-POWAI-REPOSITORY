const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const badCode = `
      if (response.ok) {
        const updated = await response.json();
        setLibrarySettings(updated);
        setIsEditingSettings(false);
      }
`;

const goodCode = `
      if (response.ok) {
        const updated = await response.json();
        setLibrarySettings(updated);
        setIsEditingSettings(false);
      } else {
        const errText = await response.text();
        console.error("Failed to save settings:", errText);
        alert("Failed to save settings: " + errText);
      }
`;

code = code.replace(badCode, goodCode);
fs.writeFileSync('src/App.tsx', code);
