export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { videoId } = req.body;
    const apiKey = process.env.SERPAPI_API_KEY;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'SerpAPI key not configured' });
    }

    console.log('Fetching transcript via SerpAPI for:', videoId);

    // Build SerpAPI request URL
    const params = new URLSearchParams({
      engine: 'youtube_video_transcript',
      v: videoId,
      api_key: apiKey,
      lang: 'en'  // English transcripts
    });

    const apiUrl = `https://serpapi.com/search.json?${params.toString()}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log('SerpAPI response:', JSON.stringify(data).substring(0, 200));

    // Check for errors
    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.transcript || data.transcript.length === 0) {
      throw new Error('No transcript available for this video');
    }

    // Combine all transcript segments
    const transcript = data.transcript
      .map(segment => segment.text)
      .join(' ')
      .trim();

    if (!transcript || transcript.length < 100) {
      throw new Error('Transcript too short or empty');
    }

    console.log('Transcript fetched successfully, length:', transcript.length);

    return res.status(200).json({ 
      transcript: transcript,
      length: transcript.length,
      segments: data.transcript.length
    });

  } catch (error) {
    console.error('Transcript error:', error);
    return res.status(500).json({ 
      error: 'Could not fetch transcript',
      message: error.message
    });
  }
}
```

### **Step 4: Commit and Deploy**

1. Commit the updated `api/transcript.js` to GitHub
2. Vercel auto-deploys
3. Wait 1-2 minutes

---

## **Test It:**

After deployment, try analyzing this video (I know it has captions):
```
https://www.youtube.com/watch?v=jNQXAC9IVRw
