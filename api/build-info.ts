import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.json({
    timestamp: new Date().toISOString(),
    version: '1.1.0',
    buildId: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    deploymentUrl: process.env.VERCEL_URL || 'unknown',
    walletFeatures: {
      baseWalletHook: true,
      connectWallet: true,
      chainSwitching: true,
      debugMode: true
    }
  });
}