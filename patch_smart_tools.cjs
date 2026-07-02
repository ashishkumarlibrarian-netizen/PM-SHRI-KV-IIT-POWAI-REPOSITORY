const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const smartToolsTabDesktop = `{ id: "books", label: "Recent Books", icon: <BookOpen className="w-4 h-4" />, url: "https://eg4.nic.in/OPAC/Default.aspx?CL_NAME=KVS3" },
            { 
              id: "smart-tools", 
              label: "Smart Tools", 
              icon: <Wrench className="w-4 h-4" />, 
              dropdown: [
                { label: "NoteGPT", url: "https://notegpt.io/" },
                { label: "Comic Creator", url: "https://chatgpt.com/g/g-mdQqTNult-comic-creator" },
                { label: "App Inventor", url: "https://appinventor.mit.edu/" },
                { label: "Emergent", url: "https://app.emergent.sh/" },
                { label: "Gamma", url: "https://gamma.app/" }
              ] 
            },`;

const smartToolsTabMobile = `{ id: "books", label: "📖 Recent Books", icon: null, url: "https://eg4.nic.in/OPAC/Default.aspx?CL_NAME=KVS3" },
            { 
              id: "smart-tools", 
              label: "🛠️ Smart Tools", 
              icon: <Wrench className="w-3.5 h-3.5" />, 
              dropdown: [
                { label: "NoteGPT", url: "https://notegpt.io/" },
                { label: "Comic Creator", url: "https://chatgpt.com/g/g-mdQqTNult-comic-creator" },
                { label: "App Inventor", url: "https://appinventor.mit.edu/" },
                { label: "Emergent", url: "https://app.emergent.sh/" },
                { label: "Gamma", url: "https://gamma.app/" }
              ] 
            },`;

code = code.replace('{ id: "books", label: "Recent Books", icon: <BookOpen className="w-4 h-4" />, url: "https://eg4.nic.in/OPAC/Default.aspx?CL_NAME=KVS3" },', smartToolsTabDesktop);
code = code.replace('{ id: "books", label: "📖 Recent Books", icon: null, url: "https://eg4.nic.in/OPAC/Default.aspx?CL_NAME=KVS3" },', smartToolsTabMobile);

fs.writeFileSync('src/App.tsx', code);
