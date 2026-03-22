import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const analyzeUserInput = async (userInput, conversationHistory = []) => {
  const systemPrompt = `你是一个专业的心理记忆助手。你的任务是：
1. 识别用户输入的类型（情绪表达、事件描述、模糊想法）
2. 判断是否需要追问以获取更完整的信息
3. 如果需要追问，生成1-2个自然的追问（不要像客服）
4. 如果信息足够，返回"COMPLETE"信号

规则：
- 追问要自然、有同理心
- 不要连续问超过2轮
- 重点获取：情绪、具体事件、相关人物
- 如果用户明确表示不想多说，立即停止`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userInput }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    temperature: 0.7,
    max_tokens: 500
  });

  const aiResponse = response.choices[0].message.content;
  
  const needsFollowUp = !aiResponse.includes('COMPLETE') && conversationHistory.length < 4;
  
  return {
    response: aiResponse.replace('COMPLETE', '').trim(),
    needsFollowUp,
    conversationComplete: !needsFollowUp
  };
};

export const extractStructuredMemory = async (conversationHistory) => {
  const systemPrompt = `你是记忆结构化专家。根据对话内容，提取以下信息并以JSON格式返回：

{
  "summary": "一句话总结（20字以内）",
  "emotion": "主要情绪（开心/焦虑/平静/沮丧/兴奋/疲惫）",
  "intensity": 情绪强度1-10,
  "category": "分类（工作/健康/人际/学习/生活/其他）",
  "tags": ["关键词1", "关键词2"],
  "people": ["提到的人名"],
  "keywords": ["用于检索的关键词"],
  "event": "具体事件描述（如果有）",
  "trigger": "情绪触发点（如果能识别）"
}

要求：
- 基于对话内容，不要臆测
- summary要精炼有信息量
- keywords要考虑用户未来可能的检索需求
- 如果某项信息不存在，用null或空数组`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `请分析以下对话并提取结构化信息：\n\n${JSON.stringify(conversationHistory)}` }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    temperature: 0.3,
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

export const generateEmbedding = async (text) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
};

export const searchMemories = async (query, memories) => {
  const queryEmbedding = await generateEmbedding(query);
  
  const memoriesWithScores = memories.map(memory => {
    if (!memory.embedding) return { ...memory, score: 0 };
    
    const score = cosineSimilarity(queryEmbedding, memory.embedding);
    return { ...memory, score };
  });

  return memoriesWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

export const generateInsightFromMemories = async (memories, query) => {
  const systemPrompt = `你是一个温暖、有洞察力的AI伙伴。基于用户的历史记忆，回答他们的问题。

要求：
- 基于事实，不要过度解读
- 语气温暖但不过分亲密
- 如果发现模式，温和地指出
- 如果信息不足，诚实说明`;

  const memoryContext = memories.map(m => 
    `[${m.date}] ${m.content} (情绪: ${m.emotion}, 强度: ${m.intensity})`
  ).join('\n\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `基于以下记忆回答问题：\n\n记忆：\n${memoryContext}\n\n问题：${query}` }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    temperature: 0.8,
    max_tokens: 800
  });

  return response.choices[0].message.content;
};

export const generateWeeklyInsight = async (memories) => {
  const systemPrompt = `你是一个专业的心理模式分析师。分析用户一周的记忆，生成洞察报告。

返回JSON格式：
{
  "emotionTrend": "情绪趋势描述",
  "topEvents": ["高频事件1", "高频事件2"],
  "topPeople": ["高频人物1"],
  "insight": "一句核心洞察（30字以内）",
  "suggestion": "温和的建议（可选）"
}`;

  const weekMemories = memories.slice(0, 20);
  const memoryContext = weekMemories.map(m => 
    `[${m.date}] ${m.summary} - ${m.emotion}(${m.intensity})`
  ).join('\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `分析以下一周记忆：\n${memoryContext}` }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

export const generateAutoDraft = async (recentMemories, currentContext = {}) => {
  const systemPrompt = `你是一个贴心的记忆助手。基于用户最近的记忆和当前上下文，生成一条自然的记录草稿。

要求：
- 不要假装很懂用户
- 语气是"邀请补充"而非"断言"
- 20-40字
- 基于真实模式，不要臆测`;

  const memoryContext = recentMemories.slice(0, 3).map(m => 
    `${m.date}: ${m.summary}`
  ).join('\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `最近记忆：\n${memoryContext}\n\n当前时间：${new Date().toLocaleString('zh-CN')}\n\n生成一条记录草稿` }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    temperature: 0.8,
    max_tokens: 200
  });

  return response.choices[0].message.content;
};

function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export default openai;
