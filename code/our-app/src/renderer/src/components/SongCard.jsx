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
                                    background: song.isFavorite ? '#1DB954' : 'rgba(255, 255, 255, 0.2)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    padding: '0',
                                    color: song.isFavorite ? '#fff' : 'var(--text-sub)',
                                    transition: 'all 0.3s ease',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {song.isFavorite ? '✓' : '+'}
                            </button>
                        )}
                        {!song.isOwned && (
                            <span className="card-price">💰 {song.price} {t('account.coins')}</span>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            className="btn-favorite"
                            onClick={handleFavorite}
                            title={song.isFavorite ? t('songCard.removeFromFavorite') : t('songCard.addToFavorite')}
                            style={{
                                background: song.isFavorite ? '#1DB954' : 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                padding: '0',
                                color: song.isFavorite ? '#fff' : 'var(--text-sub)',
                                transition: 'all 0.3s ease',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {song.isFavorite ? '✓' : '+'}
                        </button>
                        <button
                            className="btn-delete-song"
                            onClick={handleDelete}
                            title={t('common.delete')}
                        >
                            <span>🗑️</span>
                            <span>{t('common.delete')}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}