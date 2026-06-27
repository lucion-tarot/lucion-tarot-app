const {cleanPhone,dbGet,dbPatch,readBody,send,bad,freeNameKey}=require('./_utils');
module.exports=async (req,res)=>{
  try{
    if(req.method!=='POST') return bad(res,'POST만 지원합니다.',405);
    const {phone}=await readBody(req);
    const p=cleanPhone(phone);
    if(!p) return bad(res,'로그인이 필요합니다.');
    const u=await dbGet('/users/'+p);
    if(!u) return bad(res,'회원 정보를 찾을 수 없습니다.',404);
    const nk=freeNameKey(u.name||'');
    const nameFree= nk ? await dbGet('/freeNames/'+nk) : null;
    let credits=Number(u.credits||0), freeUsed=!!u.freeUsed||!!(nameFree&&nameFree.freeUsed), isFree=false;
    if(!freeUsed){ freeUsed=true; isFree=true; if(nk) await dbPatch('/freeNames/'+nk,{name:u.name||'',freeUsed:true,updatedAt:Date.now()}); }
    else {
      if(credits<=0) return bad(res,'질문권이 부족합니다.',402);
      credits -= 1;
    }
    await dbPatch('/users/'+p,{credits,freeUsed,updatedAt:Date.now()});
    send(res,200,{ok:true,isFree,credits,freeUsed});
  }catch(e){ bad(res,'질문권 차감 중 오류가 발생했습니다.',500); }
};
