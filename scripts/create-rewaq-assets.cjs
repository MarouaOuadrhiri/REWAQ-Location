const fs=require('node:fs'),sharp=require('sharp');
const out='public/brand';
const arch='M8 108V60C8 33 24 21 50 6c26 15 42 27 42 54v48H79V60c0-18-10-28-29-39-19 11-29 21-29 39v48Z';
const monogram='M30 43H49C65 43 73 51 73 63C73 73 67 79 57 81L76 106H61L44 82H42V99L30 104ZM42 54V70H49C57 70 61 68 61 63C61 57 57 54 49 54ZM49 84C59 89 66 94 69 100L65 100C62 94 57 90 48 85Z';
function symbol(fg,dot){return `<path fill="${fg}" fill-rule="evenodd" d="${arch}"/><path fill="${fg}" fill-rule="evenodd" d="${monogram}"/><circle cx="76" cy="96" r="4" fill="${dot}"/>`}
function svg(body,view='0 0 100 112',label='REWAQ Location - Marrakech airport car rental'){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" role="img" aria-label="${label}">${body}</svg>`}
for(const [suffix,fg,dot] of [['','#103E38','#C86A4A'],['-light','#FAF7F1','#E8D6BA'],['-mono','#103E38','#103E38']]){
fs.writeFileSync(`${out}/rewaq-symbol${suffix}.svg`,svg(symbol(fg,dot)));
const lockup=`<g transform="translate(12 12) scale(1.2)">${symbol(fg,dot)}</g><text x="155" y="84" fill="${fg}" font-family="Arial,Helvetica,sans-serif" font-size="78" font-weight="700" letter-spacing="6">REWAQ</text><text x="160" y="118" fill="${fg}" font-family="Arial,Helvetica,sans-serif" font-size="23" letter-spacing="8">LOCATION</text><text x="161" y="143" fill="${fg}" font-family="Arial,Helvetica,sans-serif" font-size="10" letter-spacing="2">MARRAKECH · AIRPORT CAR RENTAL</text>`;
fs.writeFileSync(`${out}/rewaq-logo${suffix}.svg`,svg(lockup,'0 0 650 170'));
}
fs.writeFileSync(`${out}/rewaq-icon.svg`,svg(`<rect width="64" height="64" rx="14" fill="#103E38"/><g transform="translate(7 4) scale(.49)">${symbol('#FAF7F1','#E8D6BA')}</g>`,'0 0 64 64'));
(async()=>{fs.mkdirSync('output/rewaq-brand',{recursive:true});for(const size of [16,32,64,180,512])await sharp(`${out}/rewaq-icon.svg`).resize(size,size).png().toFile(`${out}/rewaq-icon-${size}.png`);for(const suffix of ['','-light','-mono'])await sharp(`${out}/rewaq-logo${suffix}.svg`).resize(1950,510).png().toFile(`output/rewaq-brand/rewaq-logo${suffix}.png`);for(const name of fs.readdirSync(out).filter(n=>n.startsWith('rewaq-')))fs.copyFileSync(`${out}/${name}`,`output/rewaq-brand/${name}`);console.log('Generated REWAQ vector logos, monogram and raster icons.');})();
