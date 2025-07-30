import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { convertDngToPng } from './dng-converter';

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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

// Serve the main HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DNG to PNG Converter</title>
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
        </style>
    </head>
    <body>
        <div class="container">
            <h1>DNG to PNG Converter</h1>
            <p>DNG 파일을 PNG 파일로 변환합니다.</p>
            
            <form id="uploadForm" enctype="multipart/form-data">
                <input type="file" id="dngFile" name="dngFile" accept=".dng" required>
                <button type="submit">Convert to PNG</button>
            </form>
            
            <div id="result"></div>
        </div>

        <script>
            document.getElementById('uploadForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const fileInput = document.getElementById('dngFile');
                const result = document.getElementById('result');
                
                if (!fileInput.files[0]) {
                    result.innerHTML = '<div class="error">파일을 선택해주세요.</div>';
                    return;
                }
                
                const formData = new FormData();
                formData.append('dngFile', fileInput.files[0]);
                
                result.innerHTML = '<div class="loading">변환 중입니다... 잠시만 기다려주세요.</div>';
                
                try {
                    const response = await fetch('/convert', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        result.innerHTML = \`
                            <div class="success">
                                변환이 완료되었습니다!<br>
                                <a href="/download/\${data.filename}" download>PNG 파일 다운로드</a>
                            </div>
                        \`;
                    } else {
                        const error = await response.json();
                        result.innerHTML = \`<div class="error">오류: \${error.message}</div>\`;
                    }
                } catch (error) {
                    result.innerHTML = \`<div class="error">변환 중 오류가 발생했습니다: \${error.message}</div>\`;
                }
            });
        </script>
    </body>
    </html>
  `);
});

// Convert DNG to PNG endpoint
app.post('/convert', upload.single('dngFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'DNG 파일이 필요합니다.' });
    }

    const inputPath = req.file.path;
    const outputFilename = req.file.filename.replace(/\.[^/.]+$/, '.png');
    const outputPath = path.join('uploads', outputFilename);

    await convertDngToPng(inputPath, outputPath);

    // Clean up input file
    fs.unlinkSync(inputPath);

    res.json({ 
      message: '변환이 완료되었습니다.',
      filename: outputFilename
    });

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ 
      message: 'DNG 변환 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Download converted file
app.get('/download/:filename', (req, res) => {
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
    res.status(404).json({ message: '파일을 찾을 수 없습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 DNG to PNG Converter Server running on http://localhost:${PORT}`);
});