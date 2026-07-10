const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('AdminTab')) {
  code = code.replace(
    'import WelcomeTab from "./components/WelcomeTab";',
    'import WelcomeTab from "./components/WelcomeTab";\nimport AdminTab from "./components/AdminTab";'
  );
  
  // Add to desktop nav
  const desktopNav = `{ id: "menu", label: "Menu", icon: <Menu className="w-4 h-4" /> }`;
  code = code.replace(desktopNav, desktopNav + `,\n            ...(currentUser?.role === "admin" ? [{ id: "admin", label: "Admin Hub", icon: <Wrench className="w-4 h-4" /> }] : [])`);
  
  // Add to mobile nav
  const mobileNav = `{ id: "menu", label: "Menu", icon: <Menu className="w-3.5 h-3.5" /> }`;
  code = code.replace(mobileNav, mobileNav + `,\n            ...(currentUser?.role === "admin" ? [{ id: "admin", label: "Admin Hub", icon: <Wrench className="w-3.5 h-3.5" /> }] : [])`);
  
  // Render the tab
  const eventsTabRender = `{activeTab === "events" && (
            <motion.div
              key="events-tab"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <EventsTab isAdmin={currentUser?.role === "admin"} />
            </motion.div>
          )}`;
          
  const adminTabRender = `          {activeTab === "admin" && currentUser?.role === "admin" && (
            <motion.div
              key="admin-tab"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <AdminTab />
            </motion.div>
          )}`;
          
  code = code.replace(eventsTabRender, eventsTabRender + '\n\n' + adminTabRender);
  
  fs.writeFileSync('src/App.tsx', code);
}
