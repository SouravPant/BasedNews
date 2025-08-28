import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    version: '1.2.0',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    branch: process.env.VERCEL_GIT_COMMIT_REF || 'unknown',
    deploymentUrl: process.env.VERCEL_URL || 'unknown',
    nodeVersion: process.version,
    status: 'PORTFOLIO_UPDATE_DEPLOYED',
    features: {
      walletConnectOptions: true,
      portfolioValue: true,
      removedConnectText: true,
      baseEcosystemTokens: true
    }
  };

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  return res.json(deploymentInfo);
}