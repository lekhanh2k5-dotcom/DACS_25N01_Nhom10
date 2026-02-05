import { db } from './firebase'
import { 
    collection, 
    query, 
    orderBy, 
    getDocs, 
    where,
    limit,
    startAfter,
    doc,
    getDoc
} from 'firebase/firestore'

/**
 * Lấy danh sách giao dịch với bộ lọc và phân trang
 * @param {Object} options 
 * @param {string} options.type 
 * @param {string} options.userId 
 * @param {number} options.limitCount 
 * @param {Object} options.lastDoc 
 * @returns {Promise<{transactions: Array, lastDoc: Object}>}
 */
export async function getTransactions(options = {}) {
    try {
        const {
            type = 'all',
            userId = null,
            limitCount = 50,
            lastDoc = null
        } = options

        let q = collection(db, 'transactions')
        const queryConstraints = []

        if (type !== 'all') {
            queryConstraints.push(where('type', '==', type))
        }

        if (userId) {
            queryConstraints.push(where('userId', '==', userId))
        }

        queryConstraints.push(orderBy('timestamp', 'desc'))

        queryConstraints.push(limit(limitCount))

        if (lastDoc) {
            queryConstraints.push(startAfter(lastDoc))
        }

        q = query(q, ...queryConstraints)
        const snapshot = await getDocs(q)

        const transactions = snapshot.docs.map(docSnap => {
            const data = docSnap.data()
            return {
                id: docSnap.id,
                ...data,
                userName: data.userEmail || 'Unknown',
                songName: data.songName || null
            }
        })

        return {
            transactions,
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
        }
    } catch (error) {
        console.error('Error getting transactions:', error)
        throw error
    }
}
