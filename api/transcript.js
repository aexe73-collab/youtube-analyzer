export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    console.log('Fetching transcript for:', videoId);

    // Call the free transcript API
    const apiUrl = `https://yt-transcript-api.com/api/transcript?url=https://www.youtube.com/watch?v=${videoId}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.transcript || data.transcript.length === 0) {
      throw new Error('No transcript available for this video');
    }

    // Combine all transcript segments
    const transcript = data.transcript
      .map(item => item.text)
      .join(' ')
      .trim();

    if (!transcript || transcript.length < 100) {
      throw new Error('Transcript too short or empty');
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
