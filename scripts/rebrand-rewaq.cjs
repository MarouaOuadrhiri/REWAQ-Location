const fs=require('node:fs'),path=require('node:path');
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else if(/\.(tsx|ts)$/.test(item.name)){let s=fs.readFileSync(p,'utf8').replaceAll('LOCATION','REWAQ Location').replaceAll('/brand/medina-motion-icon','/brand/rewaq-icon');fs.writeFileSync(p,s)}}}
walk('app');walk('components');
let shell=fs.readFileSync('components/PublicShell.tsx','utf8');shell=shell.replace('REWAQ Location<small>MARRAKECH · AIRPORT CAR RENTAL</small>','REWAQ<small>LOCATION · MARRAKECH</small>');fs.writeFileSync('components/PublicShell.tsx',shell);
for(const p of ['components/AdminShell.tsx','app/admin/login/page.tsx'])fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('REWAQ Location<span>∙</span>','REWAQ<span>∙</span>'));
console.log('Updated visible brand copy and icon references; database and historical references unchanged.');
