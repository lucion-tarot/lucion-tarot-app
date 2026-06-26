const {cleanPhone,dbGet,send,bad}=require('./_utils');
module.exports=async (req,res)=>{
  try{
    const phone=cleanPhone(req.query.phone||'');
    if(!phone) return bad(res,'휴대폰 번호가 필요합니다.');
    const user=await dbGet('/users/'+phone);
    const readings=await dbGet('/readings/'+phone);
    const history=readings ? Object.values(readings).sort((a,b)=>(b.id||0)-(a.id||0)).slice(0,10) : [];
    send(res,200,{ok:true,user:user||null,history});
  }catch(e){ bad(res,'회원 조회 중 오류가 발생했습니다.',500); }
};
