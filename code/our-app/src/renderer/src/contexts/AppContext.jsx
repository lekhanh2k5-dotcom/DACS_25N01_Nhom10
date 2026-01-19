import { createContext, useContext, useState, useEffect } from 'react';
import { mockSongs } from '../data/songs';

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

    // Load songs khi mount
    useEffect(() => {
        setSongs(mockSongs);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!isPlaying) return;

        const start = performance.now();
        const base = currentTime;

        const id = setInterval(() => {
            const elapsed = performance.now() - start;
            const t = base + elapsed * playbackSpeed;

            setCurrentTime(Math.min(t, duration));

            if (t >= duration) {
                setIsPlaying(false);
                clearInterval(id);
            }
        }, 100);

        return () => clearInterval(id);
    }, [isPlaying, playbackSpeed, duration]);


    // Chọn bài hát
    const selectSong = (songKey) => {
        const song = songs[songKey];
        if (!song) return;

        setCurrentSong({ ...song, key: songKey });
        setIsPlaying(false);
        setCurrentTime(0);

        // Tính duration từ last note
        if (song.songNotes && song.songNotes.length > 0) {
            const lastNote = song.songNotes[song.songNotes.length - 1];
            setDuration(lastNote ? lastNote.time + 1000 : 0);
        }
    };

    // Toggle phát/dừng
    const togglePlayback = () => {
        if (!currentSong) return;
        if (!isPlaying) {
            setIsPlaying(true);
            window.api.autoPlay.start(currentSong.songNotes, currentTime);
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

    // Mua bài hát (demo mode)
    const buySong = () => {
        alert('Chức năng mua bị tắt trong chế độ demo!');
        return false;
    };

    // Import bài hát
    const importSongFile = async () => {
        const result = await window.api.sheet.open()
        if (!result || result.ok === false) {
            if (result?.canceled) return
            alert(result?.message || 'Không đọc được file sheet')
            return
        }

        const { filePath, data } = result
        console.log('IMPORT filePath:', filePath)
        console.log('IMPORT data:', data)

        if (!data) {
            alert('Lỗi: data không tồn tại')
            return
        }
        let songData = data
        if (Array.isArray(data)) {
            if (data.length === 0) {
                alert('File JSON là array rỗng')
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
            alert(`File sheet không có songNotes hoặc songNotes rỗng.\n\nThông tin file:\n- Keys: ${Object.keys(data).join(', ')}\n- songNotes type: ${typeof data?.songNotes}\n- songNotes: ${JSON.stringify(data?.songNotes)?.slice(0, 100)}`)
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

        alert('✅ Import thành công!')
    }


    // Xóa bài hát
    const deleteSong = () => {
        alert('Chức năng xóa bị tắt trong chế độ demo!');
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