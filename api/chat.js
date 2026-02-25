// api/chat.js (타로 앱 전용 최신 백엔드 완전체)
module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let messages = [];
    if (typeof req.body === 'string') {
      messages = JSON.parse(req.body).messages;
    } else if (req.body && req.body.messages) {
      messages = req.body.messages;
    }

    // 💡 열쇠 수혈 및 '빈칸(스페이스)' 자동 절단
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    const cleanKey = apiKey.trim(); 

    if (!cleanKey) {
      return res.status(403).json({ error: "Vercel 설정에 API 키가 비어있습니다." });
    }

    // 💡 최신 클로드 4.5 모델로 타로 본사 대문 열기
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': cleanKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5', // 단종 모델 에러(404) 원천 차단
        max_tokens: 1024,
        messages: messages
      })
    });

    const data = await response.json();

    // 💡 에러 발생 시 타로 전용 추적기 발동
    if (!response.ok) {
      const keyPrefix = cleanKey.substring(0, 17);
      return res.status(response.status).json({ 
        error: `[타로 실장 추적] 현재 쥐고 있는 키: ${keyPrefix}... / 에러 원인: ${data.error?.message}` 
      });
    }

    return res.status(200).json(data);
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
