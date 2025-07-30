import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Mode selection page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
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
                text-align: center;
            }
            h1 {
                color: #333;
                margin-bottom: 20px;
            }
            .mode-selection {
                display: flex;
                gap: 20px;
                justify-content: center;
                margin-top: 30px;
            }
            .mode-card {
                background: #fff;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                padding: 30px;
                text-decoration: none;
                color: #333;
                transition: all 0.3s ease;
                flex: 1;
                max-width: 300px;
            }
            .mode-card:hover {
                border-color: #007bff;
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0,123,255,0.3);
            }
            .mode-icon {
                font-size: 48px;
                margin-bottom: 15px;
            }
            .mode-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #007bff;
            }
            .mode-description {
                color: #666;
                line-height: 1.5;
            }
            .features {
                margin-top: 20px;
                text-align: left;
            }
            .features ul {
                list-style: none;
                padding: 0;
            }
            .features li {
                margin: 5px 0;
                padding-left: 20px;
                position: relative;
            }
            .features li:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #28a745;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔄 DNG to PNG Converter</h1>
            <p>Choose your preferred conversion mode:</p>
            
            <div class="mode-selection">
                <a href="/api-mode" class="mode-card">
                    <div class="mode-icon">🌐</div>
                    <div class="mode-title">API Mode</div>
                    <div class="mode-description">
                        Server-side conversion with high-quality processing
                    </div>
                    <div class="features">
                        <ul>
                            <li>Full dcraw + Sharp processing</li>
                            <li>High-quality PNG output</li>
                            <li>Large file support</li>
                            <li>Reliable conversion</li>
                        </ul>
                    </div>
                </a>
                
                <a href="/wasm-mode" class="mode-card">
                    <div class="mode-icon">⚡</div>
                    <div class="mode-title">WASM Mode</div>
                    <div class="mode-description">
                        Client-side conversion using WebAssembly
                    </div>
                    <div class="features">
                        <ul>
                            <li>Fast browser processing</li>
                            <li>No server upload needed</li>
                            <li>Privacy-focused</li>
                            <li>Offline capable</li>
                        </ul>
                    </div>
                </a>
            </div>
        </div>
    </body>
    </html>
  `);
});

// API Mode routes
app.use('/api-mode', require('./api-mode/server'));

// WASM Mode route
app.get('/wasm-mode', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/wasm-mode.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 DNG to PNG Converter running on http://localhost:${PORT}`);
  console.log(`📋 Choose between API mode and WASM mode`);
});