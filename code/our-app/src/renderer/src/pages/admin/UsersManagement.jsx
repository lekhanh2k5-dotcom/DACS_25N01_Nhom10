import { useEffect, useState } from 'react'
import { db } from '../../firebase/firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { showSuccess, showError, showConfirm } from '../../utils/alert'
import { adminUpdateCoins } from '../../firebase/coinService'
import './UsersManagement.css'

export default function UsersManagement() {
    const { user } = useAuth()
    const { t } = useLanguage()
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
            console.error('Error loading users:', error)
            showError('Cannot load user list')
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
            showError('Please enter a valid amount')
            return
        }

        if (amount < 0) {
            showError('Amount must be positive')
            return
        }

        const finalAmount = action === 'subtract' ? -amount : amount
        const actionText = action === 'subtract' ? 'subtract' : 'add'
        const confirmed = await showConfirm(
            `Confirm ${actionText} ${amount.toLocaleString()} coins for ${coinModal.email}?`
        )

        if (!confirmed) return

        try {
            await adminUpdateCoins(coinModal.id, finalAmount, {
                email: user.email,
                uid: user.uid
            })

            showSuccess(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} ${amount.toLocaleString()} coins!`)
            setCoinModal(null)
            fetchUsers()
        } catch (error) {
            console.error('Error updating coins:', error)
            showError(error || 'Cannot update coins')
        }
    }

    const handleToggleLock = async (userId, currentStatus) => {
        const targetUser = users.find(u => u.id === userId)
        const action = currentStatus ? 'unlock' : 'lock'
        const actionText = currentStatus ? 'unlock' : 'lock'

        const confirmed = await showConfirm(
            `Are you sure you want to ${action} account ${targetUser.email}?`
        )

        if (!confirmed) return

        try {
            const userRef = doc(db, 'users', userId)
            await updateDoc(userRef, {
                isLocked: !currentStatus
            })
            showSuccess(`Account ${action === 'lock' ? 'locked' : 'unlocked'}!`)
            setOpenDropdown(null)
            fetchUsers()
        } catch (error) {
            console.error('Error updating status:', error)
            showError(`Cannot ${action} account`)
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
                    <h1>👥 {t('admin.usersTitle')}</h1>
                </div>
                <div className="users-loading">
                    {t('admin.loadingData')}
                </div>
            </div>
        )
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>👥 {t('admin.usersTitle')}</h1>
                <input
                    type="text"
                    placeholder={t('admin.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="users-search-input"
                />
            </div>

            <div className="users-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t('admin.user')}</th>
                            <th>{t('admin.coins')}</th>
                            <th>{t('common.confirm')}</th>
                            <th style={{ width: '80px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="users-table-empty">
                                    {searchQuery ? t('admin.userNotFound') : t('admin.noUsers')}
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
                                                    showSuccess('ID copied!')
                                                }}
                                                className="users-info-cell"
                                                title="Click to copy ID"
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
                                                <span className="users-status-locked">🔒 {t('admin.locked')}</span>
                                            ) : (
                                                <span className="users-status-active">✅ {t('admin.active')}</span>
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
                                                        💰 {t('admin.addCoins')}
                                                    </div>
                                                    <div
                                                        onClick={() => handleToggleLock(u.id, u.isLocked)}
                                                        className="users-dropdown-item"
                                                    >
                                                        {u.isLocked ? '🔓 Unlock' : '🔒 Lock'}
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
                <span>Total: <strong className="total">{users.length}</strong> users</span>
                <span>•</span>
                <span>Showing: <strong className="total">{filteredUsers.length}</strong></span>
                <span>•</span>
                <span>Active: <strong className="active">{activeUsers}</strong></span>
                <span>•</span>
                <span>Locked: <strong className="locked">{lockedUsers}</strong></span>
            </div>

            {/* Coin Management Modal */}
            {coinModal && (
                <div className="coin-modal-overlay" onClick={() => setCoinModal(null)}>
                    <div className="coin-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="coin-modal-header">💰 {t('admin.addCoins')}</h2>
                        <div className="coin-modal-user-info">
                            <div className="coin-modal-email">
                                {coinModal.email}
                            </div>
                            <div className="coin-modal-balance">
                                Balance: {(coinModal.coins || 0).toLocaleString()} {t('admin.coins')}
                            </div>
                        </div>

                        <div className="coin-modal-input-group">
                            <label className="coin-modal-label">
                                Enter amount:
                            </label>
                            <input
                                type="number"
                                value={coinAmount}
                                onChange={(e) => setCoinAmount(e.target.value)}
                                placeholder="Enter amount..."
                                className="coin-modal-input"
                                min="0"
                            />
                        </div>

                        <div className="coin-modal-actions">
                            <button
                                onClick={() => setCoinModal(null)}
                                className="admin-btn admin-btn-secondary"
                            >
                                {t('admin.cancel')}
                            </button>
                            <button
                                onClick={() => handleAddCoins('add')}
                                className="coin-modal-btn-add"
                            >
                                ➕ Add
                            </button>
                            <button
                                onClick={() => handleAddCoins('subtract')}
                                className="coin-modal-btn-subtract"
                            >
                                ➖ Subtract
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
