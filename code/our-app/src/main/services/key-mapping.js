import { Key } from "@nut-tree-fork/nut-js";

export const KEY_MAPS = {
  Sky: {
    '1Key0': Key.Y,
    '1Key1': Key.U,
    '1Key2': Key.I,
    '1Key3': Key.O,
    '1Key4': Key.P,
    
    '1Key5': Key.H,
    '1Key6': Key.J,
    '1Key7': Key.K,
    '1Key8': Key.L,
    '1Key9': Key.Semicolon,
    
    '1Key10': Key.N,
    '1Key11': Key.M,
    '1Key12': Key.Comma,
    '1Key13': Key.Period,
    '1Key14': Key.Slash
  },
  
  Genshin: {
    '1Key0': Key.Z,
    '1Key1': Key.X,
    '1Key2': Key.C,
    '1Key3': Key.V,
    '1Key4': Key.B,
    '1Key5': Key.N,
    '1Key6': Key.M,
    
    '1Key7': Key.A,
    '1Key8': Key.S,
    '1Key9': Key.D,
    '1Key10': Key.F,
    '1Key11': Key.G,
    '1Key12': Key.H,
    '1Key13': Key.J,
    
    '1Key14': Key.Q,
    '1Key15': Key.W,
    '1Key16': Key.E,
    '1Key17': Key.R,
    '1Key18': Key.T,
    '1Key19': Key.Y,
    '1Key20': Key.U
  },
  
  Roblox: {
    '1Key0': Key.T,
    '1Key1': Key.Y,
    '1Key2': Key.U,
    '1Key3': Key.I,
    '1Key4': Key.O,
    '1Key5': Key.P,
    
    '1Key6': Key.A,
    '1Key7': Key.S,
    '1Key8': Key.D,
    '1Key9': Key.F,
    '1Key10': Key.G,
    '1Key11': Key.H,
    '1Key12': Key.J,
    '1Key13': Key.K,
    '1Key14': Key.L,
    
    '1Key15': Key.Z,
    '1Key16': Key.X,
    '1Key17': Key.C,
    '1Key18': Key.V,
    '1Key19': Key.B,
    '1Key20': Key.N,
    '1Key21': Key.M
  }
};

export const KEY_MAP = KEY_MAPS.Sky;

/**
 * Lấy key mapping theo game
 * @param {string} gameType - 'Sky', 'Genshin', 'Roblox', 'WhereWindMeet', 'Heartopia/15', etc.
 * @returns {Object} Key mapping object
 */
export function getKeyMap(gameType = 'Sky') {
  if (gameType === 'WhereWindMeet') {
    return KEY_MAPS.Genshin;
  }
  if (gameType === 'Heartopia/15') {
    return KEY_MAPS.Sky;
  }
  return KEY_MAPS[gameType] || KEY_MAPS.Sky;
}