const admin = require("firebase-admin");

function getAdmin() {
  if (!admin.apps.length) {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
      })
    });
  }
  return admin;
}

async function requireAdmin(req) {
  const a = getAdmin();
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const decoded = await a.auth().verifyIdToken(auth.slice(7));
  const snap = await a.firestore().collection("users").doc(decoded.uid).get();
  if (!snap.exists || snap.data().role !== "admin") throw new Error("FORBIDDEN");
  return { admin: a, decoded };
}

module.exports = { getAdmin, requireAdmin };
