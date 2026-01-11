import { useApp } from '../contexts/AppContext';
import './SongCard.css';

export default function SongCard({ song, songKey, onPlay }) {
    const { buySong, toggleFavorite } = useApp();

    const handleClick = () => {
        if (onPlay) onPlay();
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
                    <span>🎤 {song.author}</span>
                    {song.composer && <span>✍️ {song.composer}</span>}
                </div>
            </div>

            <div className="card-actions">
                {song.isOwned ? (
                    <>
                        <button
                            className="btn-favorite"
                            onClick={handleFavorite}
                            title={song.isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
                        >
                            {song.isFavorite ? '❤️' : '🤍'}
                        </button>
                        <span className="card-owned">✅ Đã sở hữu</span>
                    </>
                ) : (
                    <span className="card-price">💰 {song.price} xu</span>
                )}
            </div>
        </div>
    );
}