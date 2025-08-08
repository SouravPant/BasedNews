// Vercel serverless function entry point
import createApp from '../server/index.js';

let appInstance: any = null;

export default async function handler(req: any, res: any) {
  if (!appInstance) {
    const { app } = await createApp();
    appInstance = app;
  }
  
  return appInstance(req, res);
}