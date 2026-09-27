import {ImageResponse} from 'next/og';
export const alt='GUIDANCE — Your financial future, crystal clear.';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',padding:85,background:'linear-gradient(140deg,#edfffa,#8ddedb)',color:'#164b58'}}><div style={{fontSize:25,letterSpacing:8,marginBottom:60}}>GUIDANCE</div><div style={{fontSize:76,letterSpacing:-4}}>Your financial future,</div><div style={{fontSize:76,fontStyle:'italic',letterSpacing:-3}}>crystal clear.</div><div style={{fontSize:23,marginTop:45}}>Explore Horizon · Retirement, in perspective.</div></div>,size)}
