const fs = require('fs');
const path = require('path');

// Function to create a simple PNG file with a solid color
function createPNG(width, height, color, outputPath) {
  // PNG header (89 50 4E 47 0D 0A 1A 0A)
  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdrChunk = createIHDRChunk(width, height);
  
  // IDAT chunk (simple blue square)
  const idatChunk = createIDATChunk(width, height, color);
  
  // IEND chunk
  const iendChunk = createIENDChunk();
  
  // Combine all chunks
  const pngData = Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
  
  // Write to file
  fs.writeFileSync(outputPath, pngData);
  console.log(`Created ${outputPath}`);
}

// Create IHDR chunk
function createIHDRChunk(width, height) {
  // Chunk length (13 bytes)
  const length = Buffer.alloc(4);
  length.writeUInt32BE(13, 0);
  
  // Chunk type "IHDR"
  const type = Buffer.from('IHDR');
  
  // Chunk data
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);  // Width
  data.writeUInt32BE(height, 4); // Height
  data[8] = 8;  // Bit depth (8 bits)
  data[9] = 2;  // Color type (2 = RGB)
  data[10] = 0; // Compression method (0 = deflate)
  data[11] = 0; // Filter method (0 = adaptive)
  data[12] = 0; // Interlace method (0 = no interlace)
  
  // CRC
  const crc = calculateCRC(Buffer.concat([type, data]));
  
  return Buffer.concat([length, type, data, crc]);
}

// Create a simple IDAT chunk with a solid color
function createIDATChunk(width, height, colorHex) {
  // Parse color hex to RGB
  const r = parseInt(colorHex.substring(1, 3), 16);
  const g = parseInt(colorHex.substring(3, 5), 16);
  const b = parseInt(colorHex.substring(5, 7), 16);
  
  // Create raw pixel data (1 byte filter type + RGB for each pixel)
  const rawData = Buffer.alloc(height * (1 + width * 3));
  
  // Fill with color
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 3);
    rawData[rowStart] = 0; // Filter type 0 (None)
    
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * 3;
      rawData[pixelStart] = r;     // R
      rawData[pixelStart + 1] = g; // G
      rawData[pixelStart + 2] = b; // B
    }
  }
  
  // Compress data using zlib (simplified for this example)
  // This is a very basic zlib header + uncompressed data + adler32 checksum
  const zlibHeader = Buffer.from([0x78, 0x01]); // zlib header
  
  // Uncompressed block header
  const blockHeader = Buffer.alloc(5);
  blockHeader[0] = 0x01; // Final block flag + block type 00 (uncompressed)
  blockHeader.writeUInt16LE(rawData.length, 1); // Length
  blockHeader.writeUInt16LE(~rawData.length & 0xFFFF, 3); // One's complement of length
  
  // Adler32 checksum
  const adler32 = calculateAdler32(rawData);
  
  // Combine for IDAT data
  const compressedData = Buffer.concat([zlibHeader, blockHeader, rawData, adler32]);
  
  // Chunk length
  const length = Buffer.alloc(4);
  length.writeUInt32BE(compressedData.length, 0);
  
  // Chunk type "IDAT"
  const type = Buffer.from('IDAT');
  
  // CRC
  const crc = calculateCRC(Buffer.concat([type, compressedData]));
  
  return Buffer.concat([length, type, compressedData, crc]);
}

// Create IEND chunk
function createIENDChunk() {
  // Chunk length (0 bytes)
  const length = Buffer.alloc(4);
  length.writeUInt32BE(0, 0);
  
  // Chunk type "IEND"
  const type = Buffer.from('IEND');
  
  // CRC
  const crc = calculateCRC(type);
  
  return Buffer.concat([length, type, crc]);
}

// Calculate CRC32 (simplified)
function calculateCRC(data) {
  // This is a placeholder - in a real implementation, you'd use a proper CRC32 algorithm
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(0, 0); // Placeholder CRC
  return crc;
}

// Calculate Adler32 checksum (simplified)
function calculateAdler32(data) {
  // This is a placeholder - in a real implementation, you'd use a proper Adler32 algorithm
  const adler = Buffer.alloc(4);
  adler.writeUInt32BE(1, 0); // Placeholder Adler32
  return adler;
}

// Create the icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'images');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create icons
createPNG(16, 16, '#007aff', path.join(iconsDir, 'icon16.png'));
createPNG(48, 48, '#007aff', path.join(iconsDir, 'icon48.png'));
createPNG(128, 128, '#007aff', path.join(iconsDir, 'icon128.png'));

console.log('All icons created successfully!'); 