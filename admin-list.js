const {cleanPhone,maskName,maskPhone,dbGet,dbDelete,readBody,send,bad,isPaidMember}=require('./_utils');
const FREE_MEMBER_EXPIRE_MS=30*24*60*60*1000;
module.exports=async (req,res)=>{
  try{
    if(req.method!=='POST') return bad(res,'POST만 지원합니다.',405);
    const {pin}=await readBody(req);
    if(String(pin)!==String(process.env.ADMIN_PIN||'0000')) return bad(res,'관리자 PIN이 맞지 않습니다.',403);
    const users=await dbGet('/users')||{};
    const now=Date.now();
    const rows=[];
    for(const [k,u] of Object.entries(users)){
      const phone=cleanPhone(u.phone||k), name=String(u.name||'').trim();
      if(!phone||!name) continue;
      const paid=isPaidMember(u);
      const created=Number(u.createdAt||u.loginAt||u.updatedAt||now);
      if(!paid && now-created>FREE_MEMBER_EXPIRE_MS){ try{await dbDelete('/users/'+k); await dbDelete('/readings/'+phone);}catch(e){}; continue; }
      rows.push({key:phone,name,maskedName:maskName(name),phone,maskedPhone:maskPhone(phone),credits:Number(u.credits||0),issued:Number(u.issued||0),freeUsed:!!u.freeUsed,memberType:paid?'paid':'free',updatedAt:u.updatedAt||0,createdAt:created});
    }
    rows.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
    send(res,200,{ok:true,users:rows,paid:rows.filter(u=>u.memberType==='paid'),free:rows.filter(u=>u.memberType==='free')});
  }catch(e){ bad(res,'관리자 목록 조회 중 오류가 발생했습니다.',500); }
};
