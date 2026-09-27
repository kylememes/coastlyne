import type {Metadata} from 'next';
import './globals.css';
import {Header,Footer} from '@/components/shell';
const origin=process.env.NEXT_PUBLIC_SITE_URL||(process.env.VERCEL_PROJECT_PRODUCTION_URL?`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`:'http://localhost:3000');
export const metadata:Metadata={metadataBase:new URL(origin),title:{default:'GUIDANCE — Your financial future, crystal clear.',template:'%s | GUIDANCE'},description:'Bring cash flow, financial goals, retirement projections and investment calculators together. Find your investment horizon with GUIDANCE.',openGraph:{type:'website',siteName:'GUIDANCE',title:'GUIDANCE — Your financial future, crystal clear.',description:'A clearer view of retirement, investing, and what comes next.'},twitter:{card:'summary_large_image'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><Header/>{children}<Footer/></body></html>}
