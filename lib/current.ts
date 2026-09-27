export type Frequency='weekly'|'biweekly'|'semimonthly'|'monthly'|'yearly'|'once';
export type FlowItem={id:string;name:string;amount:number;kind:'income'|'fixed'|'variable'|'saving';frequency?:Frequency;date?:string;secondDay?:number;mode?:'scheduled'|'payday-amount'|'payday-percent';incomeId?:string};
export const frequencies:Record<Frequency,string>={weekly:'Weekly',biweekly:'Every two weeks',semimonthly:'Twice a month',monthly:'Monthly',yearly:'Yearly',once:'One time'};
const periods={weekly:52,biweekly:26,semimonthly:24,monthly:12,yearly:1,once:0};
export function monthlyAmount(item:FlowItem,items:FlowItem[]):number{
 if(item.kind==='saving'&&item.mode&&item.mode!=='scheduled'){
  const income=items.find(i=>i.kind==='income'&&i.id===item.incomeId);if(!income)return 0;
  return (item.mode==='payday-percent'?income.amount*item.amount/100:item.amount)*periods[income.frequency??'monthly']/12;
 }
 return item.amount*periods[item.frequency??'monthly']/12;
}
export function validDate(value:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T00:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===value}
export function todayString(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function monthDate(year:number,month:number,day:number){return new Date(Date.UTC(year,month,Math.min(day,new Date(Date.UTC(year,month+1,0)).getUTCDate()))).toISOString().slice(0,10)}
export function datesBetween(item:FlowItem,start:string,end:string):string[]{
 if(!item.date||!validDate(item.date)||!validDate(start)||!validDate(end)||end<start)return [];
 const anchor=new Date(item.date+'T00:00:00Z'),from=new Date(start+'T00:00:00Z'),to=new Date(end+'T00:00:00Z');const freq=item.frequency??'monthly';const out:string[]=[];
 const add=(d:string)=>{if(d>=start&&d<=end&&d>=item.date!&&!out.includes(d))out.push(d)};
 if(freq==='once'){add(item.date);return out}
 if(freq==='weekly'||freq==='biweekly'){const step=(freq==='weekly'?7:14)*86400000;for(let t=+anchor+Math.max(0,Math.ceil((+from-+anchor)/step))*step;t<=+to;t+=step)add(new Date(t).toISOString().slice(0,10));return out}
 if(freq==='yearly'){for(let y=from.getUTCFullYear();y<=to.getUTCFullYear();y++)add(monthDate(y,anchor.getUTCMonth(),anchor.getUTCDate()));return out}
 for(let m=from.getUTCFullYear()*12+from.getUTCMonth();m<=to.getUTCFullYear()*12+to.getUTCMonth();m++){const y=Math.floor(m/12),mo=m%12;add(monthDate(y,mo,anchor.getUTCDate()));if(freq==='semimonthly')add(monthDate(y,mo,item.secondDay??15))}
 return out.sort();
}
export function addDays(date:string,days:number){return new Date(+new Date(date+'T00:00:00Z')+days*86400000).toISOString().slice(0,10)}
export function upcoming(items:FlowItem[],start:string,end:string){return items.flatMap(item=>{
 const source=item.kind==='saving'&&item.mode&&item.mode!=='scheduled'?items.find(i=>i.kind==='income'&&i.id===item.incomeId):item;
 if(!source)return [];
 const amount=item.mode==='payday-percent'&&item.kind==='saving'?source.amount*item.amount/100:item.amount;
 return datesBetween(source,start,end).map(date=>({id:item.id,date,name:item.name,kind:item.kind,amount}));
 }).sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name))}
export function paydayPlan(items:FlowItem[],today:string,balance:number,reserve:number){
 const next=upcoming(items,addDays(today,1),addDays(today,370)).find(i=>i.kind==='income');
 const end=next?addDays(next.date,-1):addDays(today,13);
 const events=upcoming(items,today,end);const outflows=events.filter(i=>i.kind!=='income').reduce((s,i)=>s+i.amount,0);
 return {next,end,events,outflows,available:balance-reserve-outflows,undated:items.filter(i=>{const source=i.kind==='saving'&&i.mode&&i.mode!=='scheduled'?items.find(x=>x.id===i.incomeId):i;return !source?.date||!validDate(source.date)||(source.frequency==='semimonthly'&&Number(source.date.slice(-2))===(source.secondDay??15))})};
}
export type Transaction={date:string;name:string;amount:number};
export function parseCSV(text:string):Transaction[]{
 const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell=''}else cell+=c}
 if(quoted)throw Error('An unfinished quoted field was found. Export a fresh CSV from your bank.');row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
 if(rows.length<2)throw Error('The file needs a header and at least one transaction.');
 const headers=rows.shift()!.map(x=>x.replace(/^\uFEFF/,'').trim().toLowerCase());const col=(names:string[])=>headers.findIndex(x=>names.includes(x));
 const dateCol=col(['date','transaction date','posting date','posted date']),nameCol=col(['description','name','merchant','transaction description','payee']),amountCol=col(['amount','transaction amount']),debit=col(['debit','withdrawal','withdrawals']),credit=col(['credit','deposit','deposits']);
 if(dateCol<0||nameCol<0||(amountCol<0&&(debit<0||credit<0)))throw Error('Use columns Date, Description, Amount (negative for money out), or Date, Description, Debit, Credit.');
 const number=(s:string)=>{if(!s?.trim())return 0;const cleaned=s.trim().replace(/[$,\s]/g,'').replace(/^\((.*)\)$/,'-$1');const n=Number(cleaned);if(!Number.isFinite(n)||Math.abs(n)>1e12)throw Error('A transaction amount could not be read. Check the CSV amounts.');return n};
 return rows.map((r,index)=>{let date=r[dateCol]?.trim()??'';const us=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(date);if(us)date=`${us[3]}-${us[1].padStart(2,'0')}-${us[2].padStart(2,'0')}`;if(!validDate(date)||!r[nameCol]?.trim())throw Error(`Check the date and description on row ${index+2}. Use YYYY-MM-DD or MM/DD/YYYY dates.`);return {date,name:r[nameCol].trim().slice(0,60),amount:amountCol>=0?number(r[amountCol]):Math.abs(number(r[credit]))-Math.abs(number(r[debit]))}});
}
export function recurringSuggestions(transactions:Transaction[]):(FlowItem&{count:number;reason:string})[]{
 const groups=new Map<string,Transaction[]>();for(const t of transactions){if(!t.amount||/\b(transfer|payment thank you|payment received)\b/i.test(t.name))continue;const key=t.name.toLowerCase().replace(/\d+/g,'').replace(/[^a-z ]/g,'').replace(/\s+/g,' ').trim()+(t.amount>0?'+':'-');if(!key.replace(/[+-]/g,''))continue;groups.set(key,[...(groups.get(key)??[]),t])}
 return [...groups.entries()].flatMap(([key,group])=>{const g=[...new Map(group.map(t=>[`${t.date}:${t.amount}`,t])).values()].sort((a,b)=>a.date.localeCompare(b.date));if(g.length<3)return [];const gaps=g.slice(1).map((t,i)=>(+new Date(t.date)-+new Date(g[i].date))/86400000);const avg=gaps.reduce((s,n)=>s+n,0)/gaps.length;let frequency:Frequency|undefined;
 if(gaps.every(n=>Math.abs(n-7)<=2))frequency='weekly';else if(gaps.every(n=>Math.abs(n-14)<=2)&&Math.abs(avg-14)<=.6)frequency='biweekly';else if(gaps.every(n=>n>=12&&n<=19)&&avg>14.6)frequency='semimonthly';else if(gaps.every(n=>n>=26&&n<=35))frequency='monthly';else if(gaps.every(n=>n>=350&&n<=380))frequency='yearly';if(!frequency)return [];
 const amount=g.reduce((s,t)=>s+Math.abs(t.amount),0)/g.length;const variable=g.some(t=>Math.abs(Math.abs(t.amount)-amount)>Math.max(1,amount*.05));const last=g.at(-1)!;
 return [{id:'import-'+key,name:last.name,amount:Math.round(amount*100)/100,kind:last.amount>0?'income':variable?'variable':'fixed',frequency,date:last.date,secondDay:frequency==='semimonthly'?new Date(g.at(-2)!.date).getUTCDate():undefined,count:g.length,reason:`${g.length} payments · ${variable?'amount varies; average shown':'similar amounts'} · confirm schedule`}];
 });
}
