import express from 'express';
import cors from 'cors';
import youtubedl from 'youtube-dl-exec';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const app = express();
const PORT = process.env.PORT || 4000;

// Security headers middleware
app.use((req, res, next) => {
  res.header({
    'Content-Security-Policy': 
      "default-src 'self';" +
      "media-src 'self' blob:;" +
      "script-src 'self' 'unsafe-inline';" +
      "style-src 'self' 'unsafe-inline';",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'interest-cohort=()'
  });
  next();
});

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET'],
  allowedHeaders: ['Content-Type']
}));

// Video information endpoint
app.get('/download', async (req, res) => {
  try {
    const videoURL = req.query.url;
    
    if (!videoURL || !validateYouTubeUrl(videoURL)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const info = await youtubedl(videoURL, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      referer: 'https://www.youtube.com',
      addHeader: ['referer:youtube.com', 'user-agent:googlebot']
    });

    res.json({
      title: info.title,
      duration: info.duration_string,
      thumbnail: info.thumbnail,
      videoId: info.id
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch video info',
      details: error.message 
    });
  }
});

// Video streaming endpoint
app.get('/downloadFile', async (req, res) => {
  try {
    const videoURL = decodeURIComponent(req.query.url);
    
    if (!videoURL || !validateYouTubeUrl(videoURL)) {
      return res.status(400).send('Invalid YouTube URL');
    }

    const info = await youtubedl(videoURL, {
      dumpSingleJson: true,
      noCheckCertificates: true
    });

    const title = sanitizeFilename(info.title);
    
    res.header({
      'Content-Disposition': `inline; filename="${title}.mp4"`,
      'Content-Type': 'video/mp4',
      'Cache-Control': 'no-store',
      'Accept-Ranges': 'bytes'
    });

    const ytdlProcess = youtubedl.exec(videoURL, {
      format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
      output: '-',
      noCheckCertificates: true,
      referer: 'https://www.youtube.com'
    });

    ytdlProcess.stdout.pipe(res);

    ytdlProcess.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) res.status(500).send('Stream failed');
    });

    req.on('close', () => {
      if (!res.headersSent) ytdlProcess.kill();
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      error: 'Download failed',
      details: error.message 
    });
  }
});

// Helper functions
const validateYouTubeUrl = (url) => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return pattern.test(url);
};

const sanitizeFilename = (name) => {
  return name.replace(/[^a-z0-9\s-]/gi, '_').substring(0, 100);
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Streaming endpoint: http://localhost:${PORT}/downloadFile?url=YOUTUBE_URL`);
});