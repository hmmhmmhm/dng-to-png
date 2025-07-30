import fs from 'fs';

// Test dcraw library functionality
async function testDcrawLibrary() {
  console.log('🧪 Testing dcraw library...');
  
  try {
    const dcraw = require('dcraw');
    console.log('✅ dcraw library loaded successfully');
    
    // Check if dcraw function is available
    if (typeof dcraw === 'function') {
      console.log('✅ dcraw function is available');
      
      // Test with an invalid buffer to see error handling
      try {
        const testBuffer = Buffer.from('invalid dng data');
        const result = dcraw(testBuffer, { identify: true });
        console.log('📋 Test result:', result);
      } catch (error) {
        console.log('⚠️  Expected error for invalid data:', error instanceof Error ? error.message : String(error));
      }
      
    } else {
      console.log('❌ dcraw is not a function, type:', typeof dcraw);
      console.log('📋 dcraw object:', dcraw);
    }
    
  } catch (error) {
    console.error('❌ Failed to load dcraw:', error);
    
    // Let's try alternative approaches
    console.log('\n🔄 Trying alternative DNG processing approaches...');
    
    // Test sharp with a simple image conversion
    try {
      const sharp = require('sharp');
      console.log('✅ Sharp library loaded successfully');
      
      // Create a simple test to ensure sharp works
      const testImageBuffer = Buffer.alloc(100 * 100 * 3, 128); // Simple gray image
      console.log('📊 Created test image buffer of size:', testImageBuffer.length);
      
    } catch (sharpError) {
      console.error('❌ Sharp error:', sharpError);
    }
  }
}

if (require.main === module) {
  testDcrawLibrary().catch(console.error);
}