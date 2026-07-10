const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileTab.tsx', 'utf8');

const oldHandleFileChange = `  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("FILE SELECTED", file);
    if (file) {
      try {
        console.log("STATE BEFORE", avatarUrl);
        console.log("UPLOAD START");
        const publicUrl = await uploadFile(file, 'profiles');
        console.log("UPLOAD RESULT", publicUrl);
        setAvatarUrl(publicUrl);
        console.log("STATE AFTER", publicUrl);
      } catch (err: any) {
        console.error("Upload error caught:", err);
        alert(\`Upload failed: \${err.message || err}\`);
      }
    }
  };`;

const newHandleFileChange = `  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStatusMessage("Uploading avatar...");
      try {
        const publicUrl = await uploadFile(file, 'profiles');
        setAvatarUrl(publicUrl);
        
        // Auto-save the avatar
        const response = await fetch('/api/user/profile', {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: \`Bearer \${localStorage.getItem("kv_library_token")}\`,
          },
          body: JSON.stringify({ avatarUrl: publicUrl })
        });
        if (response.ok) {
           const data = await response.json();
           const updated = data.user || {};
           onUpdate({ 
             ...currentUser, 
             avatarUrl: updated.avatarUrl || publicUrl 
           });
           setStatusMessage("Avatar updated successfully!");
        } else {
           setStatusMessage("Failed to save avatar");
        }
        setTimeout(() => setStatusMessage(""), 3000);
      } catch (err: any) {
        console.error("Upload error caught:", err);
        setStatusMessage(\`Upload failed: \${err.message || err}\`);
        setTimeout(() => setStatusMessage(""), 3000);
      }
    }
  };`;

code = code.replace(oldHandleFileChange, newHandleFileChange);

// Handle default avatar
const oldAvatarDisplay = `                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12" />
                )}`;
                
const newAvatarDisplay = `                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement?.querySelector('svg')?.classList.remove('hidden'); }} />
                ) : null}
                <User className={\`w-12 h-12 \${avatarUrl ? 'hidden' : ''}\`} />`;

code = code.replace(oldAvatarDisplay, newAvatarDisplay);
fs.writeFileSync('src/components/ProfileTab.tsx', code);
