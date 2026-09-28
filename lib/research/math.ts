import {stocks,type Holding,type Quote} from './config.ts';
export const finite=(v:unknown):number|null=>typeof v==='number'&&Number.isFinite(v)?v:null;
export function percentChange(actual:number|null,base:number|null){return actual===null||base===null||base===0?null:(actual-base)/Math.abs(base)*100}
export function surprise(actual:number|null,estimate:number|null,comparable:boolean){return !comparable||actual===null||estimate===null?null:{amount:actual-estimate,percent:percentChange(actual,estimate)}}
export type DcfInput={flows:number[];discount:number;terminalGrowth:number;cash:number;debt:number;shares:number;terminalMode:'growth'|'multiple';multiple:number};
export function dcf(a:DcfInput){
 if(!a.flows.length||a.flows.length>20||[...a.flows,a.discount,a.terminalGrowth,a.cash,a.debt,a.shares,a.multiple].some(v=>!Number.isFinite(v))||a.shares<=0||a.discount<=0||a.discount>100||a.cash<0||a.debt<0||a.multiple<0||a.terminalGrowth<=-100||a.terminalMode==='growth'&&a.discount<=a.terminalGrowth) return null;
 const rate=a.discount/100,g=a.terminalGrowth/100;
 const rows=a.flows.map((flow,i)=>({year:i+1,flow,present:flow/(1+rate)**(i+1)}));
 const last=a.flows.at(-1)!;
 if(last<=0)return null;
 const terminal=a.terminalMode==='growth'?last*(1+g)/(rate-g):last*a.multiple;
 const terminalPV=terminal/(1+rate)**a.flows.length,enterprise=rows.reduce((s,r)=>s+r.present,0)+terminalPV;
 return {rows,enterprise,equity:enterprise+a.cash-a.debt,perShare:(enterprise+a.cash-a.debt)/a.shares,terminalPV,terminalWeight:enterprise>0?terminalPV/enterprise*100:null};
}
export function portfolio(holdings:Holding[],quotes:Quote[]){
 const positions=holdings.map(h=>{const q=quotes.find(q=>q.symbol===h.symbol),p=finite(q?.price);const value=p!==null&&p>=0?h.shares*p:null;return {...h,cost:h.shares*h.averagePrice,value,gain:value===null?null:value-h.shares*h.averagePrice,quote:q};});
 const cost=positions.reduce((s,p)=>s+p.cost,0),complete=positions.every(p=>p.value!==null);
 const value=complete?positions.reduce((s,p)=>s+p.value!,0):null;
 const groups=new Map<string,number>();
 if(value!==null) for(const p of positions){const issuer=stocks.find(s=>s.symbol===p.symbol)?.issuer??p.symbol;groups.set(issuer,(groups.get(issuer)??0)+p.value!)}
 const allocation=[...groups].map(([name,v])=>({name,value:v,weight:value?100*v/value:0})).sort((a,b)=>b.value-a.value);
 return {positions,cost,value,gain:value===null?null:value-cost,gainPercent:value===null?null:percentChange(value,cost),allocation,complete};
}
