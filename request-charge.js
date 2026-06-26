const {cleanPhone,maskName,maskPhone,dbPut,readBody,send,bad}=require('./_utils');
module.exports=async (req,res)=>{
  try{
    if(req.method!=='POST') return bad(res,'POST만 지원합니다.',405);
    const {name,phone,price,credits}=await readBody(req);
    const p=cleanPhone(phone);
    if(!p) return bad(res,'로그인이 필요합니다.');
    const id='req_'+Date.now();
    const data={id,userKey:p,name,maskedName:maskName(name),phone:p,maskedPhone:maskPhone(p),price:Number(price||0),credits:Number(credits||0),status:'대기',createdAt:Date.now()};
    await dbPut('/chargeRequests/'+id,data);
    send(res,200,{ok:true,request:data});
  }catch(e){ bad(res,'충전 신청 저장 중 오류가 발생했습니다.',500); }
};
