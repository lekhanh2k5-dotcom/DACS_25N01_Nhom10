import { useEffect, useState } from 'react'
import { db } from '../../firebase/firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { showSuccess, showError, showConfirm } from '../../utils/alert'
import { adminUpdateCoins } from '../../firebase/coinService'
import './UsersManagement.css'

export default function UsersManagement() {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [openDropdown, setOpenDropdown] = useState(null)
    const [coinModal, setCoinModal] = useState(null)
    const [coinAmount, setCoinAmount] = useState('')

    useEffect(() => {
        if (user) {
            fetchUsers()
        }
    }, [user])

    const fetchUsers = async () => {
        if (!user) return

        try {
            setLoading(true)
            const usersSnapshot = await getDocs(collection(db, 'users'))
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setUsers(usersData)
        } catch (error) {
            console.error('Lỗi khi tải người dùng:', error)
            showError('Không thể tải danh sách người dùng')
        } finally {
            setLoading(false)
        }
    }

    const handleManageCoins = (user) => {
        setCoinModal(user)
        setCoinAmount('')
        setOpenDropdown(null)
    }

    const handleAddCoins = async (action) => {
        const amount = parseInt(coinAmount) || 0
        if (amount === 0) {
            showError('Vui lòng nhập số xu hợp lệ')
            return
        }

        if (amount < 0) {
            showError('Số xu phải là số dương')
            return
        }

        const finalAmount = action === 'subtract' ? -amount : amount
        const actionText = action === 'subtract' ? 'trừ' : 'cộng'
        const confirmed = await showConfirm(
            `Xác nhận ${actionText} ${amount.toLocaleString()} xu cho ${coinModal.email}?`
        )

        if (!confirmed) return

        try {
            await adminUpdateCoins(coinModal.id, finalAmount, {
                email: user.email,
                uid: user.uid
            })
            
            showSuccess(`Đã ${actionText} ${amount.toLocaleString()} xu!`)
            setCoinModal(null)
            fetchUsers()
        } catch (error) {
            console.error('Lỗi khi cập nhật xu:', error)
            showError(error || 'Không thể cập nhật xu')
        }
    }

    const handleToggleLock = async (userId, currentStatus) => {
        const targetUser = users.find(u => u.id === userId)
        const action = currentStatus ? 'mở khóa' : 'khóa'

        const confirmed = await showConfirm(
            `Bạn có chắc muốn ${action} tài khoản ${targetUser.email}?`
        )

        if (!confirmed) return

        try {
            const userRef = doc(db, 'users', userId)
            await updateDoc(userRef, {
                isLocked: !currentStatus
            })
            showSuccess(`Đã ${action} tài khoản!`)
            setOpenDropdown(null)
            fetchUsers()
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error)
            showError(`Không thể ${action} tài khoản`)
        }
    }

    const filteredUsers = users.filter(u => {
        const query = searchQuery.toLowerCase()
        return u.email?.toLowerCase().includes(query) ||
            u.displayName?.toLowerCase().includes(query) ||
            u.username?.toLowerCase().includes(query)
    })

    const activeUsers = users.filter(u => !u.isLocked).length
    const lockedUsers = users.filter(u => u.isLocked).length

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-page-header">
                    <h1>👥 Quản lý người dùng</h1>
                </div>
                <div className="users-loading">
                    Đang tải...
                </div>
            </div>
        )
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>👥 Quản lý người dùng</h1>
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="users-search-input"
                />
            </div>

            <div className="users-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Người dùng</th>
                            <th>Số xu</th>
                            <th>Trạng thái</th>
                            <th style={{ width: '80px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="users-table-empty">
                                    {searchQuery ? 'Không tìm thấy người dùng' : 'Chưa có người dùng'}
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((u, index) => {
                                const isNearBottom = index >= filteredUsers.length - 3
                                return (
                                    <tr key={u.id}>
                                        <td>
                                            <div
                                                onClick={() => {
                                                    navigator.clipboard.writeText(u.id)
                                                    showSuccess('Đã sao chép ID!')
                                                }}
                                                className="users-info-cell"
                                                title="Click để sao chép ID"
                                            >
                                                <div className="users-email">
                                                    {u.email}
                                                </div>
                                                <div className="users-displayname">
                                                    {u.displayName || u.username || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="users-coin-cell">
                                            {(u.coins || 0).toLocaleString()}
                                        </td>
                                        <td>
                                            {u.isLocked ? (
                                                <span className="users-status-locked">🔒 Đã khóa</span>
                                            ) : (
                                                <span className="users-status-active">✅ Hoạt động</span>
                                            )}
                                        </td>
                                        <td className="users-dropdown-cell">
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === u.id ? null : u.id)}
                                                className="users-dropdown-button"
                                            >
                                                ⋮
                                            </button>

                                            {openDropdown === u.id && (
                                                <div className={`users-dropdown-menu ${isNearBottom ? 'top' : 'bottom'}`}>
                                                    <div
                                                        onClick={() => handleManageCoins(u)}
                                                        className="users-dropdown-item"
                                                    >
                                                        💰 Quản lý xu
                                                    </div>
                                                    <div
                                                        onClick={() => handleToggleLock(u.id, u.isLocked)}
                                                        className="users-dropdown-item"
                                                    >
                                                        {u.isLocked ? '🔓 Mở khóa' : '🔒 Khóa tài khoản'}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="users-stats-footer">
                <span>Tổng: <strong className="total">{users.length}</strong> người dùng</span>
                <span>•</span>
                <span>Hiển thị: <strong className="total">{filteredUsers.length}</strong></span>
                <span>•</span>
                <span>Hoạt động: <strong className="active">{activeUsers}</strong></span>
                <span>•</span>
                <span>Bị khóa: <strong className="locked">{lockedUsers}</strong></span>
            </div>

            {/* Modal Quản lý xu */}
            {coinModal && (
                <div className="coin-modal-overlay" onClick={() => setCoinModal(null)}>
                    <div className="coin-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="coin-modal-header">💰 Quản lý xu</h2>
                        <div className="coin-modal-user-info">
                            <div className="coin-modal-email">
                                {coinModal.email}
                            </div>
                            <div className="coin-modal-balance">
                                Số dư: {(coinModal.coins || 0).toLocaleString()} xu
                            </div>
                        </div>

                        <div className="coin-modal-input-group">
                            <label className="coin-modal-label">
                                Nhập số xu:
                            </label>
                            <input
                                type="number"
                                value={coinAmount}
                                onChange={(e) => setCoinAmount(e.target.value)}
                                placeholder="Nhập số xu..."
                                className="coin-modal-input"
                                min="0"
                            />
                        </div>

                        <div className="coin-modal-actions">
                            <button
                                onClick={() => setCoinModal(null)}
                                className="admin-btn admin-btn-secondary"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleAddCoins('add')}
                                className="coin-modal-btn-add"
                            >
                                ➕ Cộng
                            </button>
                            <button
                                onClick={() => handleAddCoins('subtract')}
                                className="coin-modal-btn-subtract"
                            >
                                ➖ Trừ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close dropdown */}
            {openDropdown && (
                <div className="users-dropdown-backdrop" onClick={() => setOpenDropdown(null)} />
            )}
        </div>
    )
}
