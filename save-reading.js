const {cleanPhone,dbGet,dbPut,dbDelete,readBody,send,bad}=require('./_utils');
module.exports=async (req,res)=>{
  try{
    if(req.method!=='POST') return bad(res,'POST만 지원합니다.',405);
    const {phone,record}=await readBody(req);
    const p=cleanPhone(phone);
    if(!p || !record || !record.id) return bad(res,'저장할 리딩 정보가 부족합니다.');
    await dbPut('/readings/'+p+'/'+record.id,record);
    const all=await dbGet('/readings/'+p) || {};
    const rows=Object.values(all).sort((a,b)=>(b.id||0)-(a.id||0));
    for(const old of rows.slice(10)) if(old && old.id) await dbDelete('/readings/'+p+'/'+old.id);
    send(res,200,{ok:true});
  }catch(e){ bad(res,'리딩 저장 중 오류가 발생했습니다.',500); }
};
