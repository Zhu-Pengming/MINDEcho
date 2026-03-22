# MIND ECHØ - AI Memory Companion

一个基于 AI 的智能记忆伙伴系统，帮助用户记录、理解和洞察自己的情绪与生活。

## 🌟 核心功能

### Phase 1 (已实现)
- ✅ **AI 引导式对话系统**：智能识别用户输入类型，动态追问获取完整信息
- ✅ **结构化记忆抽取**：自动提取情绪、强度、分类、标签、人物等结构化信息
- ✅ **记忆分层系统**：短期记忆（7天）与长期记忆（重要事件）自动分类

### Phase 2 (已实现)
- ✅ **RAG 语义搜索**：基于 embedding 的智能记忆检索
- ✅ **AI 洞察生成**：根据检索结果生成个性化洞察

### Phase 3 (已实现)
- ✅ **自动草稿生成**：基于历史记忆智能生成记录建议
- ✅ **周总结系统**：自动分析情绪趋势、高频事件、核心洞察

## 🚀 快速开始

### 1. 安装依赖

```bash
cd C:/Users/lenovo/CascadeProjects/mind-echo
npm install
```

### 2. 配置 OpenAI API Key

复制 `.env.example` 为 `.env`：

```bash
copy .env.example .env
```

编辑 `.env` 文件，填入你的 OpenAI API Key：

```
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📁 项目结构

```
mind-echo/
├── src/
│   ├── services/
│   │   ├── openai.js          # OpenAI API 集成
│   │   └── memoryStore.js     # 记忆存储系统
│   ├── hooks/
│   │   ├── useMemoryChat.js   # 对话管理 Hook
│   │   └── useMemorySearch.js # 搜索管理 Hook
│   ├── App.jsx                # 主应用组件
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── README.md
```

## 🧠 核心技术架构

### 1. AI 对话引导系统
- 识别用户输入类型（情绪/事件/模糊）
- 动态生成追问（1-2轮）
- 自动判断对话完成条件

### 2. 结构化记忆抽取
使用 GPT-4 提取：
- `summary`: 一句话总结
- `emotion`: 情绪类型
- `intensity`: 情绪强度 (1-10)
- `category`: 分类（工作/健康/人际等）
- `tags`: 关键词标签
- `people`: 相关人物
- `keywords`: 检索关键词
- `event`: 具体事件
- `trigger`: 情绪触发点

### 3. 记忆分层系统
- **短期记忆**：最近 7 天的记录
- **长期记忆**：
  - 情绪强度 ≥ 7
  - 重要分类（工作/人际/健康）

### 4. RAG 检索系统
- 使用 `text-embedding-3-small` 生成 embedding
- 余弦相似度计算
- Top-K 召回 + LLM 总结

### 5. 洞察生成
- 情绪趋势分析
- 高频事件识别
- 模式发现
- 个性化建议

## 🎯 使用场景

### 场景 1：日常记录
用户输入："今天很累"
→ AI 追问："是身体累还是心累？"
→ 用户："工作压力大"
→ AI："有具体的事情让你感到压力吗？"
→ 自动生成结构化记忆

### 场景 2：记忆检索
用户搜索："我最近为什么焦虑？"
→ 语义检索相关记忆
→ AI 分析："你的焦虑主要集中在工作截止日前2天"

### 场景 3：周总结
→ 自动分析一周情绪趋势
→ 识别高频事件和人物
→ 生成核心洞察和建议

## 🔧 技术栈

- **前端框架**: React 18 + Vite
- **样式**: TailwindCSS
- **AI**: OpenAI GPT-4 + Embeddings
- **图标**: Lucide React
- **状态管理**: React Hooks
- **存储**: LocalStorage (可扩展为后端数据库)

## 📊 数据隐私

- 所有记忆数据存储在浏览器 LocalStorage
- OpenAI API 调用遵循其隐私政策
- 建议生产环境使用后端数据库 + 加密

## 🚧 未来规划

- [ ] 后端 API 集成
- [ ] 用户认证系统
- [ ] 数据导出功能
- [ ] 移动端适配
- [ ] 多语言支持
- [ ] 数据可视化增强
- [ ] 社交分享功能（可选）

## 📝 开发说明

### 添加新的情绪类型
编辑 `src/App.jsx` 中的 `getEmotionColor` 函数

### 修改 AI 提示词
编辑 `src/services/openai.js` 中的 `systemPrompt`

### 调整记忆分层逻辑
编辑 `src/services/memoryStore.js` 中的 `determineMemoryType` 函数

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License

---

**Built with ❤️ using AI-first architecture**
