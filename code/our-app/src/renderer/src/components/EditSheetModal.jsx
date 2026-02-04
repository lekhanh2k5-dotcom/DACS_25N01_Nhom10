import { useState } from 'react';
import { showSuccess, showError } from '../utils/alert';
import { updateSongMetadata } from '../firebase/updateService';
import './EditSheetModal.css';

export default function EditSheetModal({ song, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: song.name || '',
        author: song.author || '',
        composer: song.composer || '',
        region: song.region || 'world',
        price: song.price || 30000
    });
    const [updating, setUpdating] = useState(false);

    const regions = [
        { value: 'vietnam', label: '🇻🇳 Việt Nam', code: 'vn' },
        { value: 'chinese', label: '🇨🇳 Trung Quốc', code: 'cn' },
        { value: 'korean', label: '🇰🇷 Hàn Quốc', code: 'kr' },
        { value: 'japanese', label: '🇯🇵 Nhật Bản', code: 'jp' },
        { value: 'world', label: '🌍 Âu Mỹ', code: 'wd' }
    ];

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            showError('Tên bài hát không được rỗng!');
            return;
        }

        if (formData.price < 0) {
            showError('Giá phải >= 0!');
            return;
        }

        try {
            setUpdating(true);

            await updateSongMetadata(song.id, {
                name: formData.name.trim(),
                author: formData.author.trim(),
                composer: formData.composer.trim(),
                region: formData.region,
                price: Number(formData.price)
            });

            showSuccess('✅ Đã cập nhật bài hát!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Update failed:', error);
            showError('❌ Cập nhật thất bại: ' + error.message);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
            <div className="modal-content edit-modal">
                <div className="modal-header">
                    <h2>✏️ Chỉnh sửa bài hát</h2>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleUpdate} className="edit-form">
                        <div className="form-group">
                            <label>ID bài hát</label>
                            <input
                                type="text"
                                value={song.id}
                                disabled
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Tên bài hát *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nhập tên bài hát"
                                disabled={updating}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Tác giả</label>
                                <input
                                    type="text"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    placeholder="Nhập tên tác giả"
                                    disabled={updating}
                                />
                            </div>

                            <div className="form-group">
                                <label>Transcribed by</label>
                                <input
                                    type="text"
                                    value={formData.composer}
                                    onChange={(e) => setFormData({ ...formData, composer: e.target.value })}
                                    placeholder="Người transcribe"
                                    disabled={updating}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Region *</label>
                                <select
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    disabled={updating}
                                >
                                    {regions.map(r => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Giá (xu) *</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    min="0"
                                    step="1000"
                                    disabled={updating}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Đường dẫn Storage</label>
                            <input
                                type="text"
                                value={song.txtFilePath || ''}
                                disabled
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            />
                            <small style={{ color: '#999', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                💡 Đường dẫn file không thể thay đổi
                            </small>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="edit-btn-secondary"
                                onClick={onClose}
                                disabled={updating}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="edit-btn-primary"
                                disabled={updating}
                            >
                                {updating ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
