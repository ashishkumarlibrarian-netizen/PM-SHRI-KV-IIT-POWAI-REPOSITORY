const fs = require('fs');
let code = fs.readFileSync('src/components/WelcomeTab.tsx', 'utf8');

const oldEffect = `  React.useEffect(() => {
    fetch('/api/thoughts').then(res => {
      if (res.ok) return res.json();
      return null;
    }).then(data => {
      if (data && data.length > 0) setThoughtOfTheDay(data[0]);
    }).catch(console.error);
  }, []);`;

const newEffect = `  React.useEffect(() => {
    const fetchThought = () => {
      fetch('/api/thoughts').then(res => {
        if (res.ok) return res.json();
        return null;
      }).then(data => {
        if (data && data.length > 0) setThoughtOfTheDay(data[0]);
      }).catch(console.error);
    };
    
    fetchThought();
    const interval = setInterval(fetchThought, 5000); // Poll every 5s for real-time feel
    return () => clearInterval(interval);
  }, []);`;

code = code.replace(oldEffect, newEffect);
fs.writeFileSync('src/components/WelcomeTab.tsx', code);
