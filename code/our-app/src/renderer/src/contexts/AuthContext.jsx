import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { resetPassword as fbResetPassword } from "../firebase/auth";
import { showError } from "../utils/alert";
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
    verifyBeforeUpdateEmail
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
                } else {
                    const userData = snap.data();
                    if (userData.isLocked) {
                        await signOut(auth);
                        setUser(null);
                        setUserProfile(null);
                        setLoading(false);
                        showError('Tài khoản của bạn đã bị khóa bởi quản trị viên');
                        return;
                    }
                }

                unsubscribeProfile = onSnapshot(ref, (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        // Kiểm tra realtime nếu bị khóa trong khi đang dùng
                        if (data.isLocked) {
                            signOut(auth);
                            showError('Tài khoản của bạn đã bị khóa');
                        } else {
                            setUserProfile(data);
                        }
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

    const login = async (email, password) => {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
    };

    const register = async (email, password, username) => {
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;

        if (username && !usernameRegex.test(username)) {
            const error = new Error("Tên tài khoản chỉ được chứa chữ cái, số, _ và -");
            error.code = "auth/invalid-username";
            throw error;
        }
        if (username && username.length < 3) {
            const error = new Error("Tên tài khoản phải có ít nhất 3 ký tự");
            error.code = "auth/username-too-short";
            throw error;
        }

        // 1) tạo auth trước
        const cred = await createUserWithEmailAndPassword(auth, email, password);

        // 2) rồi mới tạo profile trong Firestore (lúc này đã auth)
        await setDoc(doc(db, "users", cred.user.uid), {
            email,
            displayName: username || email.split("@")[0],
            coins: 1000,
            createdAt: Date.now(),
            ownedSongs: {},
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
        const u = auth.currentUser;
        if (!u || !u.email) {
            const e = new Error("Người dùng chưa đăng nhập.");
            e.code = "auth/user-not-found";
            throw e;
        }
        if (!currentPassword) {
            const e = new Error("Vui lòng nhập mật khẩu hiện tại.");
            e.code = "auth/missing-current-password";
            throw e;
        }

        // tạo credential ĐÚNG SCOPE
        const cred = EmailAuthProvider.credential(u.email, currentPassword);

        // reauth
        await reauthenticateWithCredential(u, cred);
    };



    const updateUsername = async (currentPassword, newUsername) => {
        const u = auth.currentUser;
        if (!u) return;

        const username = newUsername.trim();
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(username)) throw new Error("Tên đăng nhập chỉ gồm chữ cái, số, _ và -");
        if (username.length < 3) throw new Error("Tên đăng nhập phải ≥ 3 ký tự.");

        try {
            await reauthWithPassword(currentPassword);
        } catch (e) {
            if (e.code === "auth/invalid-credential" || e.code === "auth/wrong-password") {
                throw new Error("Mật khẩu hiện tại không đúng.");
            }
            if (e.code === "auth/requires-recent-login") {
                throw new Error("Phiên đăng nhập đã cũ. Vui lòng đăng xuất và đăng nhập lại rồi thử lại.");
            }
            throw e;
        }

        await updateDoc(doc(db, "users", u.uid), { displayName: username });
    };




    const updateAccountEmail = async (currentPassword, newEmail) => {
        const u = auth.currentUser;
        if (!u) return;

        const email = newEmail.trim();
        if (!email.includes("@")) throw new Error("Email không hợp lệ.");

        // re-auth
        await reauthWithPassword(currentPassword);

        // GỬI EMAIL XÁC MINH TỚI EMAIL MỚI
        await verifyBeforeUpdateEmail(u, email);

        return true;
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
