import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import './SongCard.css';

export default function SongCard({ song, songKey, onPlay }) {
    const { buySong, deleteSong, toggleFavorite } = useApp();
    const { t } = useLanguage();

    const handleClick = () => {
        if (song.isOwned) {
            if (onPlay) {
                onPlay();
            }
        } else if (song.isFromFirebase) {
            buySong(songKey, song.price);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        deleteSong(songKey);
    };

    const handleFavorite = (e) => {
        e.stopPropagation();
        toggleFavorite(songKey);
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
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {song.isOwned && (
                            <button
                                className="btn-favorite"
                                onClick={handleFavorite}
                                title={song.isFavorite ? t('songCard.removeFromFavorite') : t('songCard.addToFavorite')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    padding: '5px',
                                    opacity: song.isFavorite ? 1 : 0.4,
                                    color: song.isFavorite ? '#e91e63' : 'var(--text-sub)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                ❤️
                            </button>
                        )}
                        {!song.isOwned && (
                            <span className="card-price">💰 {song.price} {t('account.coins')}</span>
                        )}
                    </div>
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