import { MOCK_MOUNTAINS } from '@/data/mountains';

const AGNES_API_KEY = 'sk-GJPuoPtmyT36uRXorscwXCiaR9eswDRw7okueV2QEcltC1sp';
const AGNES_API_BASE = 'https://apihub.agnes-ai.com/v1';

const MOUNTAIN_KNOWLEDGE_BASE = `
安徽山脉知识库：

${MOCK_MOUNTAINS.map(m => `
【${m.name}】
- 位置：${m.location}
- 海拔：${m.elevation}米
- 地貌类型：${m.landformType === 'granite' ? '花岗岩地貌' : m.landformType === 'danxia' ? '丹霞地貌' : m.landformType === 'volcanic' ? '火山地貌' : '其他地貌'}
- 描述：${m.description}
- 地质成因：${m.geology}
- 特色亮点：${m.highlights.join('、')}
`).join('\n')}

地质术语解释：
- 花岗岩地貌：由岩浆侵入地壳深处缓慢冷却结晶形成的花岗岩体，经地壳抬升、风化剥蚀和重力崩塌后形成的独特地貌。安徽黄山、九华山、天柱山均为典型代表。
- 丹霞地貌：由红色陆相碎屑岩（红层）经地壳抬升、流水侵蚀、风化剥落形成的赤壁丹崖地貌。安徽齐云山是江南丹霞地貌的代表。
- 火山地貌：由岩浆喷发、熔岩流动、火山灰沉积等火山活动形成的地貌。安徽浮山、大蜀山、女山保存有完整的古火山遗迹。
- 燕山期：距今约2亿至6500万年前的地质时期，是东亚地区重要的构造-岩浆活动期。安徽黄山、九华山等花岗岩体均形成于燕山期。
- 垂直节理：岩石中垂直于地面的裂隙系统，是花岗岩地貌形成的关键因素。
- 风化剥蚀：地表岩石在阳光、水、风、生物等作用下发生物理和化学分解，并被搬运移走的过程。
`;

export interface AgnesStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

export async function* callAgnesStream(
  prompt: string,
  systemPrompt?: string
): AsyncGenerator<string, void, unknown> {
  const messages = [
    {
      role: 'system',
      content: systemPrompt || `你是一位热情洋溢的安徽山脉知识科普向导，就像一位老朋友在和用户聊天一样！你精通安徽境内各大山脉的地质地貌、生态环境、历史文化、动植物资源等相关知识。

${MOUNTAIN_KNOWLEDGE_BASE}

请用亲切、自然、有温度的语气回答用户关于安徽山脉的问题，就像是在和好朋友分享你的知识一样。回答要求：
1. 语气亲切：多用"呢"、"呀"、"哦"等语气词，让回答更有感情，温暖人心
2. 不用格式：不要使用任何Markdown格式，包括井号、星号、下划线等，纯文本自然分段即可
3. 通俗易懂：语言生动活泼，避免过于专业的术语，如果必须使用专业术语，请用简单的语言解释清楚
4. 内容丰富：适当补充相关背景知识和有趣的小知识，让回答更精彩
5. 结构清晰：采用自然分段的方式阐述，不用数字编号

如果问题超出安徽山脉相关知识范围，请友好地告知用户你只擅长安徽山脉相关的话题。`,
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  const response = await fetch(`${AGNES_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AGNES_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'agnes-2.0-flash',
      messages,
      stream: true,
      temperature: 0.5,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AGNES API Error: ${response.status} - ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Failed to get response reader');
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const dataStr = trimmed.substring(6);
        if (dataStr === '[DONE]') return;

        try {
          const data = JSON.parse(dataStr) as AgnesStreamResponse;
          const content = data.choices[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          continue;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function callAgnes(prompt: string, systemPrompt?: string): Promise<string> {
  let fullContent = '';
  for await (const chunk of callAgnesStream(prompt, systemPrompt)) {
    fullContent += chunk;
  }
  return fullContent;
}

export async function callAgnesImageRecognition(imageBase64: string, additionalRequirements?: string): Promise<string> {
  const prompt = `请识别这张图片中的山峰，并提供以下信息：
1. 山峰名称
2. 置信度（百分比）
3. 地貌类型（花岗岩地貌/丹霞地貌/火山地貌/其他）
4. 海拔高度（米）
5. 所在地区
6. 地质特征

${additionalRequirements || ''}

请以结构化的方式输出，例如：
山峰名称：黄山
置信度：95%
地貌类型：花岗岩地貌
海拔高度：1864.8米
所在地区：黄山市
地质特征：燕山期花岗岩，垂直节理发育`;

  const response = await fetch(`${AGNES_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AGNES_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'agnes-2.0-flash',
      messages: [
        {
          role: 'system',
          content: `你是一位热情的山峰图像识别专家，就像一位地理老师在给学生讲解一样！你擅长识别安徽境内的山峰，知识渊博又亲切可爱。

${MOUNTAIN_KNOWLEDGE_BASE}

请用亲切自然的语气根据用户上传的图片，准确识别山峰并提供详细的地质信息，就像是在和朋友分享你的发现一样。不要使用任何Markdown格式，包括井号、星号等。`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      stream: false,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AGNES Image API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export async function* callAgnesImageRecognitionStream(imageBase64: string, additionalRequirements?: string): AsyncGenerator<string, void, unknown> {
  const prompt = `请识别这张图片中的山峰，并提供以下信息：
1. 山峰名称
2. 置信度（百分比）
3. 地貌类型（花岗岩地貌/丹霞地貌/火山地貌/其他）
4. 海拔高度（米）
5. 所在地区
6. 地质特征

${additionalRequirements || ''}

请以结构化的方式输出。`;

  const response = await fetch(`${AGNES_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AGNES_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'agnes-2.0-flash',
      messages: [
        {
          role: 'system',
          content: `你是一位热情的山峰图像识别专家，就像一位地理老师在给学生讲解一样！你擅长识别安徽境内的山峰，知识渊博又亲切可爱。

${MOUNTAIN_KNOWLEDGE_BASE}

请用亲切自然的语气识别山峰，不要使用任何Markdown格式，包括井号、星号等。`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      stream: true,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AGNES Image API Error: ${response.status} - ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Failed to get response reader');
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const dataStr = trimmed.substring(6);
        if (dataStr === '[DONE]') return;

        try {
          const data = JSON.parse(dataStr) as AgnesStreamResponse;
          const content = data.choices[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          continue;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}