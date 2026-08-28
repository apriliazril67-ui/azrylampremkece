const { getAdmin } = require("./_admin");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({success:false,message:"Method tidak diizinkan"});
  try {
    const a = getAdmin();
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) return res.status(401).json({success:false,message:"Tidak terautentikasi"});
    const decoded = await a.auth().verifyIdToken(auth.slice(7));
    const db = a.firestore();
    const uid = decoded.uid;
    const productId = String((req.body || {}).productId || "am-premium");

    const result = await db.runTransaction(async tx => {
      const userRef = db.collection("users").doc(uid);
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new Error("USER_NOT_FOUND");
      const user = userSnap.data();
      if (user.status && user.status !== "active") throw new Error("ACCOUNT_DISABLED");

      const productRef = db.collection("products").doc(productId);
      const productSnap = await tx.get(productRef);
      if (!productSnap.exists) throw new Error("PRODUCT_NOT_FOUND");
      const product = productSnap.data();
      const price = Number(product.price);
      if (!Number.isFinite(price) || price < 0) throw new Error("INVALID_PRODUCT");
      if ((Number(user.balance) || 0) < price) throw new Error("INSUFFICIENT_BALANCE");

      const stockQuery = db.collection("stock").where("productId","==",productId).where("status","==","available").limit(1);
      const stockSnap = await tx.get(stockQuery);
      if (stockSnap.empty) throw new Error("OUT_OF_STOCK");

      const stockDoc = stockSnap.docs[0];
      const orderRef = db.collection("orders").doc();
      const txRef = db.collection("transactions").doc();

      tx.update(userRef, { balance: (Number(user.balance)||0) - price, totalOrders: (Number(user.totalOrders)||0) + 1 });
      tx.update(stockDoc.ref, { status:"sold", soldAt:a.firestore.FieldValue.serverTimestamp(), soldTo:uid });
      tx.set(orderRef, {userId:uid, productId, stockId:stockDoc.id, price, status:"success", createdAt:a.firestore.FieldValue.serverTimestamp()});
      tx.set(txRef, {userId:uid, type:"PURCHASE", amount:-price, referenceId:orderRef.id, status:"success", createdAt:a.firestore.FieldValue.serverTimestamp()});

      return { orderId:orderRef.id, item:stockDoc.data().secretValue, price };
    });

    return res.status(200).json({success:true,message:"Pembelian berhasil",data:result});
  } catch (e) {
    const map = {UNAUTHORIZED:["Tidak terautentikasi",401],USER_NOT_FOUND:["User tidak ditemukan",404],ACCOUNT_DISABLED:["Akun tidak aktif",403],PRODUCT_NOT_FOUND:["Produk tidak ditemukan",404],INVALID_PRODUCT:["Produk tidak valid",400],INSUFFICIENT_BALANCE:["Saldo tidak cukup",400],OUT_OF_STOCK:["Stok AM Premium sedang habis",409]};
    const x=map[e.message]||["Terjadi kesalahan pada server",500];
    return res.status(x[1]).json({success:false,message:x[0]});
  }
};
