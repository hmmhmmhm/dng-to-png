import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function createTestImages() {
  console.log('🎨 Creating test images...');
  
  const testDir = 'test-files';
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  try {
    // Create a simple test image (RGB gradient)
    const width = 800;
    const height = 600;
    
    // Create RGB gradient buffer
    const buffer = Buffer.alloc(width * height * 3);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * 3;
        buffer[offset] = Math.floor((x / width) * 255);     // Red gradient
        buffer[offset + 1] = Math.floor((y / height) * 255); // Green gradient
        buffer[offset + 2] = 128;                           // Blue constant
      }
    }
    
    // Save as TIFF (to simulate RAW-like data)
    const tiffPath = path.join(testDir, 'test-image.tiff');
    await sharp(buffer, {
      raw: {
        width: width,
        height: height,
        channels: 3
      }
    })
    .tiff({
      compression: 'none',
      quality: 100
    })
    .toFile(tiffPath);
    
    console.log('✅ Created test TIFF image:', tiffPath);
    
    // Test converting TIFF to PNG
    const pngPath = path.join(testDir, 'test-converted.png');
    await sharp(tiffPath)
      .png({
        quality: 90,
        compressionLevel: 6
      })
      .toFile(pngPath);
    
    console.log('✅ Successfully converted TIFF to PNG:', pngPath);
    
    // Get file sizes
    const tiffStats = fs.statSync(tiffPath);
    const pngStats = fs.statSync(pngPath);
    
    console.log('📊 TIFF size:', (tiffStats.size / (1024 * 1024)).toFixed(2), 'MB');
    console.log('📊 PNG size:', (pngStats.size / (1024 * 1024)).toFixed(2), 'MB');
    
    return { tiffPath, pngPath };
    
  } catch (error) {
    console.error('❌ Failed to create test images:', error);
    throw error;
  }
}

if (require.main === module) {
  createTestImages().catch(console.error);
}

export { createTestImages };