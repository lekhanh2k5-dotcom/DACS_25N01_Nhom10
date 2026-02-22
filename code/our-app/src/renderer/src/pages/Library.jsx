import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import SongCard from '../components/SongCard';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Library() {
    const { songs, activeLibraryTab, setActiveLibraryTab, selectSong, importSongFile } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const { userData } = useAuth();
    const { t } = useLanguage();

    const ownedSongs = useMemo(() => {
        const owned = {};
        Object.keys(songs).forEach(key => {
            const song = songs[key];
            if (!song.isFromFirebase) {
                owned[key] = { ...song, isOwned: true };
            } else {
                const ownedItem = userData?.ownedSongs?.[key];
                // Check if purchased (can be true or Timestamp object)
                if (ownedItem) {
                    owned[key] = { 
                        ...song, 
                        isOwned: true,
                        purchasedAt: ownedItem?.toDate?.() || ownedItem
                    };
                }
            }
        });

        // Sort by purchasedAt (newest first)
        const sorted = Object.entries(owned)
            .sort(([, a], [, b]) => {
                const aTime = a.purchasedAt?.getTime?.() || 0;
                const bTime = b.purchasedAt?.getTime?.() || 0;
                return bTime - aTime; // Newest first
            })
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});

        return sorted;
    }, [songs, userData]);



    const favoriteSongs = useMemo(() => {
        return Object.keys(songs)
            .filter(key => {
                const song = songs[key];
                if (!song.isFromFirebase) return false;
                const isBought = userData?.ownedSongs?.[key] === true;
                return isBought && song.isFavorite;
            })
            .reduce((obj, key) => ({ ...obj, [key]: { ...songs[key], isOwned: true } }), {});
    }, [songs, userData]);

    const baseSongs = activeLibraryTab === 'all' ? ownedSongs : favoriteSongs;

    const displaySongs = useMemo(() => {
        return Object.keys(baseSongs).filter(key => {
            const song = baseSongs[key];
            const query = searchQuery.toLowerCase();
            return song.name.toLowerCase().includes(query) ||
                (song.artist && song.artist.toLowerCase().includes(query));
        }).reduce((obj, key) => ({ ...obj, [key]: baseSongs[key] }), {});
    }, [baseSongs, searchQuery]);

    return (
        <div id="view-library" className="content-view active">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="view-title" style={{ margin: 0 }}>📚 {t('library.title')}</h2>
                <input
                    type="text"
                    placeholder={t('library.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        padding: '10px 15px',
                        borderRadius: '20px',
                        border: '1px solid var(--border)',
                        background: 'var(--card-bg)',
                        color: 'var(--text-main)',
                        width: '250px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border 0.2s',
                    }}
                    onFocus={(e) => e.target.style.border = '1px solid var(--primary)'}
                    onBlur={(e) => e.target.style.border = '1px solid var(--border)'}
                />
            </div>

            <div className="library-tabs">
                <button
                    id="tab-all"
                    className={`library-tab ${activeLibraryTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveLibraryTab('all')}
                >
                    📁 {t('library.allSongs')}
                </button>
                <button
                    id="tab-favorites"
                    className={`library-tab ${activeLibraryTab === 'favorites' ? 'active' : ''}`}
                    onClick={() => setActiveLibraryTab('favorites')}
                >
                    ❤️ {t('library.favorite')}
                </button>
            </div>

            <div id="libList" className="song-grid">
                {Object.keys(displaySongs).length > 0 ? (
                    Object.keys(displaySongs).map((key) => (
                        <SongCard
                            key={key}
                            song={displaySongs[key]}
                            songKey={key}
                            onPlay={() => selectSong(key)}
                        />
                    ))
                ) : (
                    <p style={{ color: 'var(--text-sub)', padding: '20px' }}>
                        {t('library.empty')}
                    </p>
                )}
            </div>
        </div>
    );
}