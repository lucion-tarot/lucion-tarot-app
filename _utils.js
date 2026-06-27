const DEFAULT_DB_URL = 'https://lucion-tarot-2026-b869a-default-rtdb.firebaseio.com';
function cleanPhone(phone=''){ return String(phone||'').replace(/\D/g,''); }
function maskName(name=''){
  name=String(name||'').trim();
  if(!name) return '사용자';
  if(name.length<=1) return name;
  if(name.length===2) return name[0]+'*';
  return name[0]+'*'+name[name.length-1];
}
function maskPhone(phone=''){
  const p=cleanPhone(phone);
  return p.length>=8 ? p.slice(0,3)+'****'+p.slice(-4) : p;
}
function dbUrl(path){
  const base=(process.env.FIREBASE_DATABASE_URL || DEFAULT_DB_URL).replace(/\/$/,'');
  return base + path + '.json';
}
async function dbGet(path){
  const r=await fetch(dbUrl(path));
  if(!r.ok) throw new Error('DB_GET_FAILED');
  return await r.json();
}
async function dbPut(path,data){
  const r=await fetch(dbUrl(path),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  if(!r.ok) throw new Error('DB_PUT_FAILED');
  return await r.json();
}
async function dbPatch(path,data){
  const r=await fetch(dbUrl(path),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  if(!r.ok) throw new Error('DB_PATCH_FAILED');
  return await r.json();
}
async function dbDelete(path){
  const r=await fetch(dbUrl(path),{method:'DELETE'});
  if(!r.ok) throw new Error('DB_DELETE_FAILED');
  return await r.json();
}
async function readBody(req){
  if(req.body && typeof req.body === 'object') return req.body;
  let raw='';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}
function send(res,status,data){
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.status(status).send(JSON.stringify(data));
}
function bad(res,message='잘못된 요청입니다.',status=400){ send(res,status,{ok:false,message}); }
function cleanName(name=''){ return String(name||'').trim().replace(/\s+/g,' '); }
function freeNameKey(name=''){ return encodeURIComponent(cleanName(name)).replace(/\./g,'%2E'); }
function isPaidMember(u={}){ return Number(u.issued||0)>0 || Number(u.credits||0)>0 || u.memberType==='paid' || u.isPaid===true; }
async function getOrCreateUser(name,phone){
  const p=cleanPhone(phone);
  if(!p) throw new Error('PHONE_REQUIRED');
  const n=cleanName(name);
  let u=await dbGet('/users/'+p);
  const now=Date.now();
  const usedByName=await dbGet('/freeNames/'+freeNameKey(n));
  if(!u){
    u={name:n, phone:p, maskedName:maskName(n), maskedPhone:maskPhone(p), freeNameKey:freeNameKey(n), credits:0, issued:0, freeUsed:!!(usedByName&&usedByName.freeUsed), memberType:'free', isPaid:false, createdAt:now, loginAt:now, updatedAt:now};
    await dbPut('/users/'+p,u);
  }else{
    const paid=isPaidMember(u);
    u={...u, name:n||u.name||'', phone:p, maskedName:maskName(n||u.name), maskedPhone:maskPhone(p), freeNameKey:freeNameKey(n||u.name), credits:Number(u.credits||0), issued:Number(u.issued||0), freeUsed:!!u.freeUsed||!!(usedByName&&usedByName.freeUsed), memberType:paid?'paid':'free', isPaid:paid, createdAt:Number(u.createdAt||now), loginAt:now, updatedAt:now};
    await dbPatch('/users/'+p,u);
  }
  return u;
}
module.exports={cleanPhone,maskName,maskPhone,cleanName,freeNameKey,isPaidMember,dbGet,dbPut,dbPatch,dbDelete,readBody,send,bad,getOrCreateUser};
