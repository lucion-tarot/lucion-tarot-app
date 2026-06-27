const {cleanPhone,dbGet,dbPatch,readBody,send,bad,maskName,maskPhone}=require('./_utils');
module.exports=async (req,res)=>{
  try{
    if(req.method!=='POST') return bad(res,'POST만 지원합니다.',405);
    const {pin,phone,credits}=await readBody(req);
    if(String(pin)!==String(process.env.ADMIN_PIN||'0000')) return bad(res,'관리자 PIN이 맞지 않습니다.',403);
    const p=cleanPhone(phone); const add=Number(credits||0);
    if(!p || add<=0) return bad(res,'지급할 회원과 질문권 수를 확인해주세요.');
    const u=await dbGet('/users/'+p)||{phone:p,credits:0,issued:0,freeUsed:false,createdAt:Date.now()};
    const newCredits=Number(u.credits||0)+add, issued=Number(u.issued||0)+add;
    await dbPatch('/users/'+p,{name:u.name||'',phone:p,maskedPhone:maskPhone(p),maskedName:u.maskedName||maskName(u.name||''),credits:newCredits,issued,memberType:'paid',isPaid:true,paidAt:u.paidAt||Date.now(),lastChargeAt:Date.now(),updatedAt:Date.now(),createdAt:u.createdAt||Date.now()});
    send(res,200,{ok:true,credits:newCredits,issued});
  }catch(e){ bad(res,'질문권 지급 중 오류가 발생했습니다.',500); }
};
