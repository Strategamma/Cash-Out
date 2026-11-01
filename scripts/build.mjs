import {readFile, writeFile, mkdir, cp, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const out=path.join(root,'dist');
// Publish explicit public files only, never user exports or local databases.
const files=[
 'visualizations/ui-kit/tokens.css',
 ...['index.html','library.html','core.js','components.js','motion.js','entry.js','history.js','app.js','library.js','styles.css','components.css','motion.css','THIRD_PARTY_NOTICES.md','assets/table-pattern.svg','assets/brand/cash-out-wordmark-light.svg','assets/brand/cash-out-wordmark-dark.svg','assets/brand/cash-out-symbol.svg'].map(f=>'visualizations/wireframes/'+f),
 ...['config.js','drive.js','store.js','controller.js','ui.js'].map(f=>'src/backup/'+f),
 'src/ledger/ledger.js',
 'docs/GOOGLE_DRIVE_SETUP.md'
];
const clientId=process.env.GOOGLE_CLIENT_ID?.trim();
if(clientId&&!/^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/.test(clientId))throw new Error('GOOGLE_CLIENT_ID must be a public Web OAuth client ID.');
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for(const file of files){await mkdir(path.dirname(path.join(out,file)),{recursive:true});await cp(path.join(root,file),path.join(out,file));}
if(clientId)await writeFile(path.join(out,'src/backup/config.js'),'window.CASH_OUT_GOOGLE = '+JSON.stringify({clientId,backupDelayMs:30000})+';\n');
for(const file of ['manifest.webmanifest','boot.js','apple-touch-icon.png','icon-192.png','icon-512.png'])await cp(path.join(root,'web',file),path.join(out,file));
await writeFile(path.join(out,'.nojekyll'),'');
await mkdir(path.join(out,'downloads'));await cp(path.join(root,'web/downloads.html'),path.join(out,'downloads/index.html'));
await writeFile(path.join(out,'index.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Cash Out</title><meta http-equiv="refresh" content="0;url=visualizations/wireframes/index.html"></head><body><a href="visualizations/wireframes/index.html">Open Cash Out test app</a></body></html>');
for(const page of ['index.html','library.html']){
 const file=path.join(out,'visualizations/wireframes',page);
 let html=await readFile(file,'utf8');
 if(page==='index.html'){
  html=html.replace('<script src="core.js', '<script>window.CASH_OUT_PLATFORM=true;</script><script src="../../src/ledger/ledger.js"></script><script src="core.js');
  html=html.replace('Cash Out · Interactive design','Cash Out · Local beta').replace('Prototype · enable autosave in Settings','Opening your saved workspace…').replace('DESIGN PREVIEW / 01','PRIVATE POKER ACCOUNTING').replace('Local prototype','Local beta').replace('Optional Drive backups. No real payments.<br>₹ is the sample currency.','Automatic device saves. Cloud setup pending.<br>All amounts in INR.');
  html=html.replace(/<div class="scenario">[\s\S]*?<\/div><\/aside>/, '</aside>');
 }
 html=html.replace('</head>','<link rel="manifest" href="../../manifest.webmanifest"><link rel="apple-touch-icon" href="../../apple-touch-icon.png"><meta name="theme-color" content="#0b1514"><meta name="apple-mobile-web-app-capable" content="yes"></head>');
 html=html.replace('</body>','<script src="../../boot.js"></script></body>');
 await writeFile(file,html);
}
const publicFiles=['index.html','manifest.webmanifest','boot.js','apple-touch-icon.png','icon-192.png','icon-512.png','downloads/index.html',...files];
const hash=createHash('sha256');
for(const file of publicFiles)hash.update(file).update(await readFile(path.join(out,file)));
const template=await readFile(path.join(root,'web/sw.js'),'utf8');
const version=hash.update(template).digest('hex').slice(0,16);
await writeFile(path.join(out,'sw.js'),template.replace('__VERSION__',version).replace('__ASSETS__',JSON.stringify(publicFiles)));
console.log(`Built ${publicFiles.length} public files, cache ${version}. Local beta; empty first-run workspace, no private records included.`);
