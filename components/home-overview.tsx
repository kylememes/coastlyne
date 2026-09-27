'use client';
import Link from 'next/link';
import {Waves,Sunrise,Anchor,Layers,Compass,ArrowUpRight} from 'lucide-react';
import {useSaved} from '@/lib/storage';
import {cashflow,goalProjection,type FlowItem,type Goal} from '@/lib/finance';
import {paydayPlan,todayString} from '@/lib/current';
import {project,money,type Assumptions} from '@/lib/projection';
import {Progress} from './ui/progress';
const emptyFlow:FlowItem[]=[];
const emptyGoals:Goal[]=[];
const emptyAccount={balance:0,reserve:0,confirmed:false,asOf:''};
export function HomeOverview(){
 const [items,,flowReady]=useSaved<FlowItem[]>('current',emptyFlow);
 const [account]=useSaved('current-account',emptyAccount);
 const [horizon,,horizonReady]=useSaved<Assumptions|null>('horizon',null);
 const [goals,,goalsReady]=useSaved<Goal[]>('goals',emptyGoals);
 const f=cashflow(items),today=todayString(),plan=paydayPlan(items,today,account.balance,account.reserve);
 const complete=flowReady&&account.confirmed&&account.asOf===today&&!!plan.next&&!plan.undated.length;
 const date=plan.next?new Date(plan.next.date+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'}):'';
 return <section id="your-overview" className="section home-overview" aria-label="Your financial overview"><div className="section-heading"><div><span className="eyebrow">YOUR WORLD, CONNECTED</span><h2>Your next step starts here.</h2></div><span className="muted">Your plans, saved on this device.</span></div><div className="home-featured-grid">
 <Link href="/current" className="glass dashboard-card home-current"><Waves/><span className="eyebrow">CURRENT</span><h2>Your money, in motion.</h2>{flowReady&&items.length?<><strong>{money(complete?plan.available:f.remaining)}</strong><p>{complete?`${plan.available<0?'planned shortfall':'available after your plan'} before payday on ${date}`:'remaining in an average month'} · {f.savingsRate.toFixed(1)}% savings rate</p>{!complete&&<p className="home-card-note">Finish your payday plan for a view of what’s available before your next check.</p>}</>:<p>Give your paychecks, bills, and savings a schedule. See what’s available before your next payday.</p>}<span className="text-button">Open Current <ArrowUpRight size={18}/></span></Link>
 <Link href="/investment-horizon" className="glass dashboard-card horizon-summary"><Sunrise/><span className="eyebrow">INVESTMENT HORIZON</span><h2>The view ahead.</h2>{horizonReady&&horizon?<><strong>{money(project(horizon).at(-1)!.portfolio)}</strong><p>projected at age {horizon.retirementAge} · future dollars</p><p className="home-card-note">Continue with your saved assumptions and explore what could change.</p></>:<p>See where time, contributions, and investment growth could take you. Make the journey your own.</p>}<span className="text-button">Find your investment horizon <ArrowUpRight size={18}/></span></Link>
 </div><div className="home-tools-grid"><Link href="/islands" className="product-card home-islands"><div className="card-top"><Anchor size={28}/><span className="pill">{goalsReady&&goals.length?`${goals.length} destination${goals.length===1?'':'s'}`:'Explore now'}</span></div><h3>Islands</h3>{goalsReady&&goals.length?<div className="home-goal-preview">{goals.slice(0,2).map(g=><div key={g.id}><b>{g.name}</b><span>{money(g.saved)} of {money(g.target)}</span><Progress value={goalProjection(g).progress} aria-label={g.name+' progress'}/></div>)}{goals.length>2&&<p>+{goals.length-2} more destinations</p>}</div>:<p>Turn individual goals into destinations.</p>}<span className="text-button">Explore Islands <ArrowUpRight size={18}/></span></Link><Link href="/in-depth" className="product-card"><div className="card-top"><Layers size={28}/><span className="pill">Explore now</span></div><h3>In Depth</h3><p>Take a deeper dive with advanced analytics.</p><span className="text-button">Compare your possibilities <ArrowUpRight size={18}/></span></Link><Link href="/compass" className="product-card"><div className="card-top"><Compass size={28}/><span className="pill">Explore now</span></div><h3>Compass</h3><p>Find the tools and information that point you forward.</p><span className="text-button">Find a calculator <ArrowUpRight size={18}/></span></Link></div></section>
}
