// set-admin.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = "aLc1GEl4dvUoJmNUu5ZwOI2oU4q1";

admin.auth().setCustomUserClaims(uid, { admin: true }).then(() => {
  console.log("Chúc mừng! Bạn đã là Admin.");
  process.exit();
});