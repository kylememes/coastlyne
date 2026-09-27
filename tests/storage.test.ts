import test from 'node:test';import assert from 'node:assert/strict';import {parseSaved} from '../lib/saved-data.ts';import {defaults} from '../lib/projection.ts';
test('versioned storage preserves valid assumptions',()=>assert.deepEqual(parseSaved('horizon',JSON.stringify({version:2,value:defaults}),null),defaults));
test('malformed and old storage recover safely',()=>{for(const raw of ['{',JSON.stringify({version:1,value:defaults}),JSON.stringify({version:2,value:{age:30}}),JSON.stringify({version:2,value:{...defaults,retirementAge:20}})])assert.equal(parseSaved('horizon',raw,null),null)});
test('corrupt collections do not reach financial UI',()=>assert.deepEqual(parseSaved('goals',JSON.stringify({version:2,value:[{target:'bad'}]}),[]),[]));
