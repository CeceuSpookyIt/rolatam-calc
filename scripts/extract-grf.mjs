/**
 * extract-grf.mjs
 * Extracts files from GRF v3 "Event Horizon" format.
 * Usage: node scripts/extract-grf.mjs <pattern> [outDir]
 * Example: node scripts/extract-grf.mjs skill C:/Users/Marcel/rag/snapshots/grf-extracted
 */
import { openSync, readSync, closeSync, writeFileSync, mkdirSync } from 'fs';
import { inflateSync } from 'zlib';
import { dirname, join } from 'path';

const GRF_PATH = 'D:/Gravity/Ragnarok/data.grf';
const HEADER_SIZE = 46;

function readBytes(fd, offset, length) {
  const buf = Buffer.alloc(length);
  readSync(fd, buf, 0, length, offset);
  return buf;
}

function parseHeader(fd) {
  const buf = readBytes(fd, 0, HEADER_SIZE);
  const magic = buf.toString('ascii', 0, 14).replace(/\0/g, '');
  const ftOffset = buf.readUInt32LE(30);
  const seed = buf.readUInt32LE(34);
  const rawFileCount = buf.readUInt32LE(38);
  const version = buf.readUInt32LE(42);

  return {
    magic,
    ftAbsOffset: ftOffset + HEADER_SIZE,
    fileCount: rawFileCount - seed - 7,
    version,
  };
}

function parseFileTable(fd, header) {
  // v3: 12-byte FT header (u32 placeholder, u32 uncompressed, u32 compressed)
  const ftHeader = readBytes(fd, header.ftAbsOffset, 12);
  const uncompressedSize = ftHeader.readUInt32LE(4);
  const compressedSize = ftHeader.readUInt32LE(8);

  console.log(`File table: compressed=${compressedSize}, uncompressed=${uncompressedSize}`);

  const compressed = readBytes(fd, header.ftAbsOffset + 12, compressedSize);
  const decompressed = inflateSync(compressed);

  console.log(`Decompressed file table: ${decompressed.length} bytes`);

  const entries = [];
  let pos = 0;
  for (let i = 0; i < header.fileCount; i++) {
    // Null-terminated filename
    const nameEnd = decompressed.indexOf(0, pos);
    if (nameEnd < 0) break;
    const filename = decompressed.toString('latin1', pos, nameEnd);
    pos = nameEnd + 1;

    const compSize = decompressed.readUInt32LE(pos);
    const compSizePadded = decompressed.readUInt32LE(pos + 4);
    const decompSize = decompressed.readUInt32LE(pos + 8);
    const flags = decompressed.readUInt8(pos + 12);
    const dataOffset = decompressed.readUInt32LE(pos + 13);
    pos += 17;

    entries.push({ filename, compSize, compSizePadded, decompSize, flags, dataOffset });
  }

  return entries;
}

function extractFile(fd, entry) {
  const absOffset = entry.dataOffset + HEADER_SIZE;
  const raw = readBytes(fd, absOffset, entry.compSizePadded);

  // flags & 0x01 = file
  if (!(entry.flags & 0x01)) return null;

  // flags & 0x02 or 0x04 = encrypted — skip for now
  if (entry.flags & 0x06) {
    return null; // encrypted
  }

  try {
    return inflateSync(raw);
  } catch {
    return raw; // might already be uncompressed
  }
}

// Main
const pattern = process.argv[2] || 'skill';
const outDir = process.argv[3] || 'C:/Users/Marcel/rag/snapshots/grf-extracted';

console.log(`Opening: ${GRF_PATH}`);
const fd = openSync(GRF_PATH, 'r');

const header = parseHeader(fd);
console.log(`Magic: "${header.magic}", Version: 0x${header.version.toString(16)}, Files: ${header.fileCount}`);

console.log('Parsing file table...');
const entries = parseFileTable(fd, header);
console.log(`Parsed ${entries.length} entries`);

// Search for matching files
const lowerPattern = pattern.toLowerCase();
const matches = entries.filter(e => e.filename.toLowerCase().includes(lowerPattern));
console.log(`\nMatches for "${pattern}": ${matches.length}`);
matches.forEach(e => console.log(`  ${e.filename} (${e.decompSize} bytes, flags=0x${e.flags.toString(16)})`));

// Extract matches
mkdirSync(outDir, { recursive: true });
let extracted = 0;
for (const entry of matches) {
  const data = extractFile(fd, entry);
  if (!data) {
    console.log(`  SKIP (encrypted/dir): ${entry.filename}`);
    continue;
  }
  const outPath = join(outDir, entry.filename.replace(/\\/g, '/').split('/').pop());
  writeFileSync(outPath, data);
  console.log(`  OK: ${outPath} (${data.length} bytes)`);
  extracted++;
}

closeSync(fd);
console.log(`\nDone. Extracted ${extracted}/${matches.length} files to ${outDir}`);
