import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export async function resetPassword(email) {
  const auth = getAuth();
  
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent to:', email);
    return true;
  } catch (err) {
    console.error('❌ Error in resetPassword:', err);
    throw err;
  }
}
