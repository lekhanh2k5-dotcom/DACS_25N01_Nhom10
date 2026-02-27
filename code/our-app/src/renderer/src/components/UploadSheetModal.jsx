import { useState } from 'react';
import { showSuccess, showError } from '../utils/alert';
import { uploadSheetToFirebase } from '../firebase/uploadService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './UploadSheetModal.css';

export default function UploadSheetModal({ onClose, onSuccess }) {
    const { user } = useAuth();
    const { t } = useLanguage();
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
                    showError(t('validation.fileNoNotes'));
                }
            } else {
                showError(t('validation.fileReadError') + (result.error || 'Unknown error'));
            }
        } catch (error) {
            showError(t('validation.fileSelectError') + error.message);
        }
    };

    const handleUpload = async () => {
        if (!metadata || !fileContent) {
            showError(t('validation.chooseFileFirst'));
            return;
        }

        if (metadata.songNotes.length === 0) {
            showError(t('validation.fileEmptyNotes'));
            return;
        }

        if (!metadata.name.trim()) {
            showError(t('validation.nameRequired'));
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
                showSuccess(t('validation.uploadSuccess') + result.songId);
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showError(t('validation.uploadFailed') + error.message);
        } finally {
            setUploading(false);
        }
    };

    const regions = [
        { value: 'vietnam', label: t('store.vietnam'), code: 'vn' },
        { value: 'chinese', label: t('store.china'), code: 'cn' },
        { value: 'korean', label: t('store.korea'), code: 'kr' },
        { value: 'japanese', label: t('store.japan'), code: 'jp' },
        { value: 'world', label: t('store.world'), code: 'wd' }
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
                            <p>{t('modal.selectFile')}</p>
                            <button className="upload-btn-primary" onClick={handleSelectFile}>
                                {t('modal.chooseFile')}
                            </button>
                        </div>
                    ) : (
                        <div className="upload-form">
                            <div className="form-group">
                                <label>{t('modal.songName')} *</label>
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
                                    <label>{t('modal.author')}</label>
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
                                    <label>{t('modal.region')} *</label>
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
                                    <label>{t('modal.price')} *</label>
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
                                <label>{t('modal.fileName')}</label>
                                <input
                                    type="text"
                                    value={metadata.fileName || ''}
                                    disabled
                                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                    placeholder="Tên file gốc"
                                />
                                <small style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    💡 Path thực tế: songs/txt/{metadata.fileName ? `${metadata.fileName}.txt` : 'Tên file.txt'}
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
                                    {t('modal.chooseOtherFile')}
                                </button>
                                <button
                                    className="upload-btn-primary"
                                    onClick={handleUpload}
                                    disabled={uploading}
                                >
                                    {uploading ? t('modal.uploading') : t('modal.upload')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
