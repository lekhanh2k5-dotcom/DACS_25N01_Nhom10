import { useEffect, useState } from 'react'
import { db } from '../../firebase/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import './Dashboard.css'

export default function Dashboard() {
    const { user } = useAuth()
    const { t } = useLanguage()
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
                <div className="dashboard-loading">
                    ⏳ {t('admin.loadingData')}
                </div>
            </div>
        )
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>📊 {t('admin.dashboard')}</h1>
            </div>

            <div className="admin-stats">
                <div className="admin-stat-card">
                    <div className="admin-stat-label">{t('admin.user')}s</div>
                    <div className="admin-stat-value">
                        <span>👥</span>
                        {stats.totalUsers}
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-label">{t('admin.songs')}</div>
                    <div className="admin-stat-value">
                        <span>🎵</span>
                        {stats.totalSongs}
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-label">Transactions/Month</div>
                    <div className="admin-stat-value">
                        <span>💳</span>
                        {stats.monthlyTransactions}
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-label">Revenue/Month</div>
                    <div className="admin-stat-value">
                        <span>💰</span>
                        {stats.monthlyRevenue.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="dashboard-chart-container">
                <h2 className="dashboard-chart-title">
                    {t('admin.revenue7Days')}
                </h2>
                <div className="dashboard-chart-bars">
                    {chartData.map((data, index) => {
                        const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1)
                        const heightPixels = data.revenue > 0
                            ? Math.max((data.revenue / maxRevenue) * 160, 25)
                            : 3

                        return (
                            <div key={index} className="dashboard-chart-bar-container">
                                <div
                                    className={`dashboard-chart-bar ${data.revenue > 0 ? 'has-revenue' : 'empty'}`}
                                    style={{ height: `${heightPixels}px` }}
                                    title={`${data.revenue.toLocaleString()} coins - ${data.count} transactions`}
                                >
                                    {data.revenue > 0 && (
                                        <div className="dashboard-chart-bar-label">
                                            {data.revenue > 1000 ? `${(data.revenue / 1000).toFixed(1)}k` : data.revenue}
                                        </div>
                                    )}
                                </div>
                                <div className="dashboard-chart-day-label">
                                    {data.day}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="dashboard-chart-summary">
                    Last 7 days: <strong className="revenue">
                        {chartData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()} coins
                    </strong>
                    {' • '}
                    <strong className="transactions">
                        {chartData.reduce((sum, d) => sum + d.count, 0)} transactions
                    </strong>
                </div>
            </div>
        </div>
    )
}
