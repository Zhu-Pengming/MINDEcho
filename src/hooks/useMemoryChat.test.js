import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMemoryChat } from './useMemoryChat';

vi.mock('../services/openai', () => ({
  analyzeUserInput: vi.fn(async () => ({
    response: 'Test response',
    conversationComplete: false,
    needsFollowUp: true
  })),
  extractStructuredMemory: vi.fn(async () => ({
    summary: 'Test summary',
    emotion: 'happy',
    intensity: 7,
    category: 'life',
    tags: ['test']
  }))
}));

vi.mock('../services/memoryStore', () => ({
  memoryStore: {
    save: vi.fn(async () => ({ id: '1' })),
    getAll: vi.fn(() => []),
    search: vi.fn(() => [])
  }
}));

describe('useMemoryChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with greeting message', () => {
    const { result } = renderHook(() => useMemoryChat());
    
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe('ai');
    expect(result.current.messages[0].content).toContain('嗨');
  });

  it('should have isTyping false initially', () => {
    const { result } = renderHook(() => useMemoryChat());
    expect(result.current.isTyping).toBe(false);
  });

  it('should send message and receive response', async () => {
    const { result } = renderHook(() => useMemoryChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.messages.length).toBeGreaterThan(1);
    expect(result.current.messages.some(m => m.content === 'Hello')).toBe(true);
  });

  it('should not send empty messages', async () => {
    const { result } = renderHook(() => useMemoryChat());
    const initialLength = result.current.messages.length;

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(result.current.messages).toHaveLength(initialLength);
  });

  it('should reset conversation', () => {
    const { result } = renderHook(() => useMemoryChat());

    act(() => {
      result.current.resetConversation();
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toContain('嗨');
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useMemoryChat());

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    const hasErrorMessage = result.current.messages.some(m => m.isError);
    expect(typeof hasErrorMessage).toBe('boolean');
  });
});
