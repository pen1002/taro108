export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key가 서버에 설정되지 않았습니다' });
  }

  let body;
  try {
    body = req.body;
  } catch (e) {
    return res.status(400).json({ error: '요청 형식 오류' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: body.messages,
      }),
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: 'Claude API 응답 파싱 오류: ' + text.slice(0, 100) });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || '알 수 없는 오류' });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: '서버 오류: ' + err.message });
  }
}
```

---

## 커밋 후 자동 재배포 확인
```
Vercel → tarot108 → Deployments
→ 새 배포가 🟢 Ready 되면
→ tarot108.vercel.app 에서 다시 테스트
```

혹시 그래도 오류가 나면 Vercel **Runtime Logs** 내용 캡처해서 보내주세요:
```
Vercel → tarot108 → Overview → [Runtime Logs] 버튼
