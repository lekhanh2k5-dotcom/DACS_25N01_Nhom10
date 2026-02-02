import { useEffect, useState } from 'react'
import { db } from '../../firebase/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { showSuccess, showError } from '../../utils/alert'
import './SongsManagement.css'

export default function SongsManagement() {
    const { user } = useAuth()
    const [songs, setSongs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [openDropdown, setOpenDropdown] = useState(null)
    const [selectedRegion, setSelectedRegion] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 50

    useEffect(() => {
        if (user) {
            fetchSongs()
        }
    }, [user])

    const fetchSongs = async () => {
        if (!user) return

        try {
            setLoading(true)
            const songsSnapshot = await getDocs(collection(db, 'songs'))
            const songsData = songsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setSongs(songsData)
        } catch (error) {
            console.error('Lỗi khi tải bài hát:', error)
            showError('Không thể tải danh sách bài hát')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (song) => {
        showSuccess('Chức năng chỉnh sửa đang phát triển')
        setOpenDropdown(null)
    }

    const handleDelete = (song) => {
        showSuccess('Chức năng xóa đang phát triển')
        setOpenDropdown(null)
    }

    const handleViewDetails = (song) => {
        showSuccess('Chức năng xem chi tiết đang phát triển')
        setOpenDropdown(null)
    }

    const filteredSongs = songs.filter(s => {
        const query = searchQuery.toLowerCase()
        const matchesSearch = s.name?.toLowerCase().includes(query) ||
            s.author?.toLowerCase().includes(query) ||
            s.composer?.toLowerCase().includes(query)
        const matchesRegion = selectedRegion === 'all' || s.region === selectedRegion
        return matchesSearch && matchesRegion
    })

    // Pagination
    const totalPages = Math.ceil(filteredSongs.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedSongs = filteredSongs.slice(startIndex, endIndex)

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, selectedRegion])

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    const regions = [
        { value: 'all', label: '🌍 Tất cả' },
        { value: 'cn', label: '🇨🇳 Hoa ngữ' },
        { value: 'kr', label: '🇰🇷 Hàn Quốc' },
        { value: 'vn', label: '🇻🇳 Việt Nam' },
        { value: 'us', label: '🇺🇸 Âu Mỹ' },
        { value: 'jp', label: '🇯🇵 Nhật Bản' },
    ]

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-page-header">
                    <h1>🎵 Quản lý bài hát</h1>
                </div>
                <div className="songs-loading">
                    Đang tải...
                </div>
            </div>
        )
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>🎵 Quản lý bài hát</h1>
            </div>

            <div className="songs-filter-section">
                <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="songs-region-select"
                >
                    {regions.map(region => (
                        <option key={region.value} value={region.value}>
                            {region.label}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="songs-search-input"
                />
                <button className="admin-btn admin-btn-primary">
                    ➕ Thêm bài hát
                </button>
            </div>

            <div className="songs-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Bài hát</th>
                            <th>Giá</th>
                            <th style={{ width: '80px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedSongs.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="songs-table-empty">
                                    {searchQuery || selectedRegion !== 'all' ? 'Không tìm thấy bài hát' : 'Chưa có bài hát'}
                                </td>
                            </tr>
                        ) : (
                            paginatedSongs.map((s, index) => {
                                const isNearBottom = index >= paginatedSongs.length - 3
                                return (
                                    <tr key={s.id}>
                                        <td>
                                            <div className="songs-info-cell">
                                                <div className="songs-name">
                                                    🎵 {s.name || 'Untitled'}
                                                </div>
                                                <div className="songs-meta">
                                                    🎤 {s.author || 'Unknown'} • ✍️ {s.composer || s.transcribedBy || 'Unknown'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="songs-price-cell">
                                            {(s.price || 0).toLocaleString()} xu
                                        </td>
                                        <td className="songs-dropdown-cell">
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === s.id ? null : s.id)}
                                                className="songs-dropdown-button"
                                            >
                                                ⋮
                                            </button>

                                            {openDropdown === s.id && (
                                                <div className={`songs-dropdown-menu ${isNearBottom ? 'top' : 'bottom'}`}>
                                                    <div
                                                        onClick={() => handleViewDetails(s)}
                                                        className="songs-dropdown-item"
                                                    >
                                                        👁️ Xem chi tiết
                                                    </div>
                                                    <div
                                                        onClick={() => handleEdit(s)}
                                                        className="songs-dropdown-item"
                                                    >
                                                        ✏️ Chỉnh sửa
                                                    </div>
                                                    <div
                                                        onClick={() => handleDelete(s)}
                                                        className="songs-dropdown-item danger"
                                                    >
                                                        🗑️ Xóa
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="songs-pagination">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        Trước
                    </button>

                    <div className="pagination-info">
                        <span>Trang </span>
                        <input
                            type="number"
                            value={currentPage}
                            onChange={(e) => {
                                const page = parseInt(e.target.value)
                                if (page && page > 0 && page <= totalPages) {
                                    setCurrentPage(page)
                                }
                            }}
                            className="pagination-input"
                            min="1"
                            max={totalPages}
                        />
                        <span> / {totalPages}</span>
                    </div>

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Tiếp
                    </button>
                </div>
            )}

            <div className="songs-stats-footer">
                <span>Tổng: <strong className="total">{songs.length}</strong> bài hát</span>
                <span>•</span>
                <span>Hiển thị: <strong className="total">{filteredSongs.length}</strong></span>
                <span>•</span>
                <span>Tổng giá trị: <strong className="value">{songs.reduce((sum, s) => sum + (s.price || 0), 0).toLocaleString()}</strong> xu</span>
            </div>

            {/* Click outside to close dropdown */}
            {openDropdown && (
                <div className="songs-dropdown-backdrop" onClick={() => setOpenDropdown(null)} />
            )}
        </div>
    )
}
