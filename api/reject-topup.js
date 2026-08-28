const { requireAdmin } = require("./_admin");

module.exports = async (req,res)=>{
  if(req.method!=="POST")return res.status(405).json({success:false,message:"Method tidak diizinkan"});
  try{
    const {admin}=await requireAdmin(req);const db=admin.firestore();const {topupId}=req.body||{};
    if(typeof topupId!=="string"||!topupId)return res.status(400).json({success:false,message:"Top up tidak valid"});
    const ref=db.collection("topups").doc(topupId);
    await db.runTransaction(async tx=>{const s=await tx.get(ref);if(!s.exists)throw Error("NOT_FOUND");if(s.data().status!=="pending")throw Error("ALREADY_PROCESSED");tx.update(ref,{status:"rejected",rejectedAt:admin.firestore.FieldValue.serverTimestamp()})});
    return res.json({success:true,message:"Top up ditolak"});
  }catch(e){const m={UNAUTHORIZED:["Tidak terautentikasi",401],FORBIDDEN:["Akses admin ditolak",403],NOT_FOUND:["Top up tidak ditemukan",404],ALREADY_PROCESSED:["Top up sudah diproses",409]};const x=m[e.message]||["Terjadi kesalahan",500];return res.status(x[1]).json({success:false,message:x[0]})}
};
