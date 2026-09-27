'use client';
import {useEffect,useState,useRef} from 'react';
import {parseSaved} from './saved-data';
const prefix='guidance:v2:';
export function readSaved<T>(key:string,fallback:T):T{try{return parseSaved(key,localStorage.getItem(prefix+key),fallback)}catch{return fallback}}
export function useSaved<T>(key:string,fallback:T){
 const[value,setValue]=useState<T>(fallback);const[ready,setReady]=useState(false);const[error,setError]=useState(false);const fallbackRef=useRef(fallback);const loaded=useRef(false);
 useEffect(()=>{try{setValue(parseSaved(key,localStorage.getItem(prefix+key),fallbackRef.current))}catch{setError(true)}loaded.current=true;setReady(true)},[key]);
 useEffect(()=>{if(!ready||!loaded.current)return;try{localStorage.setItem(prefix+key,JSON.stringify({version:2,value}));setError(false)}catch{setError(true)}},[key,value,ready]);
 return [value,setValue,ready,error] as const;
}
export function clearSaved(){try{Object.keys(localStorage).filter(k=>k.startsWith('guidance:')).forEach(k=>localStorage.removeItem(k));window.location.reload()}catch{window.alert('This browser could not clear storage. Use your browser’s site-data settings.')}}
