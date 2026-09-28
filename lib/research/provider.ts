import {unstable_cache} from 'next/cache';
import {stocks,isSymbol,type Packet,type Row} from './config';
export type Resource='quotes'|'profile'|'history'|'income'|'balance'|'cashflow'|'earnings'|'news'|'ratios';
export const resources:Resource[]=['quotes','profile','history','income','balance','cashflow','earnings','news','ratios'];
const endpoints:Record<Resource,string>={quotes:'batch-quote',profile:'profile',history:'historical-price-eod/full',income:'income-statement',balance:'balance-sheet-statement',cashflow:'cash-flow-statement',earnings:'earnings',news:'news/stock',ratios:'ratios-ttm'};
export class DataError extends Error{constructor(public status:number,message:string){super(message)}}
export const safeUrl=(v:unknown)=>{try{const u=new URL(String(v));return u.protocol==='https:'?u.href:null}catch{return null}};
// Only fields needed by the UI leave the server. Error messages never include request URLs or keys.
const fields:Partial<Record<Resource,string[]>>={quotes:['symbol','price','change','changePercentage','marketCap','timestamp','volume'],profile:['symbol','companyName','description','sector','industry','exchange','currency','website','marketCap','beta','lastDividend','range'],history:['date','close','volume'],earnings:['symbol','date','epsActual','epsEstimated','revenueActual','revenueEstimated','lastUpdated'],news:['symbol','publishedDate','publisher','title','url']};
export function normalize(data:unknown,kind:Resource):Row[]{
 if(!Array.isArray(data))throw new DataError(502,'The provider returned an unexpected response.');
 return data.filter(r=>r&&typeof r==='object').map(r=>Object.fromEntries(Object.entries(r).filter(([k,v])=>(fields[kind]?.includes(k)??true)&&(v===null||typeof v==='string'||typeof v==='number'&&Number.isFinite(v))).map(([k,v])=>[k,['url','link','finalLink','website'].includes(k)?safeUrl(v):v])) as Row).filter(r=>kind!=='history'||typeof r.date==='string'&&typeof r.close==='number');
}
const ttl=(kind:Resource)=>kind==='quotes'?300:kind==='news'?900:kind==='earnings'?3600:86400;
export async function getData(kind:Resource,symbols:string[],period='annual'):Promise<Packet>{
 if(!process.env.FMP_API_KEY||process.env.FMP_DISPLAY_LICENSED!=='true')throw new DataError(503,'Market data is not connected yet. Research will appear once licensed data access is enabled.');
 if(!symbols.length||symbols.length>30||symbols.some(s=>!isSymbol(s)))throw new DataError(400,'Choose a supported ticker.');
 const requested=[...new Set(symbols)].sort();
 const sorted=kind==='quotes'?stocks.map(s=>s.symbol).sort():[requested[0]];
 const packet=await unstable_cache(async()=>{
 const params=new URLSearchParams({apikey:process.env.FMP_API_KEY!});
 params.set(kind==='quotes'||kind==='news'?'symbols':'symbol',kind==='quotes'?sorted.join(','):sorted[0]);
 if(['income','balance','cashflow'].includes(kind)){params.set('period',period);params.set('limit',period==='quarter'?'160':'40')}
 if(kind==='news')params.set('limit','20');
 if(kind==='earnings')params.set('limit','100');
 if(kind==='history'){const d=new Date();d.setUTCFullYear(d.getUTCFullYear()-5);params.set('from',d.toISOString().slice(0,10))}
 let response:Response;try{response=await fetch('https://financialmodelingprep.com/stable/'+endpoints[kind]+'?'+params,{cache:'no-store',signal:AbortSignal.timeout(12000)})}catch{throw new DataError(502,'The data provider did not respond. Please try again shortly.')}
 if(!response.ok)throw new DataError(response.status===429?429:502,response.status===429?'The provider request limit was reached. Try again later.':'This dataset is unavailable. The provider subscription may not include it.');
 let raw:unknown;try{raw=await response.json()}catch{throw new DataError(502,'The provider returned an unreadable response.')}
 const rows=normalize(raw,kind).map(row=>{if(kind==='quotes'){for(const key of ['price','change','changePercentage','marketCap','timestamp','volume'])if(typeof row[key]!=='number')row[key]=null;if(typeof row.price==='number'&&row.price<0)row.price=null;}return row});
 return {rows,fetchedAt:new Date().toISOString(),source:'Financial Modeling Prep',latency:['real-time','15-minute delayed','end-of-day'].includes(process.env.FMP_QUOTE_LATENCY??'')?process.env.FMP_QUOTE_LATENCY!:'Latency unverified — do not treat as real-time',session:'Market session unverified; quote timestamps may refer to the last trade.',...(rows.length?{}:{message:'No records returned for this ticker and dataset.'})};
 },['research-v2',kind,sorted.join(','),['income','balance','cashflow'].includes(kind)?period:'default'],{revalidate:ttl(kind)})();
 return kind==='quotes'?{...packet,rows:packet.rows.filter(r=>requested.includes(String(r.symbol)))}:packet;
}
