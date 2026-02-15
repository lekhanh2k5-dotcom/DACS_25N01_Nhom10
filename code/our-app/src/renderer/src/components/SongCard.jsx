import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import './SongCard.css';

export default function SongCard({ song, songKey, onPlay }) {
    const { buySong, deleteSong } = useApp();
    const { t } = useLanguage();

    const handleClick = () => {
        if (song.isOwned) {
            if (onPlay) {
                onPlay();
            }
        } else {
            buySong(songKey, song.price);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        deleteSong(songKey);
    };

    return (
        <div className="song-card" onClick={handleClick}>
            <div className="card-img">🎵</div>

            <div className="card-info">
                <div className="card-title">{song.name}</div>
                <div className="card-meta">
                    <span title="Ca sĩ gốc">🎤 {song.author}</span>
                    <span title="Người soạn nhạc">✍️ {song.transcribedBy || 'Ẩn danh'}</span>
                </div>
            </div>

            <div className="card-action">
                {song.isFromFirebase ? (
                    song.isOwned ? (
                        <span className="card-owned">✅ {t('common.owned')}</span>
                    ) : (
                        <span className="card-price">💰 {song.price} {t('account.coins')}</span>
                    )
                ) : (
                    <button
                        className="btn-delete-song"
                        onClick={handleDelete}
                        title={t('common.delete')}
                    >
                        <span>🗑️</span>
                        <span>{t('common.delete')}</span>
                    </button>
                )}
            </div>
        </div>
    );
}