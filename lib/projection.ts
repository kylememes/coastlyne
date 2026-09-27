export type Assumptions = { age:number; retirementAge:number; balance:number; salary:number; contribution:number; mode:"percent"|"amount"; frequency:number; match:number; matchCap:number; returns:number; salaryGrowth:number; inflation:number; withdrawal:number };
export const defaults:Assumptions={age:30,retirementAge:65,balance:25000,salary:75000,contribution:10,mode:"percent",frequency:12,match:100,matchCap:4,returns:7,salaryGrowth:2,inflation:2.5,withdrawal:4};
export type Point={age:number;year:number;portfolio:number;personal:number;employer:number;growth:number;initial:number};
export function project(a:Assumptions,startYear=2026):Point[]{
 if(Object.values(a).some(v=>typeof v==='number'&&!Number.isFinite(v))) throw Error('All inputs must be finite.');
 if(a.retirementAge<=a.age||a.returns<=-100||a.inflation<=-100||a.frequency<1) throw Error('Invalid projection assumptions.');
 let portfolio=a.balance,personal=0,employer=0;
 const rows:Point[]=[{age:a.age,year:startYear,portfolio,personal,employer,growth:0,initial:a.balance}];
 const rate=Math.pow(1+a.returns/100,1/a.frequency)-1;
 for(let y=1;y<=a.retirementAge-a.age;y++){
  const salary=a.salary*Math.pow(1+a.salaryGrowth/100,y-1);
  const annual=a.mode==='percent'?salary*a.contribution/100:a.contribution*a.frequency;
  const match=Math.min(annual,salary*a.matchCap/100)*a.match/100;
  for(let period=0;period<a.frequency;period++){portfolio=portfolio*(1+rate)+(annual+match)/a.frequency;}
  personal+=annual;employer+=match;
  rows.push({age:a.age+y,year:startYear+y,portfolio,personal,employer,growth:portfolio-a.balance-personal-employer,initial:a.balance});
 }
 return rows;
}
export const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export const compact=(n:number)=>new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n);
