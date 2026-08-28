const { requireAdmin } = require("./_admin");

module.exports = async (req,res)=>{
  if(req.method!=="POST")return res.status(405).json({success:false,message:"Method tidak diizinkan"});
  try{
    const {admin}=await requireAdmin(req);const db=admin.firestore();const {topupId}=req.body||{};
    if(typeof topupId!=="string"||!topupId)return res.status(400).json({success:false,message:"Top up tidak valid"});
    await db.runTransaction(async tx=>{
      const ref=db.collection("topups").doc(topupId);const s=await tx.get(ref);
      if(!s.exists)throw Error("NOT_FOUND");const d=s.data();
      if(d.status!=="pending")throw Error("ALREADY_PROCESSED");
      const amount=Number(d.amount);if(!Number.isFinite(amount)||amount<1000)throw Error("INVALID_AMOUNT");
      const userRef=db.collection("users").doc(d.userId);const us=await tx.get(userRef);
      if(!us.exists)throw Error("USER_NOT_FOUND");
      const u=us.data();const tr=db.collection("transactions").doc();
      tx.update(userRef,{balance:(Number(u.balance)||0)+amount});
      tx.update(ref,{status:"approved",approvedAt:admin.firestore.FieldValue.serverTimestamp()});
      tx.set(tr,{userId:d.userId,type:"TOPUP",amount,referenceId:topupId,status:"success",createdAt:admin.firestore.FieldValue.serverTimestamp()});
    });
    return res.json({success:true,message:"Top up berhasil dikonfirmasi"});
  }catch(e){const m={UNAUTHORIZED:["Tidak terautentikasi",401],FORBIDDEN:["Akses admin ditolak",403],NOT_FOUND:["Top up tidak ditemukan",404],ALREADY_PROCESSED:["Top up sudah diproses",409],INVALID_AMOUNT:["Nominal top up tidak valid",400],USER_NOT_FOUND:["User tidak ditemukan",404]};const x=m[e.message]||["Terjadi kesalahan",500];return res.status(x[1]).json({success:false,message:x[0]})}
};
