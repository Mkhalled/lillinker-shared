import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

export const config = {
  api: { bodyParser: false },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

async function ensureUploadDir() {
  await fs.mkdir(uploadDir, { recursive: true });
  logger.info('Upload directory ensured:', uploadDir);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  logger.info('Received request', { method: req.method, url: req.url });

  if (req.method !== 'POST') {
    logger.warn('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await ensureUploadDir();

  const chunks: Buffer[] = [];
  let totalSize = 0;
  const maxFileSize = 5 * 1024 * 1024;

  req.on('data', (chunk: Buffer) => {
    totalSize += chunk.length;
    if (totalSize > maxFileSize) {
      logger.error('File too large');
      req.destroy(new Error('File too large'));
    } else {
      chunks.push(chunk);
    }
  });

  await new Promise<void>((resolve, reject) => {
    req.on('end', resolve);
    req.on('error', (err) => {
      logger.error('Request error:', err);
      reject(err);
    });
  });

  const buffer = Buffer.concat(chunks);
  const boundary = req.headers['content-type']?.split('boundary=')[1];
  if (!boundary) {
    logger.error('No boundary in content-type');
    return res.status(400).json({ error: 'No boundary' });
  }

  const parts = buffer.toString().split(`--${boundary}`);
  let fileBuffer: Buffer | null = null;
  let fileName: string | null = null;

  for (const part of parts) {
    if (part.includes('name="logo"')) {
      const fileNameMatch = part.match(/filename="(.+?)"/);
      fileName = fileNameMatch ? fileNameMatch[1] : 'upload';
      const start = part.indexOf('\r\n\r\n') + 4;
      const end = part.lastIndexOf('\r\n');
      if (start > 0 && end > start) {
        const startIndex = buffer.indexOf(part) + start;
        const endIndex = buffer.indexOf(part) + end;
        fileBuffer = buffer.slice(startIndex, endIndex);
      }
      logger.info('Logo file part found:', { fileName });
      break;
    }
  }

  if (!fileBuffer || !fileName) {
    logger.warn('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const ext = path.extname(fileName) || '.png';
  const uniqueName = `${uuidv4()}${ext}`;
  const filePath = path.join(uploadDir, uniqueName);

  await fs.writeFile(filePath, fileBuffer);
  logger.info('File saved', { filePath });

  res.status(200).json({ filePath: `/uploads/${uniqueName}` });
}
