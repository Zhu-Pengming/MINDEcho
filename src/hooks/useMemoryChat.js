import { useState, useCallback } from 'react';
import { analyzeUserInput, extractStructuredMemory } from '../services/openai';
import { memoryStore } from '../services/memoryStore';

export const useMemoryChat = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: '嗨，我是你的 AI 记忆伙伴。今天过得怎么样？' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const sendMessage = useCallback(async (userInput) => {
    if (!userInput.trim()) return;

    const userMsg = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: userInput }
      ];

      const { response, conversationComplete } = await analyzeUserInput(
        userInput,
        conversationHistory
      );

      const aiMsg = { role: 'ai', content: response };
      setMessages(prev => [...prev, aiMsg]);

      const updatedHistory = [
        ...newHistory,
        { role: 'assistant', content: response }
      ];
      setConversationHistory(updatedHistory);

      if (conversationComplete) {
        const structuredMemory = await extractStructuredMemory(updatedHistory);
        
        const fullContent = updatedHistory
          .filter(m => m.role === 'user')
          .map(m => m.content)
          .join(' ');

        await memoryStore.save({
          content: fullContent,
          ...structuredMemory
        });

        setMessages(prev => [
          ...prev,
          { 
            role: 'ai', 
            content: '已经帮你记录好了 ✨ 随时可以在记忆库中查看。',
            isSystem: true 
          }
        ]);

        setConversationHistory([]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        { 
          role: 'ai', 
          content: '抱歉，遇到了一些问题。请稍后再试。',
          isError: true 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [conversationHistory]);

  const resetConversation = useCallback(() => {
    setMessages([
      { role: 'ai', content: '嗨，我是你的 AI 记忆伙伴。今天过得怎么样？' }
    ]);
    setConversationHistory([]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    resetConversation
  };
};
