import {z} from 'zod';
export const packetSchema=z.object({rows:z.array(z.record(z.union([z.string(),z.number().finite(),z.null()]))),fetchedAt:z.string(),source:z.string(),latency:z.string(),session:z.string(),message:z.string().optional()});
export const errorSchema=z.object({error:z.string()});
export const briefingSchema=z.object({sections:z.array(z.object({title:z.string(),text:z.string(),sourceIds:z.array(z.number().int())})),sources:z.array(z.object({id:z.number().int(),title:z.string(),url:z.string().url(),date:z.string()})),generatedAt:z.string()});
