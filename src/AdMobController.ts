import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

// --- CONFIGURATION ---
// REPLACE THESE WITH YOUR REAL AD UNIT IDS!
const BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';       // <--- Test Banner ID
const INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712'; // <--- Test Interstitial ID
const DEATHS_BEFORE_AD = 5; 

let retryCount = 0;

export async function initializeAdMob() {
  try {
    await AdMob.initialize({ requestTrackingAuthorization: true });
  } catch (e) { console.error('AdMob Init Failed', e); }
}

export async function showSafeBanner() {
  try {
    await AdMob.showBanner({
      adId: BANNER_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM, 
      margin: 0,
      isTesting: true // <--- CHANGE TO FALSE BEFORE PUBLISHING
    });
  } catch (e) { console.error('Show Banner Failed', e); }
}

export async function hideBanner() {
  try { await AdMob.hideBanner(); } catch (e) {}
}

export async function handleTryAgain(startGameCallback: () => void) {
  retryCount++;
  if (retryCount % DEATHS_BEFORE_AD === 0) {
    try {
      await AdMob.prepareInterstitial({ adId: INTERSTITIAL_ID, isTesting: true });
      await AdMob.showInterstitial();
      startGameCallback();
    } catch (e) {
      startGameCallback();
    }
  } else {
    startGameCallback();
  }
}
