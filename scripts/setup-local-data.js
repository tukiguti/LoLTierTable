#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.CI) {
  console.log('CI environment detected. Skipping local data setup.');
  process.exit(0);
}


// Configuration - can be overridden by command line arguments
let DDRAGON_VERSION = '15.14.1';
let LANGUAGE = 'ja_JP';

// Parse command line arguments
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--version' && i + 1 < args.length) {
    DDRAGON_VERSION = args[i + 1];
    i++;
  } else if (args[i] === '--language' && i + 1 < args.length) {
    LANGUAGE = args[i + 1];
    i++;
  }
}

const CHAMPIONS_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/${LANGUAGE}/champion.json`;
const ICON_BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/`;

// Create directories
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'champions');
const tilesDir = path.join(publicDir, 'tiles');
const dataDir = path.join(publicDir, 'data');

[iconsDir, tilesDir, dataDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Download file helper
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Fetch champion data
function fetchChampionData() {
  return new Promise((resolve, reject) => {
    https.get(CHAMPIONS_URL, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Copy tiles from dragontail directory
function copyTilesFromDragontail() {
  const dragontailPath = '/Users/matsulab/Downloads/dragontail-15.14.1/img/champion/tiles';
  
  if (!fs.existsSync(dragontailPath)) {
    console.log('⚠️  Dragontail directory not found. Skipping tiles copy.');
    return false;
  }
  
  console.log('📋 Copying tiles from dragontail...');
  
  try {
    const files = fs.readdirSync(dragontailPath);
    const tileFiles = files.filter(file => file.endsWith('_0.jpg'));
    
    let copiedCount = 0;
    tileFiles.forEach(file => {
      const sourcePath = path.join(dragontailPath, file);
      const destPath = path.join(tilesDir, file);
      
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(sourcePath, destPath);
        copiedCount++;
      }
    });
    
    console.log(`✅ Copied ${copiedCount} tile files`);
    return true;
  } catch (error) {
    console.error('❌ Error copying tiles:', error.message);
    return false;
  }
}

// Main setup function
async function setupLocalData() {
  try {
    console.log(`🚀 Setting up local data for LoL Tier Table`);
    console.log(`📅 Version: ${DDRAGON_VERSION}`);
    console.log(`🌍 Language: ${LANGUAGE}`);
    
    // 1. Download champion metadata
    console.log('🔍 Fetching champion metadata...');
    const championData = await fetchChampionData();
    
    // Save raw champion data
    const rawDataPath = path.join(dataDir, 'champions.json');
    fs.writeFileSync(rawDataPath, JSON.stringify(championData, null, 2));
    console.log(`✅ Champion metadata saved to: ${rawDataPath}`);
    
    const champions = Object.values(championData.data);
    console.log(`📋 Found ${champions.length} champions`);
    
    // 2. Copy tiles from dragontail (if available)
    const tilesAvailable = copyTilesFromDragontail();
    
    // 3. Download champion icons (square icons)
    console.log('🔍 Downloading champion icons...');
    const downloadPromises = [];
    const maxConcurrent = 5;
    
    for (let i = 0; i < champions.length; i += maxConcurrent) {
      const batch = champions.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (champion) => {
        const iconUrl = `${ICON_BASE_URL}${champion.id}.png`;
        const iconPath = path.join(iconsDir, `${champion.id}.png`);
        
        // Skip if file already exists
        if (fs.existsSync(iconPath)) {
          console.log(`✅ ${champion.name} (${champion.id}) - icon already exists`);
          return;
        }
        
        try {
          await downloadFile(iconUrl, iconPath);
          console.log(`✅ ${champion.name} (${champion.id}) - icon downloaded`);
        } catch (error) {
          console.error(`❌ ${champion.name} (${champion.id}) - icon failed:`, error.message);
        }
      });
      
      await Promise.all(batchPromises);
      
      // Small delay between batches
      if (i + maxConcurrent < champions.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // 4. Create manifest files
    const championManifest = {
      version: DDRAGON_VERSION,
      language: LANGUAGE,
      downloadedAt: new Date().toISOString(),
      tilesAvailable: tilesAvailable,
      champions: champions.map(champion => ({
        id: champion.id,
        name: champion.name,
        title: champion.title,
        tags: champion.tags,
        localIconPath: `/champions/${champion.id}.png`,
        localTilePath: tilesAvailable ? `/tiles/${champion.id}_0.jpg` : null
      }))
    };
    
    const manifestPath = path.join(iconsDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(championManifest, null, 2));
    
    const dataManifestPath = path.join(dataDir, 'manifest.json');
    fs.writeFileSync(dataManifestPath, JSON.stringify(championManifest, null, 2));
    
    console.log('🎉 Setup complete!');
    console.log(`📁 Icons saved to: ${iconsDir}`);
    console.log(`📁 Tiles saved to: ${tilesDir}`);
    console.log(`📁 Data saved to: ${dataDir}`);
    console.log(`📄 Manifest created: ${manifestPath}`);
    
    // 5. Update API service configuration
    console.log('🔧 Updating API service configuration...');
    updateApiServiceConfig();
    
  } catch (error) {
    console.error('❌ Error setting up local data:', error);
    process.exit(1);
  }
}

// Update the API service to use the new version
function updateApiServiceConfig() {
  const apiServicePath = path.join(__dirname, '..', 'src', 'services', 'api.ts');
  
  if (!fs.existsSync(apiServicePath)) {
    console.log('⚠️  API service file not found. Skipping configuration update.');
    return;
  }
  
  try {
    let content = fs.readFileSync(apiServicePath, 'utf8');
    
    // Update version
    content = content.replace(
      /const DDRAGON_VERSION = '[^']+';/,
      `const DDRAGON_VERSION = '${DDRAGON_VERSION}';`
    );
    
    fs.writeFileSync(apiServicePath, content);
    console.log('✅ API service configuration updated');
  } catch (error) {
    console.error('❌ Error updating API service:', error.message);
  }
}

// Display help
function showHelp() {
  console.log(`
Usage: node setup-local-data.js [options]

Options:
  --version <version>    Data Dragon version (default: ${DDRAGON_VERSION})
  --language <language>  Language code (default: ${LANGUAGE})
  --help                 Show this help message

Examples:
  node setup-local-data.js
  node setup-local-data.js --version 15.14.1 --language en_US
  node setup-local-data.js --version 14.23.1 --language ko_KR
`);
}

// Handle help flag
if (args.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  setupLocalData();
}

export { setupLocalData };
