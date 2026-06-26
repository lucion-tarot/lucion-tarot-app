const {cleanPhone,maskName,maskPhone,dbGet,readBody,send,bad}=require('./_utils');
module.exports=async (req,res)=>{
  try{
    if(req.method!=='POST') return bad(res,'POST만 지원합니다.',405);
    const {pin}=await readBody(req);
    if(String(pin)!==String(process.env.ADMIN_PIN||'0000')) return bad(res,'관리자 PIN이 맞지 않습니다.',403);
    const users=await dbGet('/users')||{};
    const rows=Object.entries(users).map(([k,u])=>{
      const phone=cleanPhone(u.phone||k);
      return {key:phone,name:u.name||'',maskedName:maskName(u.name||''),phone,maskedPhone:maskPhone(phone),credits:Number(u.credits||0),issued:Number(u.issued||0),freeUsed:!!u.freeUsed,updatedAt:u.updatedAt||0};
    }).filter(u=>u.phone && (u.credits>0 || u.issued>0)).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
    send(res,200,{ok:true,users:rows});
  }catch(e){ bad(res,'관리자 목록 조회 중 오류가 발생했습니다.',500); }
};
