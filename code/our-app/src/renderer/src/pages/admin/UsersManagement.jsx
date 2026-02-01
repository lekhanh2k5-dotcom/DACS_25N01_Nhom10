import { useEffect, useState } from 'react'
import { db } from "../../firebase/firebase"
import { useAuth } from "../../contexts/AuthContext"
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore'
import { showSuccess, showError, showConfirm } from '../../utils/alert'

export default function AdminDashboard() {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        if (!user) return
        try {
            // Lấy danh sách từ collection 'users'
            const querySnapshot = await getDocs(collection(db, 'users'))
            const list = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            setUsers(list)
        } catch (error) {
            showError('Bạn không có quyền truy cập dữ liệu quản trị!')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [user])

    const addCoins = async (userId, amount) => {
        if (!(await showConfirm(`Cộng ${amount} xu cho người dùng này?`))) return
        try {
            const userRef = doc(db, 'users', userId)
            // Sử dụng increment để tăng số dư xu
            await updateDoc(userRef, { coins: increment(amount) })
            showSuccess('Cập nhật xu thành công!')
            fetchUsers()
        } catch (e) {
            showError('Lỗi cập nhật: ' + e.message)
        }
    }

    if (loading) return <div style={{ color: 'white', padding: '20px' }}>Đang xác thực quyền...</div>

    return (
        <div className="admin-page" style={{ backgroundColor: '#121212', minHeight: '100vh', color: 'white', padding: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>🛡️ Quản trị hệ thống SkyBard</h2>
                <button onClick={fetchUsers} style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}>
                    Làm mới danh sách
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
                <thead>
                    <tr style={{ backgroundColor: '#2d2d2d', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Email / UID</th>
                        <th style={{ padding: '12px' }}>Tên hiển thị</th>
                        <th style={{ padding: '12px' }}>Số dư Xu</th>
                        <th style={{ padding: '12px' }}>Thao tác cộng xu</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? users.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #333' }}>
                            <td style={{ padding: '12px' }}>
                                <div>{u.email}</div>
                                <small style={{ color: '#888', fontSize: '10px' }}>{u.id}</small>
                            </td>
                            <td style={{ padding: '12px' }}>{u.displayName || u.username || 'N/A'}</td>
                            <td style={{ padding: '12px', color: '#fbbf24', fontWeight: 'bold' }}>
                                {u.coins?.toLocaleString() || 0} 💰
                            </td>
                            <td style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => addCoins(u.id, 1000)} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>+1k</button>
                                    <button onClick={() => addCoins(u.id, 5000)} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>+5k</button>
                                    <button onClick={() => addCoins(u.id, -1000)} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>-1k</button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Không tìm thấy người dùng nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}