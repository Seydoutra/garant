// Independent reference fixture generator. Public test seed only; never production.
import {createPrivateKey,createPublicKey,sign,verify,createHash} from 'node:crypto';
import {deflateSync,inflateSync} from 'node:zlib';
import {writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../../apps/landing/package.json',import.meta.url));
const qr=require('qrcode');
const B=Buffer;
function head(m,n){if(n<24)return B.from([m*32+n]);if(n<256)return B.from([m*32+24,n]);if(n<65536)return B.from([m*32+25,n>>8,n&255]);const b=B.alloc(5);b[0]=m*32+26;b.writeUInt32BE(n,1);return b;}
function enc(x){if(Number.isInteger(x))return head(x>=0?0:1,x>=0?x:-1-x);if(typeof x==='string'){const b=B.from(x);return B.concat([head(3,b.length),b]);}if(B.isBuffer(x))return B.concat([head(2,x.length),x]);if(Array.isArray(x))return B.concat([head(4,x.length),...x.map(enc)]);if(x instanceof Map){const e=[...x].map(([k,v])=>[enc(k),enc(v)]).sort((a,b)=>B.compare(a[0],b[0]));return B.concat([head(5,e.length),...e.flat()]);}throw Error('Unsupported CBOR value');}
const alphabet='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
function base45(b){let s='';for(let i=0;i<b.length;i+=2){let n=i+1<b.length?b[i]*256+b[i+1]:b[i];s+=alphabet[n%45];n=Math.floor(n/45);s+=alphabet[n%45];if(i+1<b.length)s+=alphabet[Math.floor(n/45)];}return s;}
const seed='9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60';
const key=createPrivateKey({key:B.concat([B.from('302e020100300506032b657004220420','hex'),B.from(seed,'hex')]),format:'der',type:'pkcs8'});
const pub=createPublicKey(key);const pubhex=pub.export({format:'der',type:'spki'}).subarray(-32).toString('hex');
const emptySig=sign(null,B.alloc(0),key).toString('hex');
if(emptySig!=='e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b')throw Error('RFC 8032 test failed');
const scAlphabet='0123456789ABCDEFGHJKMNPQRSTVWXYZ';const checkAlphabet=scAlphabet+'*~$=U';
function shortcode(s){let r=0;for(const c of s)r=(r*32+scAlphabet.indexOf(c))%37;return `GRT-${s.slice(0,4)}-${s.slice(4)}${checkAlphabet[r]}`;}
const kid='DEMO0001';const id=B.from('00112233445546778899aabbccddeeff','hex');
const ph=createHash('sha256').update('normalized-photo-reference-bytes').digest().subarray(0,16);
function vector(name,title){const payload=enc(new Map([[0,1],[1,kid],[2,id],[3,shortcode('7K4P92X')],[4,name.normalize('NFC')],[5,2],[6,title.normalize('NFC')],[7,Math.floor(Date.UTC(2026,9,14)/86400000)],[8,Math.floor(Date.UTC(2028,9,14)/86400000)],[9,ph]]));const protectedBytes=enc(new Map([[1,-8],[4,B.from(kid)]]));const sigStructure=enc(['Signature1',protectedBytes,B.alloc(0),payload]);const signature=sign(null,sigStructure,key);if(!verify(null,sigStructure,pub,signature))throw Error('Signature failed');const cose=B.concat([B.from([0xd2]),enc([protectedBytes,new Map(),payload,signature])]);const compressed=deflateSync(cose,{level:9});if(!inflateSync(compressed).equals(cose))throw Error('Compression failed');const grt1='GRT1:'+base45(compressed);const url='https://verify.example.invalid/v#'+encodeURIComponent(grt1);const q=qr.create(url,{errorCorrectionLevel:'M'});const modules=q.modules.size;return {name,title,kid,shortcode:shortcode('7K4P92X'),payloadHex:payload.toString('hex'),protectedHex:protectedBytes.toString('hex'),sigStructureHex:sigStructure.toString('hex'),signatureHex:signature.toString('hex'),coseHex:cose.toString('hex'),zlibHex:compressed.toString('hex'),grt1,url,measurements:{payloadBytes:payload.length,coseBytes:cose.length,zlibBytes:compressed.length,base45Characters:grt1.length-5,urlBytes:B.byteLength(url),qrVersion:q.version,modules,quietZoneModules:4,pitchAt25mm:25/(modules+8),recommendedSideMm:Math.ceil((modules+8)*.35)}};}
const fixture={format:'GRT1-v1',referenceEngine:process.version,publicTestSeedHex:seed,publicKeyHex:pubhex,rfc8032:{messageHex:'',signatureHex:emptySig},photoPreimage:'normalized-photo-reference-bytes',typeEnum:{diploma:1,attestation:2,certificate:3,employment:4,internship:5},vectors:[vector('Aminata Exemple','Formation en montage vidéo'),vector('Marie-Clémence Aminata Fatoumata Diallo-Traoré Exemple','Certification professionnelle en administration des systèmes informatiques, cybersécurité appliquée et gestion des infrastructures numériques')],shortcodes:['0000000','0000001','7K4P92X','ZZZZZZZ'].map(x=>({data:x,code:shortcode(x)}))};
writeFileSync(new URL('../tests/fixtures/grt1-reference.json',import.meta.url),JSON.stringify(fixture,null,2)+'\n');console.log(JSON.stringify({rfc8032:true,shortcodes:fixture.shortcodes,measurements:fixture.vectors.map(v=>v.measurements)},null,2));
