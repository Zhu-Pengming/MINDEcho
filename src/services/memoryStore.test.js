import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { memoryStore } from './memoryStore';

vi.mock('./openai', () => ({
  generateEmbedding: vi.fn(async () => [0.1, 0.2, 0.3])
}));

describe('memoryStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const createTestMemory = (overrides = {}) => ({
    content: 'Test memory',
    summary: 'Test summary',
    emotion: 'happy',
    intensity: 5,
    category: 'life',
    tags: ['test'],
    ...overrides
  });

  describe('getAll', () => {
    it('should return empty array when no memories exist', () => {
      const memories = memoryStore.getAll();
      expect(memories).toEqual([]);
    });

    it('should return stored memories', () => {
      const testMemory = {
        id: '1',
        content: 'Test memory',
        emotion: 'happy',
        intensity: 8
      };
      localStorage.setItem('mind_echo_memories', JSON.stringify([testMemory]));
      
      const memories = memoryStore.getAll();
      expect(memories).toHaveLength(1);
      expect(memories[0].content).toBe('Test memory');
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('mind_echo_memories', 'invalid json');
      const memories = memoryStore.getAll();
      expect(memories).toEqual([]);
    });
  });

  describe('save', () => {
    it('should save a new memory with id and date', async () => {
      memoryStore.clear();
      const memoryData = createTestMemory({
        content: 'New memory',
        emotion: 'peaceful'
      });

      await memoryStore.save(memoryData);
      const memories = memoryStore.getAll();

      expect(memories).toHaveLength(1);
      expect(memories[0].content).toBe('New memory');
      expect(memories[0].id).toBeDefined();
      expect(memories[0].date).toBeDefined();
    });

    it('should add multiple memories', async () => {
      memoryStore.clear();
      await memoryStore.save(createTestMemory({ content: 'Memory 1' }));
      await memoryStore.save(createTestMemory({ content: 'Memory 2' }));

      const memories = memoryStore.getAll();
      expect(memories).toHaveLength(2);
      memoryStore.clear();
    });
  });

  describe('getByDateRange', () => {
    it('should filter memories by date range', async () => {
      memoryStore.clear();
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      await memoryStore.save(createTestMemory({ content: 'Today memory' }));
      
      const results = memoryStore.getByDateRange(yesterday, today);
      expect(results.length).toBeGreaterThan(0);
      
      memoryStore.clear();
    });
  });

  describe('delete', () => {
    it('should delete a memory by id', async () => {
      memoryStore.clear();
      await memoryStore.save(createTestMemory({ content: 'To delete' }));
      const memories = memoryStore.getAll();
      const id = memories[0].id;

      memoryStore.delete(id);
      const remaining = memoryStore.getAll();

      expect(remaining).toHaveLength(0);
      memoryStore.clear();
    });
  });

  describe('update', () => {
    it('should update an existing memory', async () => {
      memoryStore.clear();
      await memoryStore.save(createTestMemory({ content: 'Original' }));
      const memories = memoryStore.getAll();
      const id = memories[0].id;

      memoryStore.update(id, { content: 'Updated', emotion: 'excited' });
      const updated = memoryStore.getAll();

      expect(updated[0].content).toBe('Updated');
      expect(updated[0].emotion).toBe('excited');
      memoryStore.clear();
    });
  });

  describe('getShortTerm and getLongTerm', () => {
    it('should categorize memories by type', async () => {
      memoryStore.clear();
      await memoryStore.save(createTestMemory({ intensity: 3 }));
      await memoryStore.save(createTestMemory({ intensity: 8 }));

      const allMemories = memoryStore.getAll();
      const shortTerm = memoryStore.getShortTerm();
      const longTerm = memoryStore.getLongTerm();

      expect(allMemories).toHaveLength(2);
      expect(longTerm.length).toBeGreaterThan(0);
      expect(shortTerm.length).toBeGreaterThan(0);
    });
  });
});
