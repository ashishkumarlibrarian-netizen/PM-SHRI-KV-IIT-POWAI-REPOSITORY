const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileTab.tsx', 'utf8');

const oldHandleSave = `  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${localStorage.getItem("kv_library_token")}\`,
        },
        body: JSON.stringify({ fullName: name, password, avatarUrl })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onUpdate({ ...currentUser, fullName: updatedUser.fullName, avatarUrl: updatedUser.avatarUrl });
        setStatusMessage("Profile updated successfully!");
        setPassword("");
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        const errText = await response.text();
        setStatusMessage(\`Failed to update: \${errText}\`);
      }
    } catch (err) {
      setStatusMessage("Failed to update profile.");
    }
  };`;

const newHandleSave = `  const [isSuccess, setIsSuccess] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${localStorage.getItem("kv_library_token")}\`,
        },
        body: JSON.stringify({ fullName: name, password, avatarUrl })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onUpdate({ ...currentUser, fullName: updatedUser.fullName, avatarUrl: updatedUser.avatarUrl });
        setIsSuccess(true);
        setStatusMessage("Profile updated successfully!");
        setPassword("");
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        setIsSuccess(false);
        if (response.status === 401) {
          setStatusMessage("Session expired. Please log out and sign in again.");
        } else {
          setStatusMessage(errData.error || "Failed to update profile");
        }
      }
    } catch (err) {
      setIsSuccess(false);
      setStatusMessage("Failed to update profile.");
    }
  };`;

code = code.replace(oldHandleSave.trim(), newHandleSave.trim());

const oldStatusDiv = `        {statusMessage && (
          <div className={\`p-4 rounded-xl mb-6 \${statusMessage.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}\`}>
            {statusMessage}
          </div>
        )}`;

const newStatusDiv = `        {statusMessage && (
          <div className={\`p-4 rounded-xl mb-6 \${isSuccess ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}\`}>
            {statusMessage}
          </div>
        )}`;

code = code.replace(oldStatusDiv.trim(), newStatusDiv.trim());
fs.writeFileSync('src/components/ProfileTab.tsx', code);
