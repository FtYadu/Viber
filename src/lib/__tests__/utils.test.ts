import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      const result = cn('px-2 py-1', 'bg-blue-500', 'text-white')
      expect(result).toContain('px-2')
      expect(result).toContain('py-1')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('text-white')
    })

    it('handles conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class', 'another-class')
      
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
      expect(result).toContain('another-class')
    })

    it('filters out falsy values', () => {
      const result = cn('base-class', false && 'hidden-class', null, undefined, 'visible-class')
      
      expect(result).toContain('base-class')
      expect(result).toContain('visible-class')
      expect(result).not.toContain('hidden-class')
    })

    it('handles empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('handles conflicting Tailwind classes', () => {
      // tailwind-merge should resolve conflicts
      const result = cn('px-2 px-4', 'py-1 py-2')
      
      // Should keep the last conflicting class
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
      expect(result).not.toContain('px-2')
      expect(result).not.toContain('py-1')
    })

    it('handles arrays of classes', () => {
      const result = cn(['px-2', 'py-1'], ['bg-blue-500', 'text-white'])
      
      expect(result).toContain('px-2')
      expect(result).toContain('py-1')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('text-white')
    })
  })
})