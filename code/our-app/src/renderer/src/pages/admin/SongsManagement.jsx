import { useEffect, useState } from 'react'
import { db } from '../../firebase/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { showSuccess, showError } from '../../utils/alert'
import { deleteSongFromFirebase } from '../../firebase/deleteService'
import UploadSheetModal from '../../components/UploadSheetModal'
import EditSheetModal from '../../components/EditSheetModal'
import Swal from 'sweetalert2'
import './SongsManagement.css'

export default function SongsManagement() {
    const { user } = useAuth()
    const { t } = useLanguage()
    const [songs, setSongs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [openDropdown, setOpenDropdown] = useState(null)
    const [selectedRegion, setSelectedRegion] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingSong, setEditingSong] = useState(null)
    const itemsPerPage = 50

    const regionMapping = {
        cn: 'chinese',
        kr: 'korean',
        vn: 'vietnam',
        us: 'world',
        jp: 'japanese'
    }

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
            console.error(t('admin.loadError'), error)
            showError(t('admin.cantLoadList'))
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (song) => {
        setOpenDropdown(null)
        setEditingSong(song)
        setShowEditModal(true)
    }

    const handleDelete = async (song) => {
        setOpenDropdown(null)

        // Confirm dialog
        const result = await Swal.fire({
            title: t('admin.deleteConfirm'),
            html: `Bạn có chắc muốn xóa:<br><strong>${song.name}</strong>?<br><br>
                   <span style="color: #ff4444">⚠️ Hành động này không thể hoàn tác!</span>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#d33',
            background: '#1e1e1e',
            color: '#fff'
        })

        if (!result.isConfirmed) return

        try {
            await deleteSongFromFirebase(song.id, song.txtFilePath)
            showSuccess(t('admin.deleteSuccess'))
            fetchSongs()
        } catch (error) {
            console.error('Delete error:', error)
            showError('❌ Lỗi: ' + error.message)
        }
    }

    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id)
        showSuccess('Đã sao chép ID!')
    }

    const filteredSongs = songs.filter(s => {
        const query = searchQuery.toLowerCase()
        const matchesSearch = s.name?.toLowerCase().includes(query) ||
            s.author?.toLowerCase().includes(query) ||
            s.composer?.toLowerCase().includes(query) ||
            s.id?.toLowerCase().includes(query)

        const matchesRegion = selectedRegion === 'all' || s.region === regionMapping[selectedRegion]
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
        { value: 'all', label: t('admin.regions.all') },
        { value: 'cn', label: t('admin.regions.china') },
        { value: 'kr', label: t('admin.regions.korea') },
        { value: 'vn', label: t('admin.regions.vietnam') },
        { value: 'us', label: t('admin.regions.world') },
        { value: 'jp', label: t('admin.regions.japan') },
    ]

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-page-header">
                    <h1>{t('admin.songsManagement')}</h1>
                </div>
                <div className="songs-loading">
                    {t('admin.loading')}
                </div>
            </div>
        )
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>{t('admin.songsManagement')}</h1>
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
                    placeholder={t('admin.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="songs-search-input"
                />
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => setShowUploadModal(true)}
                >
                    {t('admin.addSong')}
                </button>
            </div>

            <div className="songs-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t('admin.songs')}</th>
                            <th>Giá</th>
                            <th style={{ width: '80px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedSongs.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="songs-table-empty">
                                    {searchQuery || selectedRegion !== 'all' ? t('admin.songNotFound') : t('admin.noSongs')}
                                </td>
                            </tr>
                        ) : (
                            paginatedSongs.map((s, index) => {
                                const isNearBottom = index >= paginatedSongs.length - 3
                                return (
                                    <tr key={s.id}>
                                        <td>
                                            <div
                                                className="songs-info-cell clickable"
                                                onClick={() => handleCopyId(s.id)}
                                                title="Click để sao chép ID"
                                            >
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
                        {t('admin.prev')}
                    </button>

                    <div className="pagination-info">
                        <span>{t('admin.page')} </span>
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
                        {t('admin.next')}
                    </button>
                </div>
            )}

            <div className="songs-stats-footer">
                <span>{t('admin.total')}: <strong className="total">{songs.length}</strong> {t('player.songCount')}</span>
                <span>•</span>
                <span>{t('admin.showing')}: <strong className="total">{filteredSongs.length}</strong></span>
                <span>•</span>
                <span>{t('admin.totalValue')}: <strong className="value">{songs.reduce((sum, s) => sum + (s.price || 0), 0).toLocaleString()}</strong> xu</span>
            </div>

            {/* Click outside to close dropdown */}
            {openDropdown && (
                <div className="songs-dropdown-backdrop" onClick={() => setOpenDropdown(null)} />
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <UploadSheetModal
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        fetchSongs()
                        setShowUploadModal(false)
                    }}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && editingSong && (
                <EditSheetModal
                    song={editingSong}
                    onClose={() => {
                        setShowEditModal(false)
                        setEditingSong(null)
                    }}
                    onSuccess={() => {
                        fetchSongs()
                        setShowEditModal(false)
                        setEditingSong(null)
                    }}
                />
            )}
        </div>
    )
}
