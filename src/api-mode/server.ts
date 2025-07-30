import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { convertDngToPng } from './dng-converter';

const router = express.Router();

// Configure CORS
router.use(cors());
router.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept DNG files
    if (file.mimetype === 'image/x-adobe-dng' || file.originalname.toLowerCase().endsWith('.dng')) {
      cb(null, true);
    } else {
      cb(new Error('Only DNG files are allowed!'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Serve the API mode interface
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DNG to PNG Converter - API Mode</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #333;
                text-align: center;
                margin-bottom: 10px;
            }
            .mode-badge {
                background: #007bff;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 14px;
                text-align: center;
                margin-bottom: 20px;
            }
            .back-link {
                color: #007bff;
                text-decoration: none;
                margin-bottom: 20px;
                display: inline-block;
            }
            .back-link:hover {
                text-decoration: underline;
            }
            form {
                margin: 20px 0;
            }
            input[type="file"] {
                width: 100%;
                padding: 10px;
                margin: 10px 0;
                border: 2px dashed #ccc;
                border-radius: 5px;
            }
            button {
                background-color: #007bff;
                color: white;
                padding: 12px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                width: 100%;
            }
            button:hover {
                background-color: #0056b3;
            }
            button:disabled {
                background-color: #6c757d;
                cursor: not-allowed;
            }
            .result {
                margin-top: 20px;
                padding: 15px;
                border-radius: 5px;
            }
            .success {
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .error {
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            .loading {
                background-color: #fff3cd;
                color: #856404;
                border: 1px solid #ffeaa7;
            }
            .info {
                background-color: #e2f3ff;
                color: #004085;
                border: 1px solid #b8daff;
                margin-bottom: 20px;
                padding: 15px;
                border-radius: 5px;
            }
            .progress {
                width: 100%;
                height: 20px;
                background-color: #f0f0f0;
                border-radius: 10px;
                overflow: hidden;
                margin: 10px 0;
            }
            .progress-bar {
                height: 100%;
                background-color: #007bff;
                width: 0%;
                transition: width 0.3s ease;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <a href="/" class="back-link">← Back to Mode Selection</a>
            <h1>🌐 DNG to PNG Converter</h1>
            <div class="mode-badge">API Mode - Server-side Processing</div>
            
            <div class="info">
                <strong>API Mode Features:</strong><br>
                • High-quality conversion using dcraw + Sharp<br>
                • Supports large DNG files (up to 50MB)<br>
                • Server-side processing for reliable results<br>
                • Full RAW processing pipeline
            </div>
            
            <form id="uploadForm" enctype="multipart/form-data">
                <input type="file" id="dngFile" name="dngFile" accept=".dng" required>
                <button type="submit" id="convertBtn">Convert to PNG</button>
            </form>
            
            <div id="progress" class="progress" style="display: none;">
                <div id="progressBar" class="progress-bar"></div>
            </div>
            
            <div id="result"></div>
        </div>

        <script>
            document.getElementById('uploadForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const fileInput = document.getElementById('dngFile');
                const result = document.getElementById('result');
                const convertBtn = document.getElementById('convertBtn');
                const progress = document.getElementById('progress');
                const progressBar = document.getElementById('progressBar');
                
                if (!fileInput.files[0]) {
                    result.innerHTML = '<div class="error">Please select a DNG file.</div>';
                    return;
                }
                
                const formData = new FormData();
                formData.append('dngFile', fileInput.files[0]);
                
                // Show loading state
                convertBtn.disabled = true;
                convertBtn.textContent = 'Converting...';
                progress.style.display = 'block';
                result.innerHTML = '<div class="loading">Converting DNG file... Please wait.</div>';
                
                // Simulate progress
                let progressValue = 0;
                const progressInterval = setInterval(() => {
                    progressValue += Math.random() * 20;
                    if (progressValue > 90) progressValue = 90;
                    progressBar.style.width = progressValue + '%';
                }, 500);
                
                try {
                    const response = await fetch('/api-mode/convert', {
                        method: 'POST',
                        body: formData
                    });
                    
                    clearInterval(progressInterval);
                    progressBar.style.width = '100%';
                    
                    if (response.ok) {
                        const data = await response.json();
                        result.innerHTML = \`
                            <div class="success">
                                ✅ Conversion completed successfully!<br>
                                <a href="/api-mode/download/\${data.filename}" download style="color: #155724; font-weight: bold;">📥 Download PNG file</a>
                            </div>
                        \`;
                    } else {
                        const error = await response.json();
                        result.innerHTML = \`<div class="error">❌ Error: \${error.message}</div>\`;
                    }
                } catch (error) {
                    clearInterval(progressInterval);
                    result.innerHTML = \`<div class="error">❌ Conversion failed: \${error.message}</div>\`;
                } finally {
                    convertBtn.disabled = false;
                    convertBtn.textContent = 'Convert to PNG';
                    setTimeout(() => {
                        progress.style.display = 'none';
                        progressBar.style.width = '0%';
                    }, 1000);
                }
            });
        </script>
    </body>
    </html>
  `);
});

// Convert DNG to PNG endpoint
router.post('/convert', upload.single('dngFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'DNG file is required.' });
    }

    const inputPath = req.file.path;
    const outputFilename = req.file.filename.replace(/\.[^/.]+$/, '.png');
    const outputPath = path.join('uploads', outputFilename);

    await convertDngToPng(inputPath, outputPath);

    // Clean up input file
    fs.unlinkSync(inputPath);

    res.json({ 
      message: 'Conversion completed successfully.',
      filename: outputFilename
    });

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ 
      message: 'Error occurred during DNG conversion.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Download converted file
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join('uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        console.error('Download error:', err);
      } else {
        // Clean up file after download
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 5000);
      }
    });
  } else {
    res.status(404).json({ message: 'File not found.' });
  }
});

module.exports = router;