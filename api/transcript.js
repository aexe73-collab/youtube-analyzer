export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { videoId } = req.body;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    console.log('Fetching captions for video:', videoId);

    // Step 1: Get caption tracks list
    const captionsListUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`;
    const captionsListResponse = await fetch(captionsListUrl);
    const captionsList = await captionsListResponse.json();

    if (captionsList.error) {
      throw new Error(captionsList.error.message || 'Could not access video captions');
    }

    if (!captionsList.items || captionsList.items.length === 0) {
      throw new Error('No captions available for this video');
    }

    // Find English caption track
    const englishTrack = captionsList.items.find(
      item => item.snippet.language === 'en' || item.snippet.language === 'en-US'
    ) || captionsList.items[0];

    const captionId = englishTrack.id;

    // Step 2: Download the caption content
    const captionDownloadUrl = `https://www.googleapis.com/youtube/v3/captions/${captionId}?tfmt=srt&key=${apiKey}`;
    const captionResponse = await fetch(captionDownloadUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!captionResponse.ok) {
      // API doesn't allow downloading - use alternative method
      console.log('Direct download failed, trying alternative method...');
      
      // Use the timedtext API as fallback
      const timedTextUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`;
      const timedTextResponse = await fetch(timedTextUrl);
      
      if (!timedTextResponse.ok) {
        throw new Error('Could not fetch video transcript');
      }

      const captionXML = await timedTextResponse.text();
      const transcript = parseXMLTranscript(captionXML);
      
      if (!transcript || transcript.length < 100) {
        throw new Error('Transcript too short or empty');
      }

      return res.status(200).json({ 
        transcript: transcript,
        length: transcript.length,
        language: englishTrack.snippet.language
      });
    }

    const captionText = await captionResponse.text();
    const transcript = parseSRTTranscript(captionText);

    if (!transcript || transcript.length < 100) {
      throw new Error('Could not extract meaningful transcript');
    }

    console.log('Transcript fetched successfully, length:', transcript.length);

    return res.status(200).json({ 
      transcript: transcript,
      length: transcript.length,
      language: englishTrack.snippet.language
    });

  } catch (error) {
    console.error('Transcript error:', error);
    return res.status(500).json({ 
      error: 'Could not fetch transcript',
      message: error.message
    });
  }
}

function parseSRTTranscript(srt) {
  // Parse SRT format (subtitle format)
  const lines = srt.split('\n');
  const transcript = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip numbers, timestamps, and empty lines
    if (line && !line.match(/^\d+$/) && !line.match(/^\d{2}:\d{2}:\d{2}/)) {
      transcript.push(line);
    }
  }
  
  return transcript.join(' ').trim();
}

function parseXMLTranscript(xml) {
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
