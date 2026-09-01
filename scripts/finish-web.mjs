import { readFile,writeFile } from 'node:fs/promises';
// Vercel provides its own deployment hostname. For another host set SITE_URL.
const supplied=process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL?`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`:process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:'');
let tags='';
if(supplied){
 const parsed=new URL(supplied);
 if(!['https:','http:'].includes(parsed.protocol)||parsed.username||parsed.password)throw new Error('SITE_URL precisa ser uma origem HTTP(S) válida, sem credenciais.');
 const origin=parsed.origin;
 tags=`<link rel="canonical" href="${origin}/"/><meta property="og:url" content="${origin}/"/><meta property="og:image" content="${origin}/og.png"/><meta property="og:image:alt" content="Renan — Desenvolvedor Full Stack, em um observatório submarino com uma orca."/><meta name="twitter:image" content="${origin}/og.png"/>`;
}
const path=new URL('../dist-vercel/index.html',import.meta.url);
await writeFile(path,(await readFile(path,'utf8')).replace('<!-- BUILD_ORIGIN_METADATA -->',tags));
console.log('Build estático pronto em dist-vercel.'+(supplied?' Prévia social configurada.':' Defina SITE_URL em hospedagens fora da Vercel para URLs sociais absolutas.'));
