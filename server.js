const express = require('express');
const cors = require('cors');
const path = require('path');
const { YoutubeTranscript } = require('youtube-transcript');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(__dirname));

// Route root to index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/transcript', async (req, res) => {
    try {
        const videoId = req.query.videoId;
        if (!videoId) {
            return res.status(400).json({ error: 'videoId parameter is required' });
        }

        console.log(`Fetching transcript for videoId: ${videoId}`);
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        res.json({ transcript });
    } catch (error) {
        // Silently return null transcript instead of throwing a 500 error in the console
        res.status(200).json({ transcript: null, error: 'Failed to fetch transcript.' });
    }
});

app.get('/api/title', async (req, res) => {
    try {
        const videoId = req.query.videoId;
        if (!videoId) return res.status(400).json({ error: 'videoId parameter is required' });
        
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
        const html = await response.text();
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        let title = titleMatch ? titleMatch[1] : 'Unknown Video';
        title = title.replace(' - YouTube', '').trim();
        
        res.json({ title });
    } catch (error) {
        console.error('Error fetching title:', error);
        res.status(500).json({ error: 'Failed to fetch title', title: 'Unknown Video' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
