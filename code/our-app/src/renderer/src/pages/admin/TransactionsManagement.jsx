import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getTransactions } from '../../firebase/transactionService'
import { showError } from '../../utils/alert'
import './TransactionsManagement.css'

export default function TransactionsManagement() {
    const { user } = useAuth()
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])
    const fetchData = async () => {
        try {
            setLoading(true)

            // Lấy tất cả giao dịch 
            const { transactions: txns } = await getTransactions({
                type: 'all',
                limitCount: 200
            })
            setTransactions(txns)
        } catch (error) {
            console.error('Lỗi khi tải giao dịch:', error)
            showError('Không thể tải danh sách giao dịch')
        } finally {
            setLoading(false)
        }
    }

    const getTypeLabel = (type) => {
        const types = {
            'buysheet': 'Mua sheet',
            'admin_add': 'Nạp xu',
            'admin_subtract': 'Trừ xu'
        }
        return types[type] || type
    }

    const getTypeClass = (type) => {
        const classes = {
            'buysheet': 'type-buy',
            'admin_add': 'type-add',
            'admin_subtract': 'type-subtract'
        }
        return classes[type] || ''
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A'

        let date
        if (timestamp.toDate) {
            date = timestamp.toDate()
        } else if (timestamp instanceof Date) {
            date = timestamp
        } else {
            date = new Date(timestamp)
        }

        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN')
    }

    // Filter và search
    const filteredTransactions = transactions.filter(tx => {
        const matchType = filterType === 'all' || tx.type === filterType

        const matchSearch = !searchQuery ||
            tx.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.songName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.id.toLowerCase().includes(searchQuery.toLowerCase())

        return matchType && matchSearch
    })

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-page-header">
                    <h1>💰 Quản lý giao dịch</h1>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-page transactions-page">
            <div className="admin-page-header">
                <h1>💰 Quản lý giao dịch</h1>
            </div>

            <div className="transactions-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="🔍 Tìm theo người dùng, bài hát, ID giao dịch..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                    />
                </div>

                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
                        onClick={() => {
                            if (filterType !== 'all') {
                                setFilterType('all')
                                setCurrentPage(1)
                            }
                        }}
                    >
                        Tất cả
                    </button>
                    <button
                        className={`filter-tab ${filterType === 'buysheet' ? 'active' : ''}`}
                        onClick={() => {
                            if (filterType !== 'buysheet') {
                                setFilterType('buysheet')
                                setCurrentPage(1)
                            }
                        }}
                    >
                        Mua sheet
                    </button>
                    <button
                        className={`filter-tab ${filterType === 'admin_add' ? 'active' : ''}`}
                        onClick={() => {
                            if (filterType !== 'admin_add') {
                                setFilterType('admin_add')
                                setCurrentPage(1)
                            }
                        }}
                    >
                        Nạp xu
                    </button>
                    <button
                        className={`filter-tab ${filterType === 'admin_subtract' ? 'active' : ''}`}
                        onClick={() => {
                            if (filterType !== 'admin_subtract') {
                                setFilterType('admin_subtract')
                                setCurrentPage(1)
                            }
                        }}
                    >
                        Trừ xu
                    </button>
                </div>
            </div>

            {/* Bảng giao dịch */}
            <div className="transactions-table-container">
                {currentTransactions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>Không có giao dịch nào</p>
                    </div>
                ) : (
                    <>
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Người dùng</th>
                                    <th>Hoạt động</th>
                                    <th>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTransactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>{formatDate(tx.timestamp)}</td>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-name">{tx.userName}</div>
                                                <div className="user-email">{tx.userEmail}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`type-badge ${getTypeClass(tx.type)}`}>
                                                {getTypeLabel(tx.type)}
                                            </span>
                                        </td>
                                        <td>
                                            {tx.type === 'buysheet' && (
                                                <div className="note-simple">
                                                    <span className="coin-amount negative">-{formatCurrency(Math.abs(tx.price || 0))} </span>
                                                    <span className="song-name">{tx.songName || 'N/A'}</span>
                                                </div>
                                            )}
                                            {tx.type === 'admin_add' && (
                                                <div className="note-simple">
                                                    <span className="coin-amount positive">+{formatCurrency(Math.abs(tx.amount || 0))} 💎</span>
                                                </div>
                                            )}
                                            {tx.type === 'admin_subtract' && (
                                                <div className="note-simple">
                                                    <span className="coin-amount negative">-{formatCurrency(Math.abs(tx.amount || 0))} 💎</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="page-btn"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                >
                                    ‹ Trước
                                </button>

                                <div className="page-numbers">
                                    {[...Array(totalPages)].map((_, i) => {
                                        const page = i + 1
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 2 && page <= currentPage + 2)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        } else if (page === currentPage - 3 || page === currentPage + 3) {
                                            return <span key={page} className="page-ellipsis">...</span>
                                        }
                                        return null
                                    })}
                                </div>

                                <button
                                    className="page-btn"
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    Sau ›
                                </button>
                            </div>
                        )}

                        <div className="transactions-footer">
                            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} trong tổng số {filteredTransactions.length} giao dịch
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
