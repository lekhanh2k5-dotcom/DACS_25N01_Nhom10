import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { resetPassword as fbResetPassword } from "../firebase/auth";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateEmail,
    updatePassword,
    sendEmailVerification,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";

import {
    onSnapshot,
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
} from "firebase/firestore";

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeProfile = null;

        const unsubAuth = onAuthStateChanged(auth, async (u) => {
            setUser(u || null);

            if (unsubscribeProfile) {
                unsubscribeProfile();
                unsubscribeProfile = null;
            }

            if (u) {
                const ref = doc(db, "users", u.uid);
                const snap = await getDoc(ref);

                if (!snap.exists()) {
                    const profile = {
                        email: u.email,
                        displayName: u.email?.split("@")[0] || "User",
                        coins: 1000,
                        createdAt: Date.now(),
                        ownedSongs: {},
                    };
                    await setDoc(ref, profile);
                }

                unsubscribeProfile = onSnapshot(ref, (snapshot) => {
                    if (snapshot.exists()) {
                        setUserProfile(snapshot.data());
                    }
                    setLoading(false);
                });
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => {
            unsubAuth();
            if (unsubscribeProfile) unsubscribeProfile();
        };
    }, []);

    const login = async (accountOrEmail, password) => {
        let email = accountOrEmail;

        if (!accountOrEmail.includes("@")) {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("displayName", "==", accountOrEmail));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                const error = new Error("Tên tài khoản không tồn tại");
                error.code = "auth/user-not-found";
                throw error;
            }

            email = snapshot.docs[0].data().email;
        }

        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
    };

    const register = async (email, password, username) => {
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;

        if (username && !usernameRegex.test(username)) {
            const error = new Error(
                "Tên tài khoản chỉ được chứa chữ cái, số, dấu gạch dưới (_) và gạch ngang (-)"
            );
            error.code = "auth/invalid-username";
            throw error;
        }

        if (username && username.length < 3) {
            const error = new Error("Tên tài khoản phải có ít nhất 3 ký tự");
            error.code = "auth/username-too-short";
            throw error;
        }

        if (username) {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("displayName", "==", username));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const error = new Error("Tên tài khoản đã được sử dụng");
                error.code = "auth/username-already-exists";
                throw error;
            }
        }

        const cred = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "users", cred.user.uid), {
            email,
            displayName: username || email.split("@")[0],
            coins: 1000,
            createdAt: Date.now(),
        });

        return cred.user;
    };

    const logout = async () => {
        await signOut(auth);
    };

    const resetPassword = async (email) => {
        await fbResetPassword(email);
        return true;
    };

    const reauthWithPassword = async (currentPassword) => {
        if (!user || !user.email) {
            const e = new Error("Người dùng chưa đăng nhập.");
            e.code = "auth/user-not-found";
            throw e;
        }
        if (!currentPassword) {
            const e = new Error("Vui lòng nhập mật khẩu hiện tại.");
            e.code = "auth/missing-current-password";
            throw e;
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
    };


    const updateUsername = async (currentPassword, newUsername) => {
        if (!user) return;

        const username = newUsername.trim();
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;

        if (!usernameRegex.test(username)) {
            throw new Error(
                "Tên đăng nhập chỉ gồm chữ cái, số, _ và -"
            );
        }
        if (username.length < 3) {
            throw new Error("Tên đăng nhập phải ≥ 3 ký tự.");
        }

        await reauthWithPassword(currentPassword);

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("displayName", "==", username));
        const snapshot = await getDocs(q);
        const taken = snapshot.docs.some((d) => d.id !== user.uid);
        if (taken) throw new Error("Tên đăng nhập đã tồn tại.");

        await updateDoc(doc(db, "users", user.uid), {
            displayName: username,
        });
    };


    // ✅ Update Email (Firebase Auth + Firestore) - yêu cầu reauth
    const updateAccountEmail = async (currentPassword, newEmail) => {
        if (!user) return;

        const email = newEmail.trim();
        if (!email.includes("@")) {
            throw new Error("Email không hợp lệ.");
        }

        // 🔐 re-auth
        await reauthWithPassword(currentPassword);

        await updateEmail(user, email);

        await updateDoc(doc(db, "users", user.uid), {
            email,
        });
    };


    // ✅ Update Password (reauth)
    const updateAccountPassword = async (currentPassword, newPassword) => {
        if (!user || !user.email) return;

        if (!newPassword || newPassword.length < 6) {
            throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
        }

        try {
            await reauthWithPassword(currentPassword);
            await updatePassword(user, newPassword);
        } catch (error) {
            if (error.code === "auth/wrong-password") {
                throw new Error("Mật khẩu hiện tại không chính xác.");
            }
            if (error.code === "auth/too-many-requests") {
                throw new Error("Thử lại sau (quá nhiều lần).");
            }
            throw error;
        }
    };

    const sendVerification = async () => {
        if (!user) return;
        await sendEmailVerification(user);
        return true;
    };

    const value = {
        user,
        userProfile,
        loading, // ✅ dùng đúng state

        login,
        register,
        logout,
        resetPassword,

        currentUser: auth.currentUser,
        userData: userProfile,

        updateUsername,
        updateAccountEmail,      // ✅ đã có thật
        updateAccountPassword,   // ✅ sửa dùng đúng
        sendVerification,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
