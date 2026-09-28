import {NextRequest,NextResponse} from 'next/server';
import {analyze,analysisInput} from '@/lib/research/ai';
import {DataError} from '@/lib/research/provider';
export const maxDuration=60;
export async function POST(req:NextRequest){
 const origin=req.headers.get('origin');
 let sameOrigin=false;try{sameOrigin=!!origin&&new URL(origin).host===req.headers.get('host')}catch{}
 if(!sameOrigin)return NextResponse.json({error:'Request origin is not allowed.'},{status:403});
 try{const text=await req.text();if(text.length>12000)return NextResponse.json({error:'Request too large.'},{status:413});const input=analysisInput.safeParse(JSON.parse(text));if(!input.success)return NextResponse.json({error:'Choose a supported company or valid holdings.'},{status:400});return NextResponse.json(await analyze(input.data),{headers:{'Cache-Control':'private, no-store'}})}catch(e){return NextResponse.json({error:e instanceof DataError?e.message:e instanceof SyntaxError?'Invalid request.':'Analysis is temporarily unavailable.'},{status:e instanceof DataError?e.status:e instanceof SyntaxError?400:500})}
}
