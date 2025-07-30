import fs from 'fs';
import path from 'path';
import { convertDngToPng } from '../src/api-mode/dng-converter';

async function testDngConversion() {
  console.log('🧪 Testing DNG to PNG conversion...');
  
  // Check if we have a sample DNG file
  const testDir = 'test-files';
  const sampleDngPath = path.join(testDir, 'sample1.dng');
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  if (!fs.existsSync(sampleDngPath)) {
    console.log('❌ No sample DNG file found at:', sampleDngPath);
    console.log('📝 Please place a sample DNG file at:', sampleDngPath);
    console.log('🔍 You can download a sample DNG from: https://www.adobe.com/support/downloads/dng/dng_samples.html');
    return;
  }
  
  try {
    const outputPath = path.join(testDir, 'converted.png');
    
    console.log('🔄 Converting DNG file...');
    console.log('📁 Input:', sampleDngPath);
    console.log('📁 Output:', outputPath);
    
    const startTime = Date.now();
    await convertDngToPng(sampleDngPath, outputPath);
    const endTime = Date.now();
    
    console.log('✅ Conversion completed successfully!');
    console.log('⏱️  Time taken:', (endTime - startTime) / 1000, 'seconds');
    
    // Check if output file exists and get its size
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log('📊 Output file size:', (stats.size / (1024 * 1024)).toFixed(2), 'MB');
      console.log('🎉 PNG file created successfully at:', outputPath);
    } else {
      console.log('❌ Output file was not created');
    }
    
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    
    // Let's also test what dcraw returns for debugging
    try {
      console.log('\n🔍 Testing dcraw directly...');
      const dcraw = require('dcraw');
      const dngBuffer = fs.readFileSync(sampleDngPath);
      
      console.log('📊 DNG file size:', (dngBuffer.length / (1024 * 1024)).toFixed(2), 'MB');
      
      // Try to get metadata first
      const metadata = dcraw(dngBuffer, { verbose: true, identify: true });
      console.log('📋 DNG metadata:', metadata);
      
    } catch (dcrawError) {
      console.error('❌ dcraw test failed:', dcrawError);
    }
  }
}

// Create a simple DNG file checker
function checkDngFile() {
  const testDir = 'test-files';
  const sampleDngPath = path.join(testDir, 'sample1.dng');
  
  if (fs.existsSync(sampleDngPath)) {
    const stats = fs.statSync(sampleDngPath);
    console.log('✅ Sample DNG file found');
    console.log('📊 File size:', (stats.size / (1024 * 1024)).toFixed(2), 'MB');
    return true;
  }
  
  return false;
}

if (require.main === module) {
  console.log('🚀 DNG Conversion Test Script');
  console.log('============================\n');
  
  if (checkDngFile()) {
    testDngConversion().catch(console.error);
  } else {
    console.log('ℹ️  To test the conversion, please:');
    console.log('1. Create a "test-files" directory');
    console.log('2. Place a sample DNG file named "sample1.dng" in it');
    console.log('3. Run this script again');
    console.log('\n📥 You can download sample DNG files from:');
    console.log('   https://www.adobe.com/support/downloads/dng/dng_samples.html');
  }
}