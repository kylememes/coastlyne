export function futureValue(initial:number,monthly:number,rate:number,years:number,frequency=12){
 if(![initial,monthly,rate,years,frequency].every(Number.isFinite)||initial<0||monthly<0||rate<=-100||years<0||frequency<1)throw Error('Invalid financial inputs');
 const r=Math.pow(1+rate/100,1/frequency)-1,n=years*frequency;
 return initial*Math.pow(1+r,n)+(Math.abs(r)<1e-12?monthly*12/frequency*n:monthly*12/frequency*Math.expm1(n*Math.log1p(r))/r);
}
export function requiredMonthly(target:number,initial:number,rate:number,months:number){if(months<=0)return target<=initial?0:null;const base=futureValue(initial,0,rate,months/12);const unit=futureValue(0,1,rate,months/12);return Math.max(0,(target-base)/unit)}
export function purchasingPower(value:number,inflation:number,years:number){if(inflation<=-100)throw Error('Invalid inflation');return value/Math.pow(1+inflation/100,years)}
export function fire(spending:number,assets:number,annual:number,rate:number,inflation:number,withdrawal:number){if(withdrawal<=0||spending<0||annual<0)throw Error('Invalid FIRE inputs');const target=spending/(withdrawal/100),real=((1+rate/100)/(1+inflation/100)-1)*100;let years:number|null=null;for(let m=0;m<=1200;m++){if(futureValue(assets,annual/12,real,m/12)>=target){years=m/12;break}}return {target,years,progress:target?assets/target*100:100,real}}
export type FlowItem={id:string;name:string;amount:number;kind:'income'|'fixed'|'variable'|'saving'};
export function cashflow(items:FlowItem[]){const sum=(kind:FlowItem['kind'])=>items.filter(i=>i.kind===kind).reduce((s,i)=>s+i.amount,0);const income=sum('income'),fixed=sum('fixed'),variable=sum('variable'),saving=sum('saving');return {income,fixed,variable,saving,spending:fixed+variable,remaining:income-fixed-variable-saving,savingsRate:income?saving/income*100:0,fixedRate:income?fixed/income*100:0}}
export type Goal={id:string;name:string;target:number;saved:number;date:string;monthly:number;rate:number;category:string};
export function goalProjection(g:Goal,now=new Date()){
 const d=new Date(g.date+'T00:00:00Z');const valid=Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===g.date;
 const months=valid?Math.max(0,(d.getUTCFullYear()-now.getUTCFullYear())*12+d.getUTCMonth()-now.getUTCMonth()+(d.getUTCDate()>now.getUTCDate()?1:0)):null;
 let completion:number|null=null;for(let m=0;m<=1200;m++){if(futureValue(g.saved,g.monthly,g.rate,m/12)>=g.target){completion=m;break}}
 return {months,completion,remaining:Math.max(0,g.target-g.saved),progress:g.target?Math.min(100,g.saved/g.target*100):100,required:months===null?null:requiredMonthly(g.target,g.saved,g.rate,months),projected:months===null?null:futureValue(g.saved,g.monthly,g.rate,months/12)};
}
