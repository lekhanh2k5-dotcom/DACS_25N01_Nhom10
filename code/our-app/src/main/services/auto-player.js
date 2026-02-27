import { keyboard } from "@nut-tree-fork/nut-js";
import { getKeyMap } from "./key-mapping";

keyboard.config.autoDelayMs = 0;

let isPlaying = false;
let timeoutId = null;
let currentGameType = 'Sky'; 

const sleep = (ms) =>
  new Promise((resolve) => {
    timeoutId = setTimeout(resolve, ms);
  });

let onSongEndCallback = null;

export const playerService = {
  async playChord(keys) {
    const keyMap = getKeyMap(currentGameType);
    const nutKeys = keys.map((k) => keyMap[k]).filter(Boolean);

    await Promise.all(nutKeys.map((key) => keyboard.pressKey(key)));
    await Promise.all(nutKeys.map((key) => keyboard.releaseKey(key)));
  },

  stop() {
    isPlaying = false;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
    console.log("--- Đã dừng Auto ---");
  },

  setOnSongEnd(callback) {
    console.log("📝 Đăng ký callback cho song-ended");
    onSongEndCallback = callback;
  },

  async start(songNotes, playbackSpeed = 1.0, offsetMs = 0, gameType = 'Sky') {
    if (isPlaying) return;
    isPlaying = true;

    // Lưu game type để playChord sử dụng
    currentGameType = gameType;
    console.log(`🎮 Auto-play với game: ${gameType}`);
    isPlaying = true;

    const offset = Number.isFinite(Number(offsetMs)) ? Number(offsetMs) : 0;
    const speed = Math.max(0.1, Number(playbackSpeed) || 1);

    const chords = songNotes.reduce((acc, note) => {
      const t = Number(note.time) || 0;
      if (!acc[t]) acc[t] = [];
      acc[t].push(note.key);
      return acc;
    }, {});

    const timePoints = Object.keys(chords).map(Number).sort((a, b) => a - b);

    const startAt = performance.now() - offset / speed;

    for (let i = 0; i < timePoints.length; i++) {
      if (!isPlaying) break;

      const t0 = timePoints[i];
      if (t0 < offset) continue;

      const target = startAt + t0 / speed;
      const now = performance.now();
      const waitMs = target - now;

      if (waitMs > 0) await sleep(waitMs);
      if (!isPlaying) break;

      await this.playChord(chords[t0]);
    }

    // Wait for the last 1000ms after all notes
    if (isPlaying && timePoints.length > 0) {
      const lastTimePoint = timePoints[timePoints.length - 1];
      const target = startAt + (lastTimePoint + 1000) / speed;
      const now = performance.now();
      const waitMs = target - now;
      if (waitMs > 0) await sleep(waitMs);
    }

    isPlaying = false;
    timeoutId = null;
    console.log("\n========== ✅ SONG ENDED ==========");
    console.log("Callback registered?", !!onSongEndCallback);
    
    // Gọi callback khi bài hát kết thúc
    if (onSongEndCallback) {
      console.log("🎺 CALLING CALLBACK NOW...");
      try {
        onSongEndCallback();
        console.log("✅ Callback executed successfully");
      } catch (e) {
        console.error("❌ Error in callback:", e);
      }
    } else {
      console.log("❌ NO CALLBACK REGISTERED!");
    }
    console.log("============================\n");
  }
};
