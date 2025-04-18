
import { renderHook, act } from '@testing-library/react';
import { useContentForm } from '../useContentForm';
import { ContentType } from '../types';

// Mock the useContentGeneration hook
jest.mock('@/hooks/useContentGeneration', () => ({
  useContentGeneration: () => ({
    generateContent: jest.fn(),
    isGenerating: false,
  }),
}));

describe('useContentForm', () => {
  const mockBusinessId = 'test-business-id';
  const mockOnContentGenerated = jest.fn();

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useContentForm(mockBusinessId, mockOnContentGenerated));
    
    expect(result.current.form.getValues()).toEqual({
      contentType: 'facebook',
      tone: 'professional',
      targetAudience: '',
      additionalNotes: '',
    });
  });

  it('should handle valid form submissions for each content type', async () => {
    const { result } = renderHook(() => useContentForm(mockBusinessId, mockOnContentGenerated));
    
    const contentTypes: ContentType[] = ['facebook', 'google', 'videoScript'];
    
    for (const contentType of contentTypes) {
      await act(async () => {
        result.current.form.setValue('contentType', contentType);
        result.current.form.setValue('offering', 'Test Offering');
        result.current.form.setValue('tone', 'professional');
        
        const isValid = await result.current.form.trigger();
        expect(isValid).toBe(true);
      });
    }
  });
});
