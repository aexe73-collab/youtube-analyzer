const { YoutubeTranscript } = require('youtube-transcript');

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
    const { videoId } = JSON.parse(event.body);

    if (!videoId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Video ID is required' })
      };
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    const fullText = transcript
      .map(item => item.text)
      .join(' ')
      .replace(/\[.*?\]/g, '')
      .trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        transcript: fullText,
        chunks: transcript.length
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Could not fetch transcript',
        message: error.message 
      })
    };
  }
};
