// Farcaster SDK Ready Utility
let readyCalled = false;
let readyAttempts = 0;
const MAX_ATTEMPTS = 100;

export async function initializeFarcasterSDK() {
  if (readyCalled) return;
  
  readyAttempts++;
  console.log(`🔵 Farcaster SDK Init Attempt #${readyAttempts}`);
  
  try {
    // Method 1: Try direct SDK import
    try {
      const sdk = await import('@farcaster/frame-sdk');
      if (sdk?.default?.actions?.ready) {
        await sdk.default.actions.ready();
        console.log('✅ @farcaster/frame-sdk ready() called successfully');
        readyCalled = true;
        return;
      }
    } catch (e) {
      console.log('⚠️ Direct SDK import failed:', e);
    }
    
    // Method 2: Try global SDK references
    const globalRefs = ['sdk', 'frameSDK', 'farcasterSDK', 'MiniKit', '__FARCASTER_SDK__'];
    for (const ref of globalRefs) {
      try {
        const globalSDK = (window as any)[ref];
        if (globalSDK?.actions?.ready) {
          await globalSDK.actions.ready();
          console.log(`✅ Global ${ref}.actions.ready() called`);
          readyCalled = true;
          return;
        }
        if (globalSDK?.ready) {
          await globalSDK.ready();
          console.log(`✅ Global ${ref}.ready() called`);
          readyCalled = true;
          return;
        }
      } catch (e) {
        // Silent fail and try next
      }
    }
    
    // Method 3: PostMessage communication
    if (window.parent && window.parent !== window) {
      const messages = [
        { type: 'ready', source: 'based-news-app' },
        { type: 'frame-ready', source: 'based-news-app' },
        { type: 'miniapp-ready', source: 'based-news-app' },
        { type: 'sdk-ready', source: 'based-news-app' },
        { action: 'ready', data: { app: 'based-news' } },
        'FRAME_READY',
        'SDK_READY'
      ];
      
      messages.forEach(msg => {
        window.parent.postMessage(msg, '*');
      });
      console.log('✅ PostMessage ready signals sent');
    }
    
    // Method 4: Set global flags
    (window as any).__FARCASTER_READY__ = true;
    (window as any).__FRAME_READY__ = true;
    (window as any).__SDK_READY__ = true;
    
  } catch (error) {
    console.log(`⚠️ SDK Init attempt #${readyAttempts} failed:`, error);
  }
  
  // Retry if not successful and under max attempts
  if (!readyCalled && readyAttempts < MAX_ATTEMPTS) {
    setTimeout(initializeFarcasterSDK, 200);
  }
}

export function isSDKReady(): boolean {
  return readyCalled;
}

export function forceReadyCall() {
  readyCalled = false;
  readyAttempts = 0;
  initializeFarcasterSDK();
}