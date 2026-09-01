import './globals.css';
const origin=process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');
export const metadata = {
 metadataBase:new URL(origin),
 title:'Renan — Desenvolvedor Full Stack',
 description:'Um mergulho no universo de Renan. Aplicações web, SaaS, experiências digitais imersivas e literatura.',
 icons:{icon:'/favicon.svg'},
 openGraph:{type:'website',locale:'pt_BR',title:'Renan — Desenvolvedor Full Stack',description:'Código, criatividade e profundidade.',images:[{url:new URL('/og.png',origin).href,width:1672,height:941,alt:'Renan — Desenvolvedor Full Stack, em um observatório submarino com uma orca.'}]},
 twitter:{card:'summary_large_image',title:'Renan — Desenvolvedor Full Stack',description:'Código, criatividade e profundidade.',images:[new URL('/og.png',origin).href]},
};
export const viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#03121c'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR" className="dark"><head><link rel="preload" href="/assets/ocean-observatory.webp" as="image"/><link rel="preload" href="/assets/cormorant-garamond-latin-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head><body>{children}</body></html>;}
