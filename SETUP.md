# 🚀 Setup Guide

## Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

## Step 2: Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` and paste your API key:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-key-here
   ```

## Step 3: Run the Application

```bash
npm run dev
```

The app will open at http://localhost:3000

## 🎯 First Time Usage

### Test the AI Chat System

1. Click the center **Sparkles** button (chat mode)
2. Type something like: "今天工作很累"
3. AI will ask follow-up questions
4. After 1-2 exchanges, it will save a structured memory

### View Your Memories

1. Click the **Book** icon (left button)
2. See all your memories with:
   - Emotion indicators (colored dots)
   - Auto-generated tags
   - AI summaries

### Search Memories

1. In the memory library, use the search box
2. Try: "我为什么焦虑？"
3. AI will find relevant memories and provide insights

### Check Insights

1. Click the **BarChart** icon (right button)
2. See:
   - 7-day emotion trend
   - Weekly AI-generated insights
   - Memory statistics

## 💡 Tips

- **Auto-draft**: After your first memory, AI will suggest new entries
- **Natural conversation**: Don't worry about formatting, just talk naturally
- **Privacy**: All data stored locally in your browser
- **Cost**: ~$0.01-0.03 per conversation with GPT-4

## 🐛 Troubleshooting

### "API key not found"
- Make sure `.env` file exists in project root
- Check that the key starts with `sk-`
- Restart the dev server after adding the key

### "Network error"
- Check your internet connection
- Verify API key is valid
- Check OpenAI API status: https://status.openai.com

### Memories not saving
- Check browser console for errors
- Try clearing localStorage and refreshing
- Make sure you complete the conversation (AI says "记录好了")

## 📊 Understanding the System

### How AI Conversation Works

1. **Input Analysis**: AI identifies if it's emotion/event/thought
2. **Dynamic Follow-up**: Asks 1-2 natural questions if needed
3. **Completion Detection**: Stops when enough info is gathered
4. **Structured Extraction**: Converts conversation to structured data

### Memory Hierarchy

- **Short-term**: Last 7 days, all memories
- **Long-term**: High intensity (≥7) or important categories
- Auto-promoted based on emotional significance

### Search Technology

- Uses OpenAI embeddings (semantic search)
- Not keyword matching - understands meaning
- Finds memories even if you use different words

## 🎨 Customization

### Change Emotion Colors
Edit `getEmotionColor()` in `src/App.jsx`

### Modify AI Personality
Edit system prompts in `src/services/openai.js`

### Add New Categories
Update extraction prompt in `extractStructuredMemory()`

## 🔐 Security Notes

- **Never commit `.env` file** (already in .gitignore)
- API key is exposed in browser (dev only)
- For production: Use backend proxy
- Consider rate limiting for public deployment

## 📈 Next Steps

1. Use it daily for 1 week
2. Check weekly insights
3. Try semantic search
4. Export data (feature coming soon)

---

**Need help?** Check the main README.md or create an issue.
