import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { mockSongs } from '../data/songs';
import { loadSongsFromFirebase } from '../firebase/songService';
import { showAlert, showConfirm, showImportSuccess, showImportFail } from '../utils/alert';
import { purchaseSong } from '../firebase/coinService';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    // States
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
    const { currentUser } = useAuth();

    const playRef = useRef({ startedAt: 0, baseTime: 0 })

    useEffect(() => {
        if (!isPlaying) return
        playRef.current.startedAt = performance.now()
        playRef.current.baseTime = currentTime
    }, [isPlaying, currentTime])

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

            setSongs(loadedSongs);
            setLoading(false);
        };

        loadSongs();
    }, []);

    useEffect(() => {
        if (loading) return;

        const importedSongs = {};
        Object.entries(songs).forEach(([key, song]) => {
            if (song.isImported) {
                importedSongs[key] = song;
            }
        });

        try {
            localStorage.setItem('importedSongs', JSON.stringify(importedSongs));
        } catch (e) {
            console.error('Không lưu được imported songs:', e);
        }
    }, [songs, loading]);

    useEffect(() => {
        if (!isPlaying) return

        const id = setInterval(() => {
            const { startedAt, baseTime } = playRef.current
            const elapsed = performance.now() - startedAt
            const t = baseTime + elapsed * playbackSpeed

            const clamped = Math.min(t, duration)

            setCurrentTime(clamped)

            if (clamped >= duration) {
                setIsPlaying(false)
                clearInterval(id)
            }
        }, 100)

        return () => clearInterval(id)
    }, [isPlaying, playbackSpeed, duration])



    // Chọn bài hát
    const selectSong = async (songKey) => {
        const song = songs[songKey];
        if (!song) return;

        setCurrentSong({ ...song, key: songKey });
        setIsPlaying(false);
        setCurrentTime(0);

        // Nếu là bài cloud, tải songNotes từ Firebase Storage qua IPC
        if (song.txtFilePath) {
            const result = await window.api.sheet.secureLoad(song.txtFilePath);
            if (result.ok) {
                // Gán songNotes mới từ cloud
                setCurrentSong(prev => ({
                    ...prev,
                    songNotes: result.songNotes
                }));
                // Cập nhật duration nếu cần
                if (result.songNotes.length > 0) {
                    const lastNote = result.songNotes[result.songNotes.length - 1];
                    setDuration(lastNote ? lastNote.time + 1000 : 0);
                }
            } else {
                await showAlert('Không tải được dữ liệu bài hát từ cloud: ' + result.message);
            }
        } else {
            // ...xử lý như cũ cho bài local/import...
            if (song.songNotes && song.songNotes.length > 0) {
                const lastNote = song.songNotes[song.songNotes.length - 1];
                setDuration(lastNote ? lastNote.time + 1000 : 0);
            }
        }
    };

    // Toggle phát/dừng
    const togglePlayback = () => {
        if (!currentSong) return;
        if (!isPlaying) {
            setIsPlaying(true);
            window.api.autoPlay.start(currentSong.songNotes, currentTime, playbackSpeed);
        } else {
            setIsPlaying(false);
            window.api.autoPlay.stop();
        }
    };


    // Tua đến thời điểm
    const seekTo = (timeMs) => {
        setCurrentTime(timeMs);
    };

    // Phát bài tiếp theo
    const playNext = () => {
        const songKeys = Object.keys(songs);
        if (songKeys.length === 0 || !currentSong) return;

        const currentIndex = songKeys.findIndex(key => key === currentSong.key);
        const nextIndex = (currentIndex + 1) % songKeys.length;
        selectSong(songKeys[nextIndex]);
    };

    // Phát bài trước
    const playPrev = () => {
        const songKeys = Object.keys(songs);
        if (songKeys.length === 0 || !currentSong) return;

        const currentIndex = songKeys.findIndex(key => key === currentSong.key);
        const prevIndex = currentIndex - 1 < 0 ? songKeys.length - 1 : currentIndex - 1;
        selectSong(songKeys[prevIndex]);
    };

    // Toggle yêu thích
    const toggleFavorite = (songKey) => {
        setSongs(prev => ({
            ...prev,
            [songKey]: {
                ...prev[songKey],
                isFavorite: !prev[songKey]?.isFavorite
            }
        }));
    };

    // Mua bài hát
    const buySong = async (songKey, price) => {
        console.log("Kiểm tra Auth:", {
            user: currentUser,
            uid: currentUser?.uid
        });
        if (!currentUser) {
            await showAlert('Vui lòng đăng nhập để mua bài hát!');
            return false;
        }

        const song = songs[songKey];
        if (!song) return false;

        const ok = await showConfirm(`Bạn có muốn dùng ${price} xu để mua bài "${song.name}" không?`);
        if (!ok) return false;

        try {
            const result = await purchaseSong(currentUser.uid, { ...song, id: songKey, price });

            if (result.success) {
                await showAlert('Mua hàng thành công! Bài hát đã có trong thư viện của bạn.');
                return true;
            } else {
                await showAlert(result.message || 'Giao dịch thất bại.');
                return false;
            }
        } catch (error) {
            console.error('Lỗi buySong:', error);
            await showAlert('Đã xảy ra lỗi trong quá trình giao dịch.');
            return false;
        }
    };

    // Import bài hát
    const importSongFile = async () => {
        const result = await window.api.sheet.open()
        if (!result || result.ok === false) {
            if (result?.canceled) return
            await showImportFail(result?.message || 'Không đọc được file sheet')
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

        await showImportSuccess('Import thành công!')
    }


    // Xóa bài hát
    const deleteSong = async (songKey) => {
        if (!songKey) return;

        const song = songs[songKey];
        if (!song) return;

        if (!song.isImported) {
            await showAlert('Chỉ có thể xóa bài đã import từ máy.');
            return;
        }

        const ok = await showConfirm(`Xóa bài "${song.name}" khỏi thư viện?`);
        if (!ok) return;

        if (currentSong?.key === songKey) {
            window.api.autoPlay.stop();
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