import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { resetPassword as fbResetPassword } from "../firebase/auth";

import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

const AuthContext = createContext();

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
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u || null);

            if (u) {
                const ref = doc(db, "users", u.uid);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    setUserProfile(snap.data());
                } else {
                    const profile = {
                        email: u.email,
                        displayName: u.email?.split("@")[0] || "User",
                        coins: 1000,
                        createdAt: Date.now(),
                    };
                    await setDoc(ref, profile);
                    setUserProfile(profile);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsub();
    }, []);

    const login = async (accountOrEmail, password) => {
        let email = accountOrEmail;

        if (!accountOrEmail.includes('@')) {
            console.log('🔍 Tìm email từ username:', accountOrEmail);

            const usersRef = collection(db, "users");
            const q = query(usersRef, where("displayName", "==", accountOrEmail));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                const error = new Error('Tên tài khoản không tồn tại');
                error.code = 'auth/user-not-found';
                throw error;
            }

            email = snapshot.docs[0].data().email;
            console.log('✅ Tìm thấy email:', email);
        }

        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
    };

    const register = async (email, password, username) => {
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;

        if (username && !usernameRegex.test(username)) {
            const error = new Error('Tên tài khoản chỉ được chứa chữ cái, số, dấu gạch dưới (_) và gạch ngang (-)');
            error.code = 'auth/invalid-username';
            throw error;
        }

        if (username && username.length < 3) {
            const error = new Error('Tên tài khoản phải có ít nhất 3 ký tự');
            error.code = 'auth/username-too-short';
            throw error;
        }

        if (username) {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("displayName", "==", username));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const error = new Error('Tên tài khoản đã được sử dụng');
                error.code = 'auth/username-already-exists';
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

    const value = {
        user,
        userProfile,
        loading: false,
        login,
        register,
        logout,
        resetPassword,
    };
    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );

};
