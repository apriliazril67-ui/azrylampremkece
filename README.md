# AZRYLPREMIUM

Website e-commerce digital untuk AM Premium 500P, menggunakan Firebase Authentication, Firestore, dan Vercel Functions.

## Struktur

- `public/` — frontend
- `api/` — backend Vercel
- `firestore.rules` — aturan keamanan Firestore
- `vercel.json` — konfigurasi Vercel
- `package.json` — dependency

## 1. Firebase

Project:
`ampremiumupdate`

Aktifkan:
- Authentication → Email/Password
- Firestore Database

Deploy `firestore.rules` ke Firebase.

Buat dokumen:
`products/am-premium`

Isi:
```json
{
  "name": "AM Premium",
  "price": 500,
  "active": true,
  "description": "AM Premium"
}
```

## 2. Admin

Register akun biasa terlebih dahulu. Setelah itu, di Firestore ubah field `role` pada `users/{UID}` menjadi:

`admin`

Jangan membuat admin dari parameter URL/localStorage.

## 3. Vercel Environment Variables

Untuk backend, isi:

`FIREBASE_PROJECT_ID`
`FIREBASE_CLIENT_EMAIL`
`FIREBASE_PRIVATE_KEY`

Nilainya berasal dari Firebase service account. Jangan commit JSON service account ke repository.

Untuk `FIREBASE_PRIVATE_KEY`, simpan format private key dengan newline yang benar atau gunakan `\\n`; kode backend sudah melakukan normalisasi.

## 4. Jalankan

```bash
npm install
npx vercel
```

Atau push repository ke GitHub lalu import ke Vercel.

## 5. Top Up

Top up bersifat manual.

QR:
https://cdn.phototourl.com/member/2026-08-28-6ea19a2e-2da8-4bab-a60f-a909864506cf.jpg

DANA:
085786683784 (JEJE)

Minimum:
1000P

Saldo tidak bertambah sebelum admin melakukan approve.

## 6. API

### POST /api/purchase

Header:
`Authorization: Bearer FIREBASE_ID_TOKEN`

Body:
```json
{"productId":"am-premium"}
```

Response sukses:
```json
{
  "success": true,
  "message": "Pembelian berhasil",
  "data": {
    "orderId": "....",
    "item": "....",
    "price": 500
  }
}
```

### POST /api/admin/approve-topup

Header:
`Authorization: Bearer FIREBASE_ID_TOKEN`

Body:
```json
{"topupId":"ID_TOPUP"}
```

### POST /api/admin/reject-topup

Header:
`Authorization: Bearer FIREBASE_ID_TOKEN`

Body:
```json
{"topupId":"ID_TOPUP"}
```

## 7. Catatan Firestore index

Halaman riwayat memakai `where(userId)` + `orderBy(createdAt)`. Jika Firebase meminta composite index, ikuti link index yang diberikan Firebase Console.

## Keamanan

- Jangan menyimpan password.
- Jangan memasukkan Firebase Admin private key ke frontend.
- Harga transaksi dibaca dari Firestore oleh backend.
- Saldo diproses dalam Firestore transaction.
- Approval top up idempotent.
- Jangan gunakan `allow read, write: if true`.
- Jangan percaya `balance`, `role`, atau `price` dari browser.
- Top up tidak otomatis; admin harus mengonfirmasi.
