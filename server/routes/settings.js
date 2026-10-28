import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const settingsFile = path.join(process.cwd(), 'storage', 'settings.json');
const cookiesFile = path.join(process.cwd(), 'storage', 'youtube-cookies.txt');

const defaultSettings = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  defaultAspectRatio: '9:16',
  defaultCaptionStyle: 'hormozi',
  defaultClippingStyle: 'auto',
  defaultDuration: '30-60',
  defaultClipCount: 5,
  autoSilenceRemoval: true,
  autoNormalizeAudio: true,
  watermarkEnabled: false,
  watermarkText: 'BlackClovercut AI'
};

function readSettings() {
  try {
    if (fs.existsSync(settingsFile)) {
      return { ...defaultSettings, ...JSON.parse(fs.readFileSync(settingsFile, 'utf-8')) };
    }
  } catch (e) {
    console.warn('Could not read settings file:', e.message);
  }
  return defaultSettings;
}

function saveSettings(settings) {
  const dir = path.dirname(settingsFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8');
}

router.get('/', (req, res) => {
  const s = readSettings();
  const hasCookies = fs.existsSync(cookiesFile) && fs.statSync(cookiesFile).size > 0;
  let cookiesBytes = 0;
  if (hasCookies) {
    try { cookiesBytes = fs.statSync(cookiesFile).size; } catch (_) {}
  }

  // Mask API keys for security in UI
  const masked = {
    ...s,
    hasGeminiKey: Boolean(s.geminiApiKey),
    hasOpenAiKey: Boolean(s.openaiApiKey),
    hasYouTubeCookies: hasCookies,
    youtubeCookiesSize: cookiesBytes,
    geminiApiKeyMasked: s.geminiApiKey ? `${s.geminiApiKey.slice(0, 4)}...${s.geminiApiKey.slice(-4)}` : '',
    openaiApiKeyMasked: s.openaiApiKey ? `${s.openaiApiKey.slice(0, 4)}...${s.openaiApiKey.slice(-4)}` : ''
  };
  res.json({ success: true, settings: masked });
});

router.post('/', (req, res) => {
  try {
    const current = readSettings();
    const { youtubeCookies, clearCookies, ...rest } = req.body;
    
    // Handle YouTube Cookies file
    if (clearCookies) {
      if (fs.existsSync(cookiesFile)) fs.unlinkSync(cookiesFile);
    } else if (youtubeCookies && typeof youtubeCookies === 'string' && youtubeCookies.trim()) {
      const storageDir = path.dirname(cookiesFile);
      if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
      fs.writeFileSync(cookiesFile, youtubeCookies.trim(), 'utf-8');
    }

    const updated = { ...current, ...rest };
    saveSettings(updated);

    const hasCookies = fs.existsSync(cookiesFile) && fs.statSync(cookiesFile).size > 0;
    res.json({ 
      success: true, 
      settings: { ...updated, hasYouTubeCookies: hasCookies }, 
      message: 'Settings saved successfully.' 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
