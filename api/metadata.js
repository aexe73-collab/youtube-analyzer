export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { videoId } = req.query;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    if (!apiKey) {
      // Return defaults if no API key
      return res.status(200).json({
        title: 'Video Title Unavailable',
        channel: 'Channel Name Unavailable'
      });
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return res.status(200).json({
        title: data.items[0].snippet.title,
        channel: data.items[0].snippet.channelTitle
      });
    }

    return res.status(200).json({
      title: 'Video Title Unavailable',
      channel: 'Channel Name Unavailable'
    });

  } catch (error) {
    console.error('Metadata error:', error);
    return res.status(200).json({
      title: 'Video Title Unavailable',
      channel: 'Channel Name Unavailable'
    });
  }
}
```

5. Commit

---

## **Make Sure YouTube API Key is in Vercel:**

1. Vercel → Settings → Environment Variables
2. Check if `YOUTUBE_API_KEY` exists (your Google API key from earlier)
3. If not, add it:
   - **Key**: `YOUTUBE_API_KEY`
   - **Value**: Your `AIza...` key
   - Check all environments
4. **Redeploy** if you added/changed it

---

**After deployment, your reports will show:**
```
# YouTube Insights Report

## Video 1
**Title:** How AI Will Change Everything
**Channel:** My First Million
**Link:** https://youtube.com/watch?v=...

---

## Key Insights
[Analysis here]
