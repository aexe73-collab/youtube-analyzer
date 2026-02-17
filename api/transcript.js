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

    // Try to fetch captions
    const captionsUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`;
    const captionsResponse = await fetch(captionsUrl);

    console.log('Response status:', captionsResponse.status);
    
    const captionsXML = await captionsResponse.text();
    console.log('XML length:', captionsXML.length);
    console.log('XML preview:', captionsXML.substring(0, 500));

    if (!captionsResponse.ok || captionsXML.includes('<?xml')) {
      // Try to get available caption tracks first
      const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const videoPageResponse = await fetch(videoPageUrl);
      const videoPageHTML = await videoPageResponse.text();
      
      // Look for caption tracks in the page
      const captionTracksMatch = videoPageHTML.match(/"captionTracks":\[([^\]]+)\]/);
      
      if (captionTracksMatch) {
        console.log('Found caption tracks:', captionTracksMatch[0].substring(0, 200));
        
        // Extract the base URL for captions
        const baseUrlMatch = captionTracksMatch[0].match(/"baseUrl":"([^"]+)"/);
        
        if (baseUrlMatch) {
          const captionUrl = baseUrlMatch[1].replace(/\\u0026/g, '&');
          console.log('Using caption URL:', captionUrl);
          
          const captionResponse = await fetch(captionUrl);
          const captionXML = await captionResponse.text();
          
          const transcript = parseTranscript(captionXML);
          
          if (transcript && transcript.length > 50) {
            return res.status(200).json({ 
              transcript: transcript,
              length: transcript.length
            });
          }
        }
      }
      
      throw new Error('No captions available for this video');
    }

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
      let text = match.replace(/<[^>]+>/g, '');
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
