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

    const params = new URLSearchParams({
      engine: 'youtube_video_transcript',
      v: videoId,
      api_key: apiKey,
      lang: 'en'
    });

    const apiUrl = 'https://serpapi.com/search.json?' + params.toString();
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    // DEBUG: Log the full response
    console.log('SerpAPI full response:', JSON.stringify(data, null, 2));
    console.log('Has transcript?', !!data.transcript);
    console.log('Transcript length:', data.transcript ? data.transcript.length : 0);

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.transcript || data.transcript.length === 0) {
      throw new Error('No transcript available for this video');
    }

    // DEBUG: Log first segment
    console.log('First segment:', JSON.stringify(data.transcript[0], null, 2));

    const transcript = data.transcript
    .map(segment => segment.snippet) 
      .join(' ')
      .trim();

    console.log('Combined transcript preview:', transcript.substring(0, 200));
    console.log('Final transcript length:', transcript.length);

    if (!transcript || transcript.length < 100) {
      throw new Error(`Transcript too short: ${transcript.length} chars. Preview: ${transcript.substring(0, 100)}`);
    }

    console.log('Transcript fetched successfully, length:', transcript.length);

    return res.status(200).json({ 
      transcript: transcript,
      length: transcript.length
    });

  } catch (error) {
    console.error('Transcript error:', error);
    return res.status(500).json({ 
      error: 'Could not fetch transcript',
      message: error.message
    });
  }
}
