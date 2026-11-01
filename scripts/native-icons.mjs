import {readFile,writeFile,readdir} from 'node:fs/promises';
import {Resvg} from '@resvg/resvg-js';
const logo=(await readFile('visualizations/wireframes/assets/brand/cash-out-symbol-light.svg','utf8')).trim();
const svg=(background,scale)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${background?`<rect width="1024" height="1024" fill="${background}"/>`:''}<svg x="${(1024-scale)/2}" y="${(1024-scale)/2}" width="${scale}" height="${scale}" viewBox="0 0 128 128">${logo.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</svg></svg>`;
const png=(size,background='#b6e5c2',scale=680)=>new Resvg(svg(background,scale),{fitTo:{mode:'width',value:size}}).render().asPng();
for(const [density,size] of Object.entries({mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192})){
 const folder=`android/app/src/main/res/mipmap-${density}`;
 for(const name of ['ic_launcher','ic_launcher_round'])await writeFile(`${folder}/${name}.png`,png(size));
 await writeFile(`${folder}/ic_launcher_foreground.png`,png(Math.round(size*108/48),null,540));
}
await writeFile('android/app/src/main/res/values/ic_launcher_background.xml','<?xml version="1.0" encoding="utf-8"?><resources><color name="ic_launcher_background">#b6e5c2</color></resources>');
const res='android/app/src/main/res';
for(const folder of await readdir(res))if(folder==='drawable'||folder.startsWith('drawable-land-')||folder.startsWith('drawable-port-')){
 try{await readFile(`${res}/${folder}/splash.png`);await writeFile(`${res}/${folder}/splash.png`,png(1024,'#0b1514',260));}catch(error){if(error.code!=='ENOENT')throw error;}
}
await writeFile('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',png(1024));
for(const name of ['splash-2732x2732.png','splash-2732x2732-1.png','splash-2732x2732-2.png'])await writeFile('ios/App/App/Assets.xcassets/Splash.imageset/'+name,png(2732,'#0b1514',260));
await writeFile('web/apple-touch-icon.png',png(180));
await writeFile('web/icon-192.png',png(192));await writeFile('web/icon-512.png',png(512));
console.log('Generated Android, iOS and web installation icons from the approved chip/spade symbol.');
