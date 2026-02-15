import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import './PlayerBar.css';

export default function PlayerBar() {
    const { t } = useLanguage();
    const {
        currentSong,
        isPlaying,
        playbackMode,
        playbackSpeed,
        currentTime,
        duration,
        setPlaybackMode,
        setPlaybackSpeed,
        togglePlayback,
        seekTo,
        playNext,
        playPrev,
        importSongFile
    } = useApp();

    const [speedInput, setSpeedInput] = useState(playbackSpeed.toFixed(2));

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e) => {
        if (!currentSong || !duration) return;

        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * duration;

        seekTo(Math.max(0, Math.min(newTime, duration)));
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    const playbackModes = ['once', 'sequence', 'shuffle', 'repeat-one'];
    const modeNames = {
        'once': 'Phát 1 bài rồi dừng',
        'sequence': 'Phát lần lượt',
        'shuffle': 'Phát ngẫu nhiên',
        'repeat-one': 'Lặp 1 bài'
    };

    const toggleMode = () => {
        const currentIndex = playbackModes.indexOf(playbackMode);
        const nextIndex = (currentIndex + 1) % playbackModes.length;
        setPlaybackMode(playbackModes[nextIndex]);
    };

    const handleSpeedChange = (e) => {
        setSpeedInput(e.target.value);
    };

    const handleSpeedBlur = () => {
        const value = parseFloat(speedInput);
        if (!isNaN(value)) {
            const clampedValue = Math.max(0.50, Math.min(2.00, value));
            setPlaybackSpeed(clampedValue);
            setSpeedInput(clampedValue.toFixed(2));
        } else {
            setSpeedInput(playbackSpeed.toFixed(2));
        }
    };

    const renderModeIcon = () => {
        switch (playbackMode) {
            case 'once':
                return <path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zM7 7h10v3l4-4-4-4v3H5v6h2V7z" />;
            case 'sequence':
                return <path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zM7 7h10v3l4-4-4-4v3H5v6h2V7z" />;
            case 'shuffle':
                return <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />;
            case 'repeat-one':
                return (
                    <>
                        <path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zM7 7h10v3l4-4-4-4v3H5v6h2V7z" />
                        <text x="10" y="13" fontSize="7" fontWeight="bold" fill="currentColor" textAnchor="middle">1</text>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="player-bar">
            <div className="player-left">
                <div className="song-thumbnail">🎵</div>
                <div className="song-details">
                    <div className="song-title" id="statusTitle">
                        {currentSong ? currentSong.name : t('player.noSongSelected')}
                    </div>
                    <div className="song-artist" id="statusSub">
                        {currentSong ? currentSong.author : t('player.selectToStart')}
                    </div>
                </div>
            </div>

            <div className="player-center">
                <div className="player-actions">
                    <button
                        className="btn-mode"
                        data-mode={playbackMode}
                        title={modeNames[playbackMode]}
                        onClick={toggleMode}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            {renderModeIcon()}
                        </svg>
                    </button>

                    <button className="btn-control" title="Bài trước" onClick={() => playPrev(true)}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M3 2h2v12H3V2zm3 6l8-6v12l-8-6z" />
                        </svg>
                    </button>

                    <button id="btnMainPlay" className="btn-control btn-play" onClick={() => {
                        togglePlayback();
                    }}>
                        <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                            {isPlaying ? (
                                <path d="M5 2h2v12H5V2zm4 0h2v12H9V2z" />
                            ) : (
                                <path d="M3 2l10 6-10 6V2z" />
                            )}
                        </svg>
                    </button>

                    <button className="btn-control" title="Bài tiếp" onClick={() => playNext(true)}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11 2h2v12h-2V2zM2 2l8 6-8 6V2z" />
                        </svg>
                    </button>

                    <div className="speed-control">
                        <label htmlFor="speedInput">{t('player.speed')}:</label>
                        <input
                            type="number"
                            id="speedInput"
                            min="0.50"
                            max="2.00"
                            step="0.01"
                            value={speedInput}
                            onChange={handleSpeedChange}
                            onBlur={handleSpeedBlur}
                        />
                    </div>
                </div>

                <div className="progress-section">
                    <span className="time-current">{formatTime(currentTime)}</span>
                    <div className="progress-container" onClick={handleProgressClick} style={{ cursor: 'pointer' }}>
                        <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <span className="time-total">{formatTime(duration)}</span>
                </div>
            </div>

            <div className="player-right">
                <button
                    className="btn-add"
                    title="Import file nhạc từ máy tính"
                    onClick={importSongFile}
                >
                    ➕
                </button>
            </div>
        </div>
    );
}