const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const fetchSettingsCode = `
  const [librarySettings, setLibrarySettings] = useState({
    logoUrl: "",
    name: "PM SHRI SCHOOL",
    tag: "IIT POWAI SECTOR"
  });
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editSettingsForm, setEditSettingsForm] = useState({ logoUrl: "", name: "", tag: "" });

  useEffect(() => {
    fetch('/api/settings/library')
      .then(r => r.json())
      .then(data => {
        setLibrarySettings(data);
        setEditSettingsForm(data);
      })
      .catch(console.error);
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/settings/library', {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${localStorage.getItem('kv_library_token')}\`,
        },
        body: JSON.stringify(editSettingsForm)
      });
      if (response.ok) {
        const updated = await response.json();
        setLibrarySettings(updated);
        setIsEditingSettings(false);
      }
    } catch (err) {
      console.error(err);
    }
  };
`;

code = code.replace(
  'export default function App() {',
  'export default function App() {' + fetchSettingsCode
);

fs.writeFileSync('src/App.tsx', code);
