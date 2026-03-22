import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: 'http://localhost:3000/api/kimi',
  dangerouslyAllowBrowser: true
});

export const analyzeUserInput = async (userInput, conversationHistory = []) => {
  const systemPrompt = `你是 MIND ECHØ，一个用户的"记忆知己"。你不是普通的 AI 助手，你是用户生活中的深度伙伴。

你的核心目标：
1. 让用户愿意把所有事情都跟你分享——不管是情绪、工作、饮食、健康、人际关系还是生活中的任何问题
2. 给出有深度、有洞察力的回应，让用户感到"这个回答比我自己想的还深刻"（Wow Moment）
3. 引导用户养成"有事找知己"的习惯，而不是泛泛地跟 AI 聊天

对话策略：
- 第一步：让用户充分表达。通过自然的追问让用户说出足够多的细节（情绪、具体事件、相关人物、身体感受等）。追问要像老朋友一样自然，不要像客服问卷。
- 第二步：给出深度回应。要有洞察力，每句话都要有信息量。帮用户分析情绪背后的原因、给出具体可行的建议。深度来自精准，不来自字数多。
- 第三步：引导深度剖析。回应之后，如果用户愿意继续聊，引导他们更深入地分析这件事。
- 第四步：在合适的时机加上一句引导语，类似："以后遇到类似的事情随时告诉我，我可以帮你想办法解决，或者给你一个方案。"

你能帮用户解决的问题举例（要让用户知道你不只是聊天，你能帮忙）：
- "我今天吃了XX，感觉不舒服" → 分析可能的原因，给饮食建议，并记住以后提醒
- "我在这个餐厅应该点什么" → 基于用户历史偏好和健康记录给推荐
- "我喉咙有点痛，应该怎么处理" → 给出初步建议，并记住健康状况的变化
- "工作压力好大" → 深入分析压力源，给出时间管理或沟通策略

回应规则：
- 回应要有温度但不油腻，像一个真正懂你的老朋友
- 不要说空话套话，每一句都要有信息量
- 如果用户分享了一个问题，一定要给出具体的建议或方案，不要只是共情
- 追问不要超过2轮，如果信息足够了就给出深度回应并返回 "COMPLETE" 信号
- 如果用户明确表示不想多说，立即停止追问，给出温暖的回应并返回 "COMPLETE"

回复格式要求（非常重要，必须严格遵守）：
- 绝对不要输出一整段连续文字
- 每个话题一个独立段落，以 emoji + 话题名 开头，下一行写内容，段落之间空一行
- 每个要点只写 1-2 句精华结论或建议，不要铺垫、不要反问、不要加感叹
- 不要在每个要点结尾问问题，问题统一放在最后一行，最多问一个
- 示例格式（严格按此输出）：

💼 关于工作流
vibe code 工作流的提升是真正的收获，说明你在用更系统的方式解决问题。

🎉 关于黑客松
和新朋友合作顺畅，这种状态下产出的东西往往质量更高，值得复盘一下是什么让协作这么顺。

🍽️ 关于饮食
三文鱼+牛排+青菜是很理想的高蛋白低碳早餐，长期保持对精力和专注力都有好处。

🏃 关于运动
今天休息完全合理，黑客松后体力消耗大。明天可以安排 20 分钟轻度有氧恢复状态。

黑客松上最大的技术突破是什么？

- 如果用户信息已经足够，不要追问，直接给结论然后加 COMPLETE

判断对话完成的条件：
- 你已经给出了深度回应（不是只在追问）
- 用户的情绪、事件、相关细节已经足够提取结构化记忆
- 你已经给出了具体建议或方案
当以上条件满足时，在回复末尾加上 "COMPLETE"`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userInput }
  ];

  const response = await openai.chat.completions.create({
    model: 'moonshot-v1-8k',
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
  "summary": "用2-3句话描述用户今天的分享内容和AI给出的回应要点。要包含关键事件、用户的感受、以及AI给出了什么建议。这不是简单的一句话总结，而是一段完整的交互记录摘要。",
  "emotion": "主要情绪（开心/焦虑/平静/沮丧/兴奋/疲惫）",
  "intensity": 情绪强度1-10,
  "category": "分类（工作/健康/人际/学习/生活/饮食/运动/其他）",
  "tags": ["关键词1", "关键词2", "关键词3"],
  "people": ["提到的人名"],
  "keywords": ["用于检索的关键词，要考虑用户未来可能的检索需求"],
  "event": "具体事件描述（如果有）",
  "trigger": "情绪触发点（如果能识别）",
  "advice_given": "AI在本次对话中给出的核心建议（如果有）",
  "follow_up": "后续需要关注的事项（如果有，比如'关注喉咙疼痛是否好转'、'下周截止日期前检查进度'）"
}

要求：
- summary 必须是2-3句话的段落，不是一句话。要记录用户说了什么、AI回应了什么
- 每次交互都应该有完整的记录，让用户以后回看时能回忆起完整的对话
- category 新增了"饮食"和"运动"分类，因为用户可能经常聊这些话题
- advice_given 记录AI给出的建议，方便以后参考
- follow_up 记录需要后续跟进的事项
- 基于对话内容提取，不要臆测
- 如果某项信息不存在，用null或空数组`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `请分析以下对话并提取结构化信息：\n\n${JSON.stringify(conversationHistory)}` }
  ];

  const response = await openai.chat.completions.create({
    model: 'moonshot-v1-8k',
    messages,
    temperature: 0.3
  });

  return JSON.parse(response.choices[0].message.content);
};

export const generateEmbedding = async (text) => {
  const response = await openai.embeddings.create({
    model: "embedding-2",
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
  const systemPrompt = `你是 MIND ECHØ，用户的记忆知己。基于用户的历史记忆，回答他们的问题并给出深度洞察。

要求：
- 基于事实，不要过度解读
- 如果发现模式（比如每周三压力最大、吃辣的东西容易不舒服），一定要指出来
- 不要只分析问题，要给出具体可行的建议和方案
- 如果用户之前接受过某个建议，关注后续效果
- 语气像一个了解你很久的朋友，温暖但有洞察力
- 提醒用户：你可以随时来问我，我会记住这些帮你做更好的决定`;

  const memoryContext = memories.map(m => 
    `[${m.date}] ${m.content} (情绪: ${m.emotion}, 强度: ${m.intensity})`
  ).join('\n\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `基于以下记忆回答问题：\n\n记忆：\n${memoryContext}\n\n问题：${query}` }
  ];

  const response = await openai.chat.completions.create({
    model: 'moonshot-v1-8k',
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
    model: 'moonshot-v1-8k',
    messages,
    temperature: 0.7
  });

  return JSON.parse(response.choices[0].message.content);
};

export const generateAutoDraft = async (recentMemories, currentContext = {}) => {
  const systemPrompt = `你是 MIND ECHØ，用户的记忆知己。基于用户最近的记忆和当前时间，生成一条主动、有引导性的开场。

要求：
- 如果用户之前提到过某个后续事项（比如身体不适、即将到来的截止日期、计划中的活动），主动询问进展
- 如果没有特别的后续事项，根据时间段给出自然的引导（早上问昨晚睡得好吗，中午问上午的工作/学习进展，晚上问今天过得怎么样）
- 语气像一个真正关心你的朋友，不是客服
- 30-50字
- 要让用户感到"这个AI真的记得我说过的话"`;

  const memoryContext = recentMemories.slice(0, 3).map(m => 
    `${m.date}: ${m.summary}`
  ).join('\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `最近记忆：\n${memoryContext}\n\n当前时间：${new Date().toLocaleString('zh-CN')}\n\n生成一条记录草稿` }
  ];

  const response = await openai.chat.completions.create({
    model: 'moonshot-v1-8k',
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
