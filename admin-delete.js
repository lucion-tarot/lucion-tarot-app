const {cleanPhone,dbDelete,readBody,send,bad}=require('./_utils');
module.exports=async (req,res)=>{
  try{
    if(req.method!=='POST') return bad(res,'POST만 지원합니다.',405);
    const {pin,phone}=await readBody(req);
    if(String(pin)!==String(process.env.ADMIN_PIN||'0000')) return bad(res,'관리자 PIN이 맞지 않습니다.',403);
    const p=cleanPhone(phone);
    if(!p) return bad(res,'삭제할 회원을 찾지 못했습니다.');
    await dbDelete('/users/'+p);
    await dbDelete('/readings/'+p);
    send(res,200,{ok:true});
  }catch(e){ bad(res,'회원 삭제 중 오류가 발생했습니다.',500); }
};
