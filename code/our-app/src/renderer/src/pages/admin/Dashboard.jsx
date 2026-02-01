import { useEffect, useState } from 'react'
import { db } from '../../firebase/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'

export default function Dashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSongs: 0,
        monthlyTransactions: 0,
        monthlyRevenue: 0
    })
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchStats()
        }
    }, [user])

    const fetchStats = async () => {
        if (!user) {
            console.log('❌ Chưa đăng nhập')
            return
        }

        try {
            console.log('🔄 Đang load dữ liệu từ Firebase...')
            console.log('👤 User:', user.email)

            const usersSnapshot = await getDocs(collection(db, 'users'))
            const songsSnapshot = await getDocs(collection(db, 'songs'))
            const transactionsSnapshot = await getDocs(collection(db, 'transactions'))

            console.log('📊 Users:', usersSnapshot.size)
            console.log('🎵 Songs:', songsSnapshot.size)
            console.log('💳 Transactions:', transactionsSnapshot.size)

            const transactions = transactionsSnapshot.docs.map(doc => doc.data())
            console.log('📦 Transaction data:', transactions)

            const now = new Date()
            const currentMonth = now.getMonth()
            const currentYear = now.getFullYear()

            const monthlyTransactions = transactions.filter(t => {
                if (!t.timestamp) return false
                const transactionDate = new Date(t.timestamp.seconds * 1000)
                return transactionDate.getMonth() === currentMonth &&
                    transactionDate.getFullYear() === currentYear
            })

            console.log('📅 Monthly transactions:', monthlyTransactions.length)

            const monthlyRevenue = monthlyTransactions.reduce((sum, t) => {
                const amount = Math.abs(t.amount || t.price || 0)
                console.log('💰 Transaction:', t.type, amount, t)
                if (t.type === 'purchase' || t.type === 'buysheet') return sum + amount
                return sum
            }, 0)

            console.log('💰 Monthly revenue:', monthlyRevenue)

            const last7Days = []
            for (let i = 6; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                date.setHours(0, 0, 0, 0)

                const dayTransactions = transactions.filter(t => {
                    if (!t.timestamp) return false
                    const tDate = new Date(t.timestamp.seconds * 1000)
                    tDate.setHours(0, 0, 0, 0)
                    return tDate.getTime() === date.getTime() && (t.type === 'purchase' || t.type === 'buysheet')
                })

                const dayRevenue = dayTransactions.reduce((sum, t) => {
                    const amount = Math.abs(t.amount || t.price || 0)
                    return sum + amount
                }, 0)

                last7Days.push({
                    day: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
                    revenue: dayRevenue,
                    count: dayTransactions.length
                })
            }

            console.log('📊 Chart data:', last7Days)
            setChartData(last7Days)

            setStats({
                totalUsers: usersSnapshot.size,
                totalSongs: songsSnapshot.size,
                monthlyTransactions: monthlyTransactions.length,
                monthlyRevenue
            })

            console.log('✅ Dữ liệu đã load xong!')
        } catch (error) {
            console.error('❌ Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="admin-page">
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-sub)' }}>
                    ⏳ Đang tải...
                </div>
            </div>
        )
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>📊 Tổng quan hệ thống</h1>
            </div>

            <div className="admin-stats">
                <div className="admin-stat-card">
                    <div className="admin-stat-label">Người dùng</div>
                    <div className="admin-stat-value">
                        <span>👥</span>
                        {stats.totalUsers}
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-label">Bài hát</div>
                    <div className="admin-stat-value">
                        <span>🎵</span>
                        {stats.totalSongs}
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-label">Giao dịch/tháng</div>
                    <div className="admin-stat-value">
                        <span>💳</span>
                        {stats.monthlyTransactions}
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-label">Doanh thu/tháng</div>
                    <div className="admin-stat-value">
                        <span>💰</span>
                        {stats.monthlyRevenue.toLocaleString()}
                    </div>
                </div>
            </div>

            <div style={{
                background: 'var(--bg-card)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border)'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
                    📊 Doanh thu 7 ngày gần đây (xu)
                </h2>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-around',
                    height: '180px',
                    gap: '10px',
                    paddingBottom: '10px',
                    borderBottom: '2px solid var(--border)'
                }}>
                    {chartData.map((data, index) => {
                        const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1)
                        const heightPixels = data.revenue > 0
                            ? Math.max((data.revenue / maxRevenue) * 160, 25)
                            : 3

                        return (
                            <div key={index} style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                height: '100%',
                                gap: '8px'
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: `${heightPixels}px`,
                                    background: data.revenue > 0
                                        ? 'linear-gradient(180deg, var(--primary) 0%, #17a34a 100%)'
                                        : '#333',
                                    borderRadius: '8px 8px 0 0',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    boxShadow: data.revenue > 0 ? '0 4px 12px rgba(29, 185, 84, 0.3)' : 'none'
                                }}
                                    title={`${data.revenue.toLocaleString()} xu - ${data.count} giao dịch`}
                                >
                                    {data.revenue > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-25px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            color: 'var(--accent-gold)',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {data.revenue > 1000 ? `${(data.revenue / 1000).toFixed(1)}k` : data.revenue}
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    color: 'var(--text-sub)',
                                    fontWeight: 600,
                                    textAlign: 'center'
                                }}>
                                    {data.day}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div style={{
                    marginTop: '15px',
                    fontSize: '13px',
                    color: 'var(--text-sub)',
                    textAlign: 'center'
                }}>
                    Tổng 7 ngày: <strong style={{ color: 'var(--accent-gold)' }}>
                        {chartData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()} xu
                    </strong>
                    {' • '}
                    <strong style={{ color: 'var(--primary)' }}>
                        {chartData.reduce((sum, d) => sum + d.count, 0)} giao dịch
                    </strong>
                </div>
            </div>
        </div>
    )
}
