const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const profileRender = `
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProfileTab currentUser={currentUser} onUpdate={(u) => { setCurrentUser(u); setStudentName(u.fullName); localStorage.setItem("kv_library_user", JSON.stringify(u)); }} />
            </motion.div>
          )}
          {activeTab === "menu" && (
`;

code = code.replace(
  '{activeTab === "menu" && (',
  profileRender
);

fs.writeFileSync('src/App.tsx', code);
