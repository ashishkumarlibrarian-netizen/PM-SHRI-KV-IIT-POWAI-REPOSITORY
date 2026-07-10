const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "await supabase.from('thoughts').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000').catch(() => {});",
  "try { await supabase.from('thoughts').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000'); } catch(e) {}"
);
code = code.replace(
  "await supabase.from('thoughts').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000').catch(() => {});",
  "try { await supabase.from('thoughts').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000'); } catch(e) {}"
);

fs.writeFileSync('server.ts', code);
