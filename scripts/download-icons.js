#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.CI) {
  console.log('CI environment detected. Skipping champion icon download.');
  process.exit(0);
}


const DDRAGON_VERSION = '13.24.1';
const LANGUAGE = 'ja_JP';
const CHAMPIONS_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/${LANGUAGE}/champion.json`;
const ICON_BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/`;

// Create directories
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'champions');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log(`Created directory: ${iconsDir}`);
}

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

// Main download function
async function downloadChampionIcons() {
  try {
    console.log('🔍 Fetching champion data...');
    const championData = await fetchChampionData();
    
    const champions = Object.values(championData.data);
    console.log(`📋 Found ${champions.length} champions`);
    
    const downloadPromises = [];
    const maxConcurrent = 5; // Limit concurrent downloads to avoid overwhelming the server
    
    for (let i = 0; i < champions.length; i += maxConcurrent) {
      const batch = champions.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (champion) => {
        const iconUrl = `${ICON_BASE_URL}${champion.id}.png`;
        const iconPath = path.join(iconsDir, `${champion.id}.png`);
        
        // Skip if file already exists
        if (fs.existsSync(iconPath)) {
          console.log(`✅ ${champion.name} (${champion.id}) - already exists`);
          return;
        }
        
        try {
          await downloadFile(iconUrl, iconPath);
          console.log(`✅ ${champion.name} (${champion.id}) - downloaded`);
        } catch (error) {
          console.error(`❌ ${champion.name} (${champion.id}) - failed:`, error.message);
        }
      });
      
      await Promise.all(batchPromises);
      
      // Small delay between batches to be respectful to the server
      if (i + maxConcurrent < champions.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Create a manifest file for the downloaded icons
    const manifest = {
      version: DDRAGON_VERSION,
      language: LANGUAGE,
      downloadedAt: new Date().toISOString(),
      champions: champions.map(champion => ({
        id: champion.id,
        name: champion.name,
        title: champion.title,
        tags: champion.tags,
        localIconPath: `/champions/${champion.id}.png`
      }))
    };
    
    const manifestPath = path.join(iconsDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log('🎉 Download complete!');
    console.log(`📁 Icons saved to: ${iconsDir}`);
    console.log(`📄 Manifest created: ${manifestPath}`);
    
  } catch (error) {
    console.error('❌ Error downloading champion icons:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadChampionIcons();
}

export { downloadChampionIcons };
