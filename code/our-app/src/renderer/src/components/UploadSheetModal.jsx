import { useState } from 'react';
import { showSuccess, showError } from '../utils/alert';
import { uploadSheetToFirebase } from '../firebase/uploadService';
import { useAuth } from '../contexts/AuthContext';
import './UploadSheetModal.css';

export default function UploadSheetModal({ onClose, onSuccess }) {
    const { user } = useAuth();
    const [metadata, setMetadata] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleSelectFile = async () => {
        try {
            const result = await window.electron.ipcRenderer.invoke('sheet:extract-metadata');

            if (result.canceled) return;

            if (result.ok && result.metadata) {
                setMetadata(result.metadata);
                setFileContent(result.fileContent);

                if (!result.isValid) {
                    showError('⚠️ File không có songNotes hợp lệ!');
                }
            } else {
                showError('Không thể đọc file: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            showError('Lỗi khi chọn file: ' + error.message);
        }
    };

    const handleUpload = async () => {
        if (!metadata || !fileContent) {
            showError('Vui lòng chọn file trước!');
            return;
        }

        if (metadata.songNotes.length === 0) {
            showError('File không có notes để upload!');
            return;
        }

        if (!metadata.name.trim()) {
            showError('Tên bài hát không được rỗng!');
            return;
        }

        try {
            setUploading(true);
            setProgress(0);

            const result = await uploadSheetToFirebase(
                fileContent,
                metadata,
                user.uid,
                setProgress
            );

            if (result.success) {
                showSuccess(`✅ Upload thành công! ID: ${result.songId}`);
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showError('❌ Upload thất bại: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const regions = [
        { value: 'vietnam', label: '🇻🇳 Việt Nam', code: 'vn' },
        { value: 'chinese', label: '🇨🇳 Trung Quốc', code: 'cn' },
        { value: 'korean', label: '🇰🇷 Hàn Quốc', code: 'kr' },
        { value: 'japanese', label: '🇯🇵 Nhật Bản', code: 'jp' },
        { value: 'world', label: '🌍 Âu Mỹ', code: 'wd' }
    ];

    return (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
            <div className="modal-content upload-modal">
                <div className="modal-header">
                    <h2>📤 Upload Sheet</h2>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {!metadata ? (
                        <div className="upload-select-file">
                            <div className="upload-icon">📁</div>
                            <p>Chọn file .txt hoặc .json để upload</p>
                            <button className="upload-btn-primary" onClick={handleSelectFile}>
                                Chọn file
                            </button>
                        </div>
                    ) : (
                        <div className="upload-form">
                            <div className="form-group">
                                <label>Tên bài hát *</label>
                                <input
                                    type="text"
                                    value={metadata.name}
                                    onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                                    placeholder="Nhập tên bài hát"
                                    disabled={uploading}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tác giả</label>
                                    <input
                                        type="text"
                                        value={metadata.author}
                                        onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                                        placeholder="Nhập tên tác giả"
                                        disabled={uploading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Transcribed by</label>
                                    <input
                                        type="text"
                                        value={metadata.composer}
                                        onChange={(e) => setMetadata({ ...metadata, composer: e.target.value })}
                                        placeholder="Người transcribe"
                                        disabled={uploading}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Region *</label>
                                    <select
                                        value={metadata.region}
                                        onChange={(e) => setMetadata({ ...metadata, region: e.target.value })}
                                        disabled={uploading}
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
                                        value={metadata.price}
                                        onChange={(e) => setMetadata({ ...metadata, price: Number(e.target.value) })}
                                        min="0"
                                        step="1000"
                                        disabled={uploading}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Tên file gốc</label>
                                <input
                                    type="text"
                                    value={metadata.fileName || ''}
                                    disabled
                                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                    placeholder="Sẽ được tạo tự động theo songId"
                                />
                                <small style={{ color: '#999', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    💡 Path thực tế: songs/txt/song_XX_XXX.txt (tự động)
                                </small>
                            </div>

                            {uploading && (
                                <div className="upload-progress">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${progress * 100}%` }}
                                        />
                                    </div>
                                    <div className="progress-text">{Math.round(progress * 100)}%</div>
                                </div>
                            )}

                            <div className="form-actions">
                                <button
                                    className="upload-btn-secondary"
                                    onClick={() => setMetadata(null)}
                                    disabled={uploading}
                                >
                                    ← Chọn file khác
                                </button>
                                <button
                                    className="upload-btn-primary"
                                    onClick={handleUpload}
                                    disabled={uploading}
                                >
                                    {uploading ? '⏳ Đang upload...' : '🚀 Upload'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
