import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { mockSongs } from '../data/songs';
import { loadSongsFromFirebase } from '../firebase/songService';
import { showAlert, showConfirm, showImportSuccess, showImportFail } from '../utils/alert';
import { purchaseSong } from '../firebase/coinService';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

const AppContext = createContext();

// Helper to safely call window.api
const safeAutoPlay = {
    start: (songNotes, offsetMs = 0, playbackSpeed = 1.0, gameType = 'Sky') => {
        try {
            if (window.api?.autoPlay?.start) {
                window.api.autoPlay.start(songNotes, offsetMs, playbackSpeed, gameType);
            }
        } catch (e) {
            console.error('❌ Error calling autoPlay.start:', e);
        }
    },
    stop: () => {
        try {
            if (window.api?.autoPlay?.stop) {
                window.api.autoPlay.stop();
            }
        } catch (e) {
            console.error('❌ Error calling autoPlay.stop:', e);
        }
    },
    onEnd: (callback) => {
        try {
            if (window.api?.autoPlay?.onEnd) {
                window.api.autoPlay.onEnd(callback);
            }
        } catch (e) {
            console.error('❌ Error calling autoPlay.onEnd:', e);
        }
    }
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [songs, setSongs] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeTab, setActiveTab] = useState('store');
    const [activeLibraryTab, setActiveLibraryTab] = useState('all');
    const [playbackMode, setPlaybackMode] = useState('once');
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackContext, setPlaybackContext] = useState('all'); // 'all' | 'favorites'
    const { currentUser, userData } = useAuth();
    const { t, tf } = useLanguage();

    const playRef = useRef({
        realStartTime: 0,
        initialSongTime: 0
    });
    const playbackModeRef = useRef(playbackMode);
    const currentSongRef = useRef(currentSong);
    const songsRef = useRef(songs);
    const isPlayingRef = useRef(isPlaying);
    const playbackContextRef = useRef(playbackContext);

    useEffect(() => { playbackModeRef.current = playbackMode; }, [playbackMode]);
    useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);
    useEffect(() => { songsRef.current = songs; }, [songs]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
    useEffect(() => { playbackContextRef.current = playbackContext; }, [playbackContext]);
    const userDataRef = useRef(userData);
    useEffect(() => { userDataRef.current = userData; }, [userData]);

    const selectSongRef = useRef(null);
    const shuffleHistoryRef = useRef([]);
    const shuffleQueueRef = useRef([]);
    const stateRef = useRef({});
    useEffect(() => {
        if (!isPlaying) return
        playRef.current.startedAt = performance.now()
        playRef.current.baseTime = currentTime
    }, [isPlaying, currentTime])

    useEffect(() => {
        stateRef.current = {
            songs,
            currentSong,
            playbackMode,
            playbackSpeed,
            userData
        };
    }, [songs, currentSong, playbackMode, playbackSpeed, userData]);

    // Helper function to check permission
    const hasPermissionRef = (songKey) => {
        const state = stateRef.current;
        const song = state.songs[songKey];
        if (!song) return false;

        // Có thể phát nếu:
        // 1. Bài hát là local import, HOẶC
        // 2. Bài từ Firebase mà user đã mua
        if (song.isImported) return true;
        if (song.isFromFirebase && state.userData?.ownedSongs?.[songKey]) return true;
        return false;
    };

    useEffect(() => {
        const loadSongs = async () => {
            const loadedSongs = { ...mockSongs };
            try {
                const savedImportedSongs = localStorage.getItem('importedSongs');
                if (savedImportedSongs) {
                    const importedSongs = JSON.parse(savedImportedSongs);
                    Object.assign(loadedSongs, importedSongs);
                }
            } catch (e) {
                console.error('Không load được imported songs:', e);
            }
            try {
                const firebaseSongs = await loadSongsFromFirebase();
                Object.assign(loadedSongs, firebaseSongs);
            } catch (e) {
                console.error('Không load được Firebase songs:', e);
            }

            try {
                const savedFavorites = localStorage.getItem('favoriteSongs');
                if (savedFavorites) {
                    const favorites = JSON.parse(savedFavorites);
                    Object.keys(favorites).forEach(key => {
                        if (loadedSongs[key]) {
                            loadedSongs[key].isFavorite = true;
                        }
                    });
                }
            } catch (e) {
                console.error('Không load được favorites:', e);
            }

            setSongs(loadedSongs);
            setLoading(false);
        };

        loadSongs();
    }, []);

    useEffect(() => {
        if (loading) return;

        const importedSongs = {};
        const favorites = {};
        Object.entries(songs).forEach(([key, song]) => {
            if (song.isImported) {
                importedSongs[key] = song;
            }
            if (song.isFavorite) {
                favorites[key] = true;
            }
        });

        try {
            localStorage.setItem('importedSongs', JSON.stringify(importedSongs));
            localStorage.setItem('favoriteSongs', JSON.stringify(favorites));
        } catch (e) {
            console.error('Không lưu được imported songs hoặc favorites:', e);
        }
    }, [songs, loading]);

    useEffect(() => {
        if (!isPlaying) return;
        playRef.current.realStartTime = performance.now();
        playRef.current.initialSongTime = currentTime;

        const id = setInterval(() => {
            const now = performance.now();
            const realElapsed = now - playRef.current.realStartTime;
            const nextTime = playRef.current.initialSongTime + (realElapsed * playbackSpeed);
            const clamped = Math.min(nextTime, duration);
            setCurrentTime(clamped);

            // Chỉ dừng interval khi hết bài, việc chuyển bài do onEnd handler đảm nhiệm
            if (nextTime >= duration) {
                clearInterval(id);
                setCurrentTime(0);
            }
        }, 16);

        return () => {
            clearInterval(id);
        };
    }, [isPlaying, playbackSpeed, duration]);

    const hasPermission = (songKey) => {
        const song = songs[songKey];
        if (!song) return false;
        // Can play if: imported, free price, or user bought it
        if (song.isImported || !song.price || song.price === 0) return true;
        // Or if it's a mock/preloaded song without price set
        if (!song.isImported && !song.isFromFirebase) return true;
        // Firebase songs need to be bought
        return !!userData?.ownedSongs?.[songKey];
    };

    const selectSong = async (songKey, { autoStart = false, context = undefined, keepHistory = false } = {}) => {
        const song = songs[songKey];
        if (!song) return;
        if (!keepHistory) { shuffleHistoryRef.current = []; shuffleQueueRef.current = []; }
        // Set playback context: use passed context, or infer from current tab
        const newCtx = context !== undefined
            ? context
            : (activeTab === 'library' && activeLibraryTab === 'favorites' ? 'favorites' : 'all');
        setPlaybackContext(newCtx);
        const isImported = song.isImported;
        const isFromFirebase = song.isFromFirebase;
        const isBought = !!userData?.ownedSongs?.[songKey];
        if (isFromFirebase && !isBought && !isImported) {
            await showAlert(tf('validation.needToBuy', { name: song.name }));
            return;
        }

        window.api.autoPlay.stop();
        setIsPlaying(false);
        setCurrentTime(0);
        setCurrentSong({ ...song, key: songKey });
        let finalNotes = song.songNotes || [];
        let finalDuration = 0;

        if (song.txtFilePath) {
            const result = await window.api.sheet.secureLoad(song.txtFilePath);
            if (result.ok) {
                finalNotes = result.songNotes;
                setCurrentSong(prev => ({ ...prev, songNotes: finalNotes }));
            } else {
                await showAlert(t('validation.noDataFromCloud') + result.message);
                return;
            }
        }

        if (finalNotes.length > 0) {
            const lastNote = finalNotes[finalNotes.length - 1];
            finalDuration = lastNote ? lastNote.time + 1000 : 0;
            setDuration(finalDuration);
        }

        if (autoStart && finalNotes.length > 0) {
            const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
            const gameType = settings.game || 'Sky';
            setIsPlaying(true);
            window.api.autoPlay.start(finalNotes, 0, playbackSpeed, gameType);
        }
    };

    useEffect(() => { selectSongRef.current = selectSong; });

    const togglePlayback = () => {
        if (!currentSong) return;
        if (!isPlaying) {
            const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
            const gameType = settings.game || 'Sky';

            setIsPlaying(true);
            safeAutoPlay.start(currentSong.songNotes, currentTime, playbackSpeed, gameType);
        } else {
            setIsPlaying(false);
            window.api.autoPlay.stop();
        }
    };


    const seekTo = (timeMs) => {
        setCurrentTime(timeMs);
    };

    const buildPool = (ctx, excludeKey = null) => {
        const owned = userData?.ownedSongs || {};
        return Object.keys(songs).filter(k => {
            if (k === excludeKey) return false;
            const s = songs[k];
            if (!s) return false;
            const permitted = s.isImported || !s.price || s.price === 0 || !!owned[k];
            if (!permitted) return false;
            if (ctx === 'favorites') return !!s.isFavorite;
            return true;
        });
    };

    const playNext = () => {
        if (!currentSong) return;
        const ctx = playbackContext;

        if (playbackMode === 'shuffle') {
            shuffleHistoryRef.current.push(currentSong.key);
            if (shuffleQueueRef.current.length === 0) {
                const pool = buildPool(ctx, currentSong.key);
                for (let i = pool.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [pool[i], pool[j]] = [pool[j], pool[i]];
                }
                shuffleQueueRef.current = pool;
            }
            const nextKey = shuffleQueueRef.current.shift();
            if (nextKey) selectSong(nextKey, { autoStart: isPlaying, context: ctx, keepHistory: true });
        } else {
            const pool = buildPool(ctx);
            if (pool.length === 0) return;
            const currentIndex = pool.findIndex(key => key === currentSong.key);
            const nextIndex = (currentIndex + 1) % pool.length;
            selectSong(pool[nextIndex], { autoStart: isPlaying, context: ctx });
        }
    };

    const playPrev = () => {
        if (!currentSong) return;
        const ctx = playbackContext;

        if (playbackMode === 'shuffle') {
            const history = shuffleHistoryRef.current;
            if (history.length > 0) {
                const prevKey = history.pop();
                selectSong(prevKey, { autoStart: isPlaying, context: ctx, keepHistory: true });
            } else {
                const pool = buildPool(ctx, currentSong.key);
                if (pool.length === 0) return;
                const randomKey = pool[Math.floor(Math.random() * pool.length)];
                selectSong(randomKey, { autoStart: isPlaying, context: ctx, keepHistory: true });
            }
        } else {
            const pool = buildPool(ctx);
            if (pool.length === 0) return;
            const currentIndex = pool.findIndex(key => key === currentSong.key);
            const prevIndex = (currentIndex - 1 + pool.length) % pool.length;
            selectSong(pool[prevIndex], { autoStart: isPlaying, context: ctx });
        }
    };

    const toggleFavorite = (songKey) => {
        setSongs(prev => ({
            ...prev,
            [songKey]: {
                ...prev[songKey],
                isFavorite: !prev[songKey]?.isFavorite
            }
        }));
    };

    const buySong = async (songKey, price) => {
        console.log("Kiểm tra Auth:", {
            user: currentUser,
            uid: currentUser?.uid
        });
        if (!currentUser) {
            await showAlert(t('validation.loginToBuy'));
            return false;
        }

        const song = songs[songKey];
        if (!song) return false;

        const ok = await showConfirm(tf('validation.buyConfirm', { price, name: song.name }));
        if (!ok) return false;

        try {
            const result = await purchaseSong(currentUser.uid, { ...song, id: songKey, price });

            if (result.success) {
                await showAlert(t('validation.buySuccess'));
                setActiveTab('library');
                setActiveLibraryTab('all');
                return true;
            } else {
                await showAlert(result.message || t('validation.transactionFailed'));
                return false;
            }
        } catch (error) {
            console.error('Lỗi buySong:', error);
            await showAlert(t('validation.transactionError'));
            return false;
        }
    };

    const importSongFile = async () => {
        const result = await window.api.sheet.open()
        if (!result || result.ok === false) {
            if (result?.canceled) return
            await showImportFail(result?.message || t('validation.importFailed'))
            return
        }

        const { filePath, data } = result
        console.log('IMPORT filePath:', filePath)
        console.log('IMPORT data:', data)

        if (!data) {
            await showImportFail('Lỗi: data không tồn tại')
            return
        }
        let songData = data
        if (Array.isArray(data)) {
            if (data.length === 0) {
                await showImportFail('File JSON là array rỗng')
                return
            }
            songData = data[0]
        }
        console.log('IMPORT songData:', songData)
        console.log('IMPORT songData.songNotes:', songData?.songNotes)
        const songKey = filePath

        const song = {
            ...songData,
            key: songKey,
            name: songData?.name || 'Untitled',
            author: songData?.author || 'Unknown',
            transcribedBy: songData?.transcribedBy || 'Unknown',
            songNotes: Array.isArray(songData?.songNotes) ? songData.songNotes : [],
            isOwned: true,
            isImported: true
        }

        if (song.songNotes.length === 0) {
            await showImportFail(`File sheet không có songNotes hoặc songNotes rỗng.\n\nThông tin file:\n- Keys: ${Object.keys(data).join(', ')}\n- songNotes type: ${typeof data?.songNotes}\n- songNotes: ${JSON.stringify(data?.songNotes)?.slice(0, 100)}`)
            return
        }

        setSongs(prev => ({
            ...prev,
            [songKey]: song
        }))

        setCurrentSong(song)
        setIsPlaying(false)
        setCurrentTime(0)

        const maxTime = Math.max(...song.songNotes.map(n => Number(n.time) || 0))
        setDuration(maxTime + 1000)

        await showImportSuccess(t('validation.importSuccess'))
    }


    const deleteSong = async (songKey) => {
        if (!songKey) return;

        const song = songs[songKey];
        if (!song) return;

        if (!song.isImported) {
            await showAlert(t('validation.localSongsOnly'));
            return;
        }

        const ok = await showConfirm(tf('validation.deleteConfirm', { name: song.name }));
        if (!ok) return;

        if (currentSong?.key === songKey) {
            safeAutoPlay.stop();
            setIsPlaying(false);
            setCurrentSong(null);
            setCurrentTime(0);
            setDuration(0);
        }

        setSongs(prev => {
            const copy = { ...prev };
            delete copy[songKey];
            return copy;
        });
    };

    // Set up listener for when auto-play ends (register only once)
    useEffect(() => {
        const playSongDirect = async (song, songKey) => {
            if (!song) return false;

            console.log(`[playSongDirect] Song: ${song.name}, Has songNotes: ${!!song.songNotes}, txtFilePath: ${song.txtFilePath}`);

            let songNotes = song.songNotes;

            // If song has txtFilePath and NO notes (undefined or empty array), need to load from cloud
            if (song.txtFilePath && (!songNotes || songNotes.length === 0)) {
                console.log(`[playSongDirect] Loading notes from cloud: ${song.txtFilePath}`);
                try {
                    const result = await window.api?.sheet?.secureLoad(song.txtFilePath);
                    console.log(`[playSongDirect] Cloud load result:`, result);
                    if (result && result.ok && result.songNotes) {
                        songNotes = result.songNotes;
                        console.log(`[playSongDirect] ✅ Loaded ${songNotes.length} notes from cloud`);
                    } else {
                        console.error('⚠️ Failed to load song notes from cloud:', result?.message);
                        return false;
                    }
                } catch (e) {
                    console.error('❌ Error loading song notes:', e);
                    return false;
                }
            }

            if (!songNotes || songNotes.length === 0) {
                console.error(`⚠️ Song has no notes to play - songNotes: ${songNotes}, length: ${songNotes?.length}`);
                console.error(`   Song data:`, song);
                return false;
            }

            // Calculate duration
            const lastNote = songNotes[songNotes.length - 1];
            const songDuration = (lastNote?.time || 0) + 1000;

            const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
            const gameType = settings.game || 'Sky';

            console.log(`▶️ Phát: ${song.name}`);

            // Stop current playback
            safeAutoPlay.stop();

            // Wait a bit for stop to complete (giảm delay để nhanh hơn)
            await new Promise(r => setTimeout(r, 30));

            // Stop interval by setting isPlaying to false
            setIsPlaying(false);

            // Update song and timing data while isPlaying is false
            setCurrentSong({ ...song, key: songKey, songNotes });
            setCurrentTime(0);
            setDuration(songDuration);

            // Chờ state update (giảm delay)
            await new Promise(r => setTimeout(r, 40));

            // Start fresh playback
            setIsPlaying(true);
            safeAutoPlay.start(songNotes, 0, stateRef.current.playbackSpeed, gameType);

            return true;
        };

        const handleSongEnded = async () => {
            const state = stateRef.current;
            console.log(`\n\n🎵🎵🎵 SONG ENDED - Mode: ${state.playbackMode}`);
            console.log('Current song:', state.currentSong?.name);
            console.log('Total songs available:', Object.keys(state.songs).length);

            if (state.playbackMode === 'once') {
                console.log('📍 Mode ONCE: Stopping playback');
                setIsPlaying(false);
            }
            else if (state.playbackMode === 'sequence') {
                console.log('📍 Mode SEQUENCE: Chuyển sang bài tiếp theo');
                const songKeys = Object.keys(state.songs);
                if (songKeys.length === 0 || !state.currentSong) {
                    setIsPlaying(false);
                    return;
                }

                const currentIndex = songKeys.findIndex(key => key === state.currentSong.key);

                for (let i = 1; i <= songKeys.length; i++) {
                    const nextIndex = (currentIndex + i) % songKeys.length;
                    const nextKey = songKeys[nextIndex];

                    if (hasPermissionRef(nextKey)) {
                        const song = state.songs[nextKey];
                        console.log(`✅ Bài tiếp theo: ${song.name}`);

                        const played = await playSongDirect(song, nextKey);
                        if (played) return;
                    }
                }
                console.log('⚠️ Không tìm được bài tiếp theo');
                setIsPlaying(false);
            }
            else if (state.playbackMode === 'shuffle') {
                console.log('📍 Mode SHUFFLE: Finding random song');
                const allKeys = Object.keys(state.songs);
                console.log('  All songs count:', allKeys.length);
                const playableKeys = allKeys.filter(key => {
                    const allowed = hasPermissionRef(key);
                    if (!allowed) console.log(`    ❌ Not allowed: ${state.songs[key]?.name}`);
                    return allowed;
                });
                console.log('  Playable songs count:', playableKeys.length);

                if (playableKeys.length === 0) {
                    console.log('❌ NO PLAYABLE SONGS!');
                    setIsPlaying(false);
                    return;
                }

                const randomIndex = Math.floor(Math.random() * playableKeys.length);
                const randomKey = playableKeys[randomIndex];
                const randomSong = state.songs[randomKey];
                console.log(`✅ Selected: ${randomSong?.name}`);

                if (!randomSong) {
                    setIsPlaying(false);
                    return;
                }

                const played = await playSongDirect(randomSong, randomKey);
                if (!played) {
                    console.log('⚠️ Lỗi phát bài ngẫu nhiên');
                    setIsPlaying(false);
                }
            }
            else if (state.playbackMode === 'repeat-one') {
                console.log('📍 Mode REPEAT-ONE: Phát lại từ đầu');

                if (state.currentSong) {
                    const played = await playSongDirect(state.currentSong, state.currentSong.key);
                    if (!played) {
                        console.log('⚠️ Lỗi phát lại bài');
                        setIsPlaying(false);
                    }
                } else {
                    setIsPlaying(false);
                }
            }
        };

        console.log('✅ Listener sẵn sàng');
        console.log('[APPCONTEXT] Calling safeAutoPlay.onEnd now...');
        safeAutoPlay.onEnd(handleSongEnded);
        console.log('[APPCONTEXT] safeAutoPlay.onEnd setup completed');

        return () => {
            // No cleanup needed
        };
    }, []); // Only register once on mount

    const value = {
        songs,
        loading,
        currentSong,
        isPlaying,
        activeTab,
        activeLibraryTab,
        playbackMode,
        playbackSpeed,
        currentTime,
        duration,
        playbackContext,
        setActiveTab,
        setActiveLibraryTab,
        setPlaybackMode,
        setPlaybackSpeed,
        selectSong,
        togglePlayback,
        seekTo,
        playNext,
        playPrev,
        buySong,
        toggleFavorite,
        importSongFile,
        deleteSong
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};