import { nanoid } from 'nanoid';
import { generateEmbedding } from './openai';

const STORAGE_KEY = 'mind_echo_memories';

export const memoryStore = {
  getAll: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load memories:', error);
      return [];
    }
  },

  save: async (memory) => {
    try {
      const memories = memoryStore.getAll();

      // 重复检测：若最近 5 分钟内已保存内容前 60 字相同的记忆，跳过
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const prefix = (memory.content ?? '').slice(0, 60);
      const isDuplicate = prefix.length > 0 && memories.some(
        (m) =>
          new Date(m.timestamp).getTime() > fiveMinutesAgo &&
          (m.content ?? '').slice(0, 60) === prefix
      );
      if (isDuplicate) {
        console.warn('[memoryStore] Duplicate detected within 5 min, skipping save.');
        return null;
      }

      // 尝试生成 embedding，如果失败则跳过（Kimi API 不支持 embedding）
      let embedding = null;
      try {
        embedding = await generateEmbedding(
          `${memory.content} ${memory.summary} ${memory.tags.join(' ')}`
        );
      } catch (embeddingError) {
        console.warn('Embedding generation not supported, skipping:', embeddingError.message);
      }

      const newMemory = {
        id: nanoid(),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        ...memory,
        embedding,
        memoryType: determineMemoryType(memory),
        hidden: false
      };

      memories.unshift(newMemory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
      
      return newMemory;
    } catch (error) {
      console.error('Failed to save memory:', error);
      throw error;
    }
  },

  update: (id, updates) => {
    try {
      const memories = memoryStore.getAll();
      const index = memories.findIndex(m => m.id === id);
      
      if (index !== -1) {
        memories[index] = { ...memories[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
        return memories[index];
      }
      
      return null;
    } catch (error) {
      console.error('Failed to update memory:', error);
      throw error;
    }
  },

  delete: (id) => {
    try {
      const memories = memoryStore.getAll();
      const filtered = memories.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete memory:', error);
      return false;
    }
  },

  getByDateRange: (startDate, endDate) => {
    const memories = memoryStore.getAll();
    return memories.filter(m => {
      const memDate = new Date(m.date);
      return memDate >= new Date(startDate) && memDate <= new Date(endDate);
    });
  },

  getShortTerm: () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const memories = memoryStore.getAll();
    return memories.filter(m => new Date(m.timestamp) >= sevenDaysAgo);
  },

  getLongTerm: () => {
    const memories = memoryStore.getAll();
    return memories.filter(m => m.memoryType === 'long-term');
  },

  promoteToLongTerm: (id) => {
    return memoryStore.update(id, { memoryType: 'long-term' });
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  hideMemory: (id) => {
    return memoryStore.update(id, { hidden: true });
  },

  unhideMemory: (id) => {
    return memoryStore.update(id, { hidden: false });
  },

  // Library 页面用：只返回未隐藏的记忆
  getVisible: () => {
    const memories = memoryStore.getAll();
    return memories.filter(m => !m.hidden);
  },

  // AI 检索用：返回全部记忆（包括隐藏）
  getAllIncludingHidden: () => {
    return memoryStore.getAll();
  },
};

function determineMemoryType(memory) {
  if (memory.intensity >= 7) return 'long-term';

  const importantCategories = ['工作', '人际', '健康', '饮食', '运动'];
  if (importantCategories.includes(memory.category)) {
    return 'long-term';
  }

  // 有后续跟进事项的也标记为长期记忆
  if (memory.follow_up) {
    return 'long-term';
  }

  return 'short-term';
}

export const getMemoryStats = () => {
  const memories = memoryStore.getAll();
  
  const emotionCounts = memories.reduce((acc, m) => {
    acc[m.emotion] = (acc[m.emotion] || 0) + 1;
    return acc;
  }, {});

  const categoryCounts = memories.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {});

  const avgIntensity = memories.length > 0
    ? memories.reduce((sum, m) => sum + m.intensity, 0) / memories.length
    : 0;

  const last7Days = memoryStore.getShortTerm();
  const emotionTrend = last7Days.map(m => ({
    date: m.date,
    emotion: m.emotion,
    intensity: m.intensity
  }));

  return {
    total: memories.length,
    shortTerm: memoryStore.getShortTerm().length,
    longTerm: memoryStore.getLongTerm().length,
    emotionCounts,
    categoryCounts,
    avgIntensity: avgIntensity.toFixed(1),
    emotionTrend
  };
};

export default memoryStore;
