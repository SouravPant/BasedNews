import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      // Handle Farcaster webhook events
      const { type, data } = req.body;

      console.log('📡 Farcaster webhook received:', {
        type,
        timestamp: new Date().toISOString(),
        data: JSON.stringify(data, null, 2)
      });

      // Handle different webhook event types
      switch (type) {
        case 'app.install':
          // User installed the mini app
          console.log('🎉 New app installation:', data.user);
          break;
          
        case 'app.uninstall':
          // User uninstalled the mini app
          console.log('👋 App uninstallation:', data.user);
          break;
          
        case 'cast.mention':
          // App was mentioned in a cast
          console.log('📢 App mentioned in cast:', data.cast);
          break;
          
        case 'cast.share':
          // Content was shared via the app
          console.log('🔄 Content shared:', data.cast);
          break;
          
        default:
          console.log('🔔 Unknown webhook event:', type);
      }

      // Respond to Farcaster that webhook was processed
      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process webhook',
        timestamp: new Date().toISOString()
      });
    }
  } else if (req.method === 'GET') {
    // Health check endpoint for webhook
    res.status(200).json({
      status: 'healthy',
      service: 'Based News Webhook',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}