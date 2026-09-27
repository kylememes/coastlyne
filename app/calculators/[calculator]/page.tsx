import {notFound} from 'next/navigation';
import {calculators} from '@/lib/calculators';
import {Calculator} from '@/components/analytics';
export function generateStaticParams(){return calculators.map(c=>({calculator:c.slug}))}
export async function generateMetadata({params}:{params:Promise<{calculator:string}>}){const {calculator}=await params;const c=calculators.find(c=>c.slug===calculator);return {title:c?.name+' Calculator',description:c?.description,openGraph:{title:c?.name+' Calculator | CURRIVAL',description:c?.description},twitter:{card:'summary_large_image',title:c?.name+' Calculator | CURRIVAL',description:c?.description}}}
export default async function Page({params}:{params:Promise<{calculator:string}>}){const {calculator}=await params;if(!calculators.some(c=>c.slug===calculator))notFound();return <Calculator key={calculator} slug={calculator}/>}
