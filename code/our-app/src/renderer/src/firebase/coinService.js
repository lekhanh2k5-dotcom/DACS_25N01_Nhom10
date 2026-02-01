import { db } from './firebase';
import { doc, runTransaction, serverTimestamp, collection } from "firebase/firestore";

const generatePrettyId = (userId) => {
    const now = new Date();
    const date = now.getFullYear().toString() + 
                 (now.getMonth() + 1).toString().padStart(2, '0') + 
                 now.getDate().toString().padStart(2, '0');
    const time = now.getHours().toString().padStart(2, '0') + 
                 now.getMinutes().toString().padStart(2, '0') + 
                 now.getSeconds().toString().padStart(2, '0');
    return `${date}_${time}_${userId.slice(0, 4)}`;
};

export const purchaseSong = async (userId, song) => {
    const userRef = doc(db, "users", userId);
    const txnId = generatePrettyId(userId);

    try {
        return await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw "Người dùng không tồn tại!";

            const userData = userDoc.data();
            const currentCoins = userData.coins || 0;
            const ownedSongs = userData.ownedSongs || {};

            if (currentCoins < song.price) throw "Bạn không đủ xu!";
            if (ownedSongs[song.id]) throw "Bạn đã sở hữu bài này!";

            transaction.update(userRef, { 
                coins: currentCoins - song.price,
                [`ownedSongs.${song.id}`]: true 
            });

           const historyRef = doc(db, "transactions", txnId);
            
            transaction.set(historyRef, {
                txnId: txnId,
                userId: userId,
                userEmail: userData.email,
                songId: song.id,
                songName: song.name,
                price: song.price,
                type: 'buysheet', 
                timestamp: serverTimestamp(), //
                status: 'success'
            });

            return { success: true };
        });
    } catch (error) {
        console.error("Lỗi giao dịch:", error);
        throw error;
    }
};

export const adminUpdateCoins = async (userId, amount, adminInfo) => {
    const userRef = doc(db, "users", userId);
    const txnId = generatePrettyId(userId);

    try {
        return await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw "Người dùng không tồn tại!";

            const userData = userDoc.data();
            const currentCoins = userData.coins || 0;
            const newCoins = currentCoins + amount;

            if (newCoins < 0) throw "Số xu không đủ để trừ!";

            transaction.update(userRef, { 
                coins: newCoins
            });

            const historyRef = doc(db, "transactions", txnId);
            
            transaction.set(historyRef, {
                txnId: txnId,
                userId: userId,
                userEmail: userData.email,
                amount: amount,
                type: amount > 0 ? 'admin_add' : 'admin_subtract',
                adminEmail: adminInfo.email,
                adminId: adminInfo.uid,
                timestamp: serverTimestamp(),
                status: 'success'
            });

            return { success: true };
        });
    } catch (error) {
        console.error("Lỗi cập nhật xu:", error);
        throw error;
    }
};