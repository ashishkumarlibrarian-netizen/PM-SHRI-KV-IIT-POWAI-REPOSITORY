const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogoField = `
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logo Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={editSettingsForm.logoUrl} 
                  onChange={e => setEditSettingsForm({...editSettingsForm, logoUrl: e.target.value})} 
                  className="w-full border dark:border-slate-700 rounded-lg p-2 dark:bg-slate-800"
                  placeholder="https://..."
                />
              </div>
`;

const newLogoField = `
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logo Image (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target && typeof event.target.result === "string") {
                          setEditSettingsForm({...editSettingsForm, logoUrl: event.target.result});
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                  className="w-full border dark:border-slate-700 rounded-lg p-2 dark:bg-slate-800"
                />
                {editSettingsForm.logoUrl && (
                   <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
                      <img src={editSettingsForm.logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                   </div>
                )}
              </div>
`;

code = code.replace(oldLogoField.trim(), newLogoField.trim());
fs.writeFileSync('src/App.tsx', code);
