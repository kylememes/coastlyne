// Curated starting universe, not a claim about today's market-cap ranking.
export const stocks = [
 ['NVDA','NVIDIA','nvidia'],['AAPL','Apple','apple'],['MSFT','Microsoft','microsoft'],
 ['AMZN','Amazon','amazon'],['GOOGL','Alphabet · Class A','alphabet'],['GOOG','Alphabet · Class C','alphabet'],
 ['META','Meta Platforms','meta'],['AVGO','Broadcom','broadcom'],['TSLA','Tesla','tesla'],['MU','Micron','micron'],
].map(([symbol,name,issuer])=>({symbol,name,issuer}));
export const isSymbol=(s:string)=>stocks.some(x=>x.symbol===s);
export type Row=Record<string,string|number|null>;
export type Quote={symbol:string;price:number|null;change:number|null;changePercentage:number|null;marketCap:number|null;timestamp:number|null;volume:number|null};
export type Holding={symbol:string;shares:number;averagePrice:number};
export type Packet={rows:Row[];fetchedAt:string;source:string;latency:string;session:string;message?:string};
export const sections=['Overview','Financials','DCF','Earnings','News','AI analysis','Portfolio'] as const;
export type Section=typeof sections[number];
