import {notFound,permanentRedirect} from 'next/navigation';
import {products} from '@/lib/products';
import {Current,Islands} from '@/components/planning';
import {Compass,InDepth} from '@/components/analytics';
export function generateStaticParams(){return ['bay','current','islands','compass','in-depth'].map(product=>({product}))}
export async function generateMetadata({params}:{params:Promise<{product:string}>}){const {product}=await params;const p=products.find(p=>p[2]==='/'+product);return {title:product==='bay'?'Home':p?.[0]||'Not found',description:p?.[1],openGraph:{title:p?.[0]+' | COASTLYNE',description:p?.[1]}}}
export default async function Page({params}:{params:Promise<{product:string}>}){const {product}=await params;if(product==='bay')permanentRedirect('/');const Component={current:Current,islands:Islands,compass:Compass,'in-depth':InDepth}[product];if(!Component)notFound();return <Component/>}
