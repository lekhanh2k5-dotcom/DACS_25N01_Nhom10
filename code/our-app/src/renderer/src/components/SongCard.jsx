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
                    <div className="card-action-group">
                        {song.isOwned && (
                            <button
                                className={`btn-icon btn-favorite ${song.isFavorite ? 'active' : ''}`}
                                onClick={handleFavorite}
                                title={song.isFavorite ? t('songCard.removeFromFavorite') : t('songCard.addToFavorite')}
                            >
                                {song.isFavorite ? '♥' : '♡'}
                            </button>
                        )}
                        {!song.isOwned && (
                            <span className="card-price">💰 {song.price} {t('account.coins')}</span>
                        )}
                    </div>
                ) : (
                    <div className="card-action-group">
                        <button
                            className="btn-icon btn-delete"
                            onClick={handleDelete}
                            title={t('common.delete')}
                        >
                            🗑️
                        </button>
                        <button
                            className={`btn-icon btn-favorite ${song.isFavorite ? 'active' : ''}`}
                            onClick={handleFavorite}
                            title={song.isFavorite ? t('songCard.removeFromFavorite') : t('songCard.addToFavorite')}
                        >
                            {song.isFavorite ? '♥' : '♡'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}