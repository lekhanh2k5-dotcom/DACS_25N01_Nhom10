import fs from 'fs'

/**
 * Decode text buffer với auto-detect encoding (UTF-8 hoặc UTF-16LE)
 */
export function decodeText(buffer) {
  const b0 = buffer[0], b1 = buffer[1]
  const hasUtf16leBom = b0 === 0xFF && b1 === 0xFE
  const hasUtf8Bom = b0 === 0xEF && b1 === 0xBB && buffer[2] === 0xBF

  let text
  if (hasUtf16leBom) {
    text = buffer.toString('utf16le')
  } else if (hasUtf8Bom) {
    text = buffer.toString('utf8')
  } else {
    let zeroCount = 0
    for (let i = 1; i < Math.min(buffer.length, 2000); i += 2) {
      if (buffer[i] === 0) zeroCount++
    }
    text = zeroCount > 50 ? buffer.toString('utf16le') : buffer.toString('utf8')
  }

  return text.replace(/^\uFEFF/, '').trim()
}

/**
 * Đọc và parse file JSON
 */
export function readJsonFile(filePath) {
  const buffer = fs.readFileSync(filePath)
  const text = decodeText(buffer)
  return JSON.parse(text)
}
