import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Import dcraw WASM module
const dcraw = require('dcraw');

export async function convertDngToPng(inputPath: string, outputPath: string): Promise<void> {
  try {
    // Read the DNG file
    const dngBuffer = fs.readFileSync(inputPath);
    console.log(`📁 Reading DNG file: ${inputPath} (${(dngBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
    
    // Use dcraw to process DNG file
    console.log('🔄 Processing DNG file with dcraw...');
    
    // Try different dcraw options for better compatibility
    let result;
    const dcrawOptions = [
      // Option 1: Export as TIFF (most compatible)
      {
        T: true, // Export as TIFF
        4: true, // Linear 16-bit
        v: true  // Verbose output
      },
      // Option 2: Export as PPM (fallback)
      {
        4: true, // Linear 16-bit
        v: true  // Verbose output
      },
      // Option 3: Basic processing
      {
        v: true  // Verbose output only
      }
    ];

    for (let i = 0; i < dcrawOptions.length; i++) {
      try {
        console.log(`🔄 Trying dcraw option ${i + 1}...`);
        result = dcraw(dngBuffer, dcrawOptions[i]);
        
        console.log(`📋 dcraw result type: ${typeof result}`);
        console.log(`📋 dcraw result:`, result);
        
        if (result && result.buffer && result.buffer.length > 0) {
          console.log(`✅ dcraw option ${i + 1} successful! Output size: ${(result.buffer.length / 1024 / 1024).toFixed(2)} MB`);
          break;
        } else if (result && result.length > 0) {
          console.log(`✅ dcraw option ${i + 1} returned data! Size: ${(result.length / 1024 / 1024).toFixed(2)} MB`);
          result = { buffer: Buffer.from(result) };
          break;
        } else if (typeof result === 'string' && result.length > 0) {
          console.log(`📋 dcraw output string length: ${result.length}`);
          result = { buffer: Buffer.from(result, 'binary') };
          break;
        }
      } catch (optionError) {
        console.log(`❌ dcraw option ${i + 1} failed:`, optionError instanceof Error ? optionError.message : String(optionError));
        continue;
      }
    }

    if (!result || !result.buffer || result.buffer.length === 0) {
      throw new Error('dcraw failed to process DNG file with all attempted options');
    }

    console.log('🔄 Converting processed data to PNG with sharp...');
    
    // Convert the result to PNG using sharp
    const resultBuffer = Buffer.isBuffer(result.buffer) ? result.buffer : Buffer.from(result.buffer);
    
    await sharp(resultBuffer)
      .png({
        quality: 90,
        compressionLevel: 6,
        progressive: false
      })
      .toFile(outputPath);

    console.log(`✅ Successfully converted DNG to PNG: ${outputPath}`);

  } catch (error) {
    console.error('❌ DNG conversion error:', error);
    
    // Enhanced fallback: try with different sharp options
    try {
      console.log('🔄 Attempting enhanced fallback conversion...');
      
      // Try to read as TIFF first (in case DNG is TIFF-based)
      await sharp(inputPath, { failOnError: false })
        .png({
          quality: 80,
          compressionLevel: 6
        })
        .toFile(outputPath);
      console.log('✅ Fallback conversion successful');
    } catch (fallbackError) {
      console.error('❌ All conversion methods failed');
      console.error('Primary error:', error instanceof Error ? error.message : String(error));
      console.error('Fallback error:', fallbackError instanceof Error ? fallbackError.message : String(fallbackError));
      throw new Error(`DNG conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export async function getDngMetadata(inputPath: string): Promise<any> {
  try {
    const dngBuffer = fs.readFileSync(inputPath);
    
    // Get metadata using dcraw
    const metadata = dcraw(dngBuffer, {
      verbose: true,
      identify: true
    });

    return metadata;
  } catch (error) {
    console.error('Failed to get DNG metadata:', error);
    throw error;
  }
}