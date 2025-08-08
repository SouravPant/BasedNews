import type { VercelRequest, VercelResponse } from '@vercel/node';
import createApp from '../server/index.js';

let appInstance: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!appInstance) {
      const { app } = await createApp();
      appInstance = app;
    }
    
    return appInstance(req, res);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}