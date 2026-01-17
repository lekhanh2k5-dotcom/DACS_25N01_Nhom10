import { keyboard } from "@nut-tree-fork/nut-js";
import { KEY_MAP } from "./key-mapping";

keyboard.config.autoDelayMs = 0; 

let isPlaying = false;
let timeoutId = null;

export const playerService = {
    
  async playChord(keys) {
    const nutKeys = keys.map(k => KEY_MAP[k]).filter(Boolean);
    
    await Promise.all(nutKeys.map(key => keyboard.pressKey(key)));
    await Promise.all(nutKeys.map(key => keyboard.releaseKey(key)));
  },

  stop() {
    isPlaying = false;
    if (timeoutId) clearTimeout(timeoutId);
    console.log("--- Đã dừng Auto ---");
  },

  async start(songNotes) {
    if (isPlaying) return;
    isPlaying = true;

    const chords = songNotes.reduce((acc, note) => {
      if (!acc[note.time]) acc[note.time] = [];
      acc[note.time].push(note.key);
      return acc;
    }, {});

    const timePoints = Object.keys(chords).map(Number).sort((a, b) => a - b);
    
    console.log(`--- Bắt đầu chơi: ${timePoints.length} mốc thời gian ---`);

    for (let i = 0; i < timePoints.length; i++) {
      if (!isPlaying) break;

      const currentTime = timePoints[i];
      const keys = chords[currentTime];

      await this.playChord(keys);

      if (i < timePoints.length - 1) {
        const nextTime = timePoints[i + 1];
        const delay = nextTime - currentTime;

        if (delay > 0) {
          await new Promise(resolve => {
            timeoutId = setTimeout(resolve, delay);
          });
        }
      }
    }

    isPlaying = false;
    console.log("--- Hoàn thành bài hát ---");
  }
};