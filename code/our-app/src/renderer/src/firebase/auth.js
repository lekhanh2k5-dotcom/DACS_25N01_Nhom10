import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export async function resetPassword(email) {
  const auth = getAuth();
  const cleanEmail = email.trim().toLowerCase();

  await sendPasswordResetEmail(auth, cleanEmail);
  return true;
}
