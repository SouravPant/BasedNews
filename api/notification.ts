import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for Base App
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { title, body, targetUrl, notificationId } = req.body;

      // In a real implementation, you would:
      // 1. Store the notification in a database
      // 2. Send it via a push notification service
      // 3. Return the notification status

      // For now, we'll simulate a successful notification
      console.log('Notification sent:', { title, body, targetUrl, notificationId });

      return res.status(200).json({
        success: true,
        notificationId: notificationId || Date.now().toString(),
        message: 'Notification sent successfully'
      });
    } catch (error) {
      console.error('Notification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send notification'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}