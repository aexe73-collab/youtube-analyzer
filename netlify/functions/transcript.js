exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Lazy load the module
    const { YoutubeTranscript } = await import('youtube-transcript');
    
    const { videoId } = JSON.parse(event.body);

    if (!videoId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Video ID is required' })
      };
    }

    console.log('Fetching transcript for:', videoId);
    
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    const fullText = transcript
      .map(item => item.text)
      .join(' ')
      .replace(/\[.*?\]/g, '')
      .trim();

    console.log('Transcript fetched successfully, length:', fullText.length);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        transcript: fullText,
        chunks: transcript.length
      })
    };

  } catch (error) {
    console.error('Transcript error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Could not fetch transcript',
        message: error.message,
        details: error.toString()
      })
    };
  }
};
