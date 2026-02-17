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

    console.log('Fetching transcript for video:', videoId);

    // Fetch captions directly from YouTube
    const captionsUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`;
    const captionsResponse = await fetch(captionsUrl);

    if (!captionsResponse.ok) {
      // Try alternative languages if English fails
      const altUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en-US`;
      const altResponse = await fetch(altUrl);
      
      if (!altResponse.ok) {
        throw new Error('No captions available for this video');
      }
      
      const captionsXML = await altResponse.text();
      const transcript = parseTranscript(captionsXML);
      
      return res.status(200).json({ 
        transcript: transcript,
        length: transcript.length
      });
    }

    const captionsXML = await captionsResponse.text();
    const transcript = parseTranscript(captionsXML);

    if (!transcript || transcript.length < 50) {
      throw new Error('Could not extract meaningful transcript from video');
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

function parseTranscript(xml) {
  // Extract text from XML captions
  const textMatches = xml.match(/<text[^>]*>([^<]+)<\/text>/g) || [];
  
  const transcript = textMatches
    .map(match => {
      // Remove XML tags
      let text = match.replace(/<[^>]+>/g, '');
      // Decode HTML entities
      text = text
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      return text;
    })
    .join(' ')
    .trim();

  return transcript;
}
