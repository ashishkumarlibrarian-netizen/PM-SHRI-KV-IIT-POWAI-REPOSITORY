const fs = require('fs');
let code = fs.readFileSync('src/components/ReadersClubTab.tsx', 'utf8');

// Add newFolderLogo state
code = code.replace(
  'const [newFolderColor, setNewFolderColor] = useState("text-blue-600 bg-blue-100 dark:bg-blue-900/50");',
  'const [newFolderColor, setNewFolderColor] = useState("text-blue-600 bg-blue-100 dark:bg-blue-900/50");\n  const [newFolderLogo, setNewFolderLogo] = useState("");'
);

// Update handleAddFolder to include logo
code = code.replace(
  'name: newFolderName, \n      color: newFolderColor, \n      members: [] \n    }];',
  'name: newFolderName, \n      color: newFolderColor, \n      logo: newFolderLogo, \n      members: [] \n    }];\n    setNewFolderLogo("");'
);

// Add logo upload handler
code = code.replace(
  'const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {',
  'const handleFolderLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {\n    const file = e.target.files?.[0];\n    if (file) {\n      const reader = new FileReader();\n      reader.onload = (event) => {\n        setNewFolderLogo(event.target?.result as string);\n      };\n      reader.readAsDataURL(file);\n    }\n  };\n\n  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {'
);

// Add input field for folder logo
code = code.replace(
  '<button \n                  onClick={handleAddFolder}',
  '<div>\n                  <label className="block text-xs font-semibold text-slate-500 mb-1">Folder Logo</label>\n                  <input type="file" accept="image/*" onChange={handleFolderLogoUpload} className="w-full text-sm text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />\n                </div>\n                <button \n                  onClick={handleAddFolder}'
);

// Render folder logo if it exists
code = code.replace(
  '<Folder className="w-8 h-8" />',
  '{folder.logo ? <img src={folder.logo} alt="Folder Logo" className="w-8 h-8 object-cover rounded-lg" /> : <Folder className="w-8 h-8" />}'
);

// Render folder logo inside the opened folder
code = code.replace(
  '<Folder className="w-5 h-5 text-blue-500" />\n                  {activeFolder?.name}',
  '{activeFolder?.logo ? <img src={activeFolder.logo} alt="Folder Logo" className="w-6 h-6 object-cover rounded flex-shrink-0" /> : <Folder className="w-5 h-5 text-blue-500" />}\n                  {activeFolder?.name}'
);

fs.writeFileSync('src/components/ReadersClubTab.tsx', code);
