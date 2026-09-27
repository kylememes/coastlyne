import {ImageResponse} from 'next/og';
export const alt='CURRIVAL — Build the current. Reach your horizon.';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',padding:85,background:'linear-gradient(140deg,#edfffa,#8ddedb)',color:'#164b58'}}><div style={{fontSize:25,letterSpacing:8,marginBottom:60}}>CURRIVAL</div><div style={{fontSize:68,letterSpacing:-4}}>Build the current.</div><div style={{fontSize:68,fontStyle:'italic',letterSpacing:-3}}>Reach your horizon.</div><div style={{fontSize:23,marginTop:45}}>Investment Horizon · Your future, in perspective.</div></div>,size)}
