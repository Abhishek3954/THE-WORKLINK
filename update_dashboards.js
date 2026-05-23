const fs = require('fs');

const wlDash = 'd:\\Worklink (botted)\\components\\worklink-employee-dashboard.tsx';
let wlContent = fs.readFileSync(wlDash, 'utf8');

wlContent = wlContent.replace(/<h2 className="text-xl font-black text-foreground tracking-tight">Priority Matches<\/h2>/g, '<h2 className="text-xl font-black text-foreground tracking-tight">{t(\'Priority Matches\')}</h2>');
wlContent = wlContent.replace(/<h2 className="text-xl font-black text-foreground tracking-tight">Workforce Development<\/h2>/g, '<h2 className="text-xl font-black text-foreground tracking-tight">{t(\'Workforce Development\')}</h2>');
wlContent = wlContent.replace(/<p className="text-sm font-bold text-slate-900 mb-1 leading-none uppercase tracking-tight">Looking for matches\.\.\.<\/p>/g, '<p className="text-sm font-bold text-slate-900 mb-1 leading-none uppercase tracking-tight">{t(\'Looking for matches...\')}</p>');
wlContent = wlContent.replace(/<p className="text-\[10px\] text-muted-foreground font-medium uppercase tracking-widest">Priority assignments will appear here<\/p>/g, '<p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{t(\'Priority assignments will appear here\')}</p>');

fs.writeFileSync(wlDash, wlContent);

const gigDash = 'd:\\Worklink (botted)\\components\\gig-worker-dashboard.tsx';
let gigContent = fs.readFileSync(gigDash, 'utf8');

gigContent = gigContent.replace(/<p className="text-sm font-bold text-slate-900 mb-1 leading-none uppercase tracking-tight">Looking for matches\.\.\.<\/p>/g, '<p className="text-sm font-bold text-slate-900 mb-1 leading-none uppercase tracking-tight">{t(\'Looking for matches...\')}</p>');
gigContent = gigContent.replace(/<p className="text-\[10px\] text-muted-foreground font-medium uppercase tracking-widest">Priority assignments will appear here<\/p>/g, '<p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{t(\'Priority assignments will appear here\')}</p>');

fs.writeFileSync(gigDash, gigContent);
console.log('Dashboards updated');
