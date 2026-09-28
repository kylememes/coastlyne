import {NextRequest,NextResponse} from 'next/server';
import {getData,resources,DataError,type Resource} from '@/lib/research/provider';
export async function GET(req:NextRequest){
 const kind=req.nextUrl.searchParams.get('kind') as Resource,period=req.nextUrl.searchParams.get('period')??'annual';
 if(!resources.includes(kind)||!['annual','quarter'].includes(period))return NextResponse.json({error:'Invalid dataset.'},{status:400});
 const symbols=(req.nextUrl.searchParams.get('symbols')??'').split(',');
 try{return NextResponse.json(await getData(kind,symbols,period),{headers:{'Cache-Control':'private, no-cache'}})}catch(e){return NextResponse.json({error:e instanceof DataError?e.message:'Data is temporarily unavailable.'},{status:e instanceof DataError?e.status:500})}
}
