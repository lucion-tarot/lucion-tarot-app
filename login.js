const {cleanPhone,readBody,send,bad,getOrCreateUser}=require('./_utils');
module.exports=async (req,res)=>{
  try{
    if(req.method!=='POST') return bad(res,'POST만 지원합니다.',405);
    const {name,phone}=await readBody(req);
    if(!String(name||'').trim()) return bad(res,'이름을 입력해주세요.');
    if(cleanPhone(phone).length<8) return bad(res,'휴대폰 번호를 정확히 입력해주세요.');
    const user=await getOrCreateUser(name,phone);
    send(res,200,{ok:true,user});
  }catch(e){ bad(res,'로그인 처리 중 오류가 발생했습니다.',500); }
};
