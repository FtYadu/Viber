import {
  debounce,
  throttle,
  createImageObserver,
  WEB_VITALS_THRESHOLDS,
} from '@/lib/performance'

// Mock window and document
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: jest.fn().mockImplementation((callback) => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    callback,
  })),
})

describe('Performance Utilities', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('debounce', () => {
    it('delays function execution', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('test')
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledWith('test')
    })

    it('cancels previous calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('first')
      debouncedFn('second')
      debouncedFn('third')

      jest.advanceTimersByTime(100)
      
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('third')
    })

    it('handles multiple arguments', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1', 'arg2', 'arg3')
      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
    })
  })

  describe('throttle', () => {
    it('limits function execution frequency', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn('first')
      throttledFn('second')
      throttledFn('third')

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('first')

      jest.advanceTimersByTime(100)
      
      throttledFn('fourth')
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenCalledWith('fourth')
    })

    it('executes immediately on first call', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn('test')
      expect(mockFn).toHaveBeenCalledWith('test')
    })
  })

  describe('createImageObserver', () => {
    it('creates IntersectionObserver when supported', () => {
      const callback = jest.fn()
      const observer = createImageObserver(callback)

      expect(observer).toBeDefined()
      expect(window.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      )
    })

    it('returns null when IntersectionObserver is not supported', () => {
      const originalIntersectionObserver = window.IntersectionObserver
      // @ts-ignore
      delete window.IntersectionObserver

      const callback = jest.fn()
      const observer = createImageObserver(callback)

      expect(observer).toBeNull()

      // Restore
      window.IntersectionObserver = originalIntersectionObserver
    })

    it('calls callback for each entry', () => {
      const callback = jest.fn()
      const observer = createImageObserver(callback)

      // Simulate intersection observer callback
      const mockEntries = [
        { isIntersecting: true, target: document.createElement('img') },
        { isIntersecting: false, target: document.createElement('img') },
      ]

      // Get the callback function passed to IntersectionObserver
      const observerCallback = (window.IntersectionObserver as jest.Mock).mock.calls[0][0]
      observerCallback(mockEntries)

      expect(callback).toHaveBeenCalledTimes(2)
      expect(callback).toHaveBeenCalledWith(mockEntries[0])
      expect(callback).toHaveBeenCalledWith(mockEntries[1])
    })
  })

  describe('WEB_VITALS_THRESHOLDS', () => {
    it('has correct threshold values', () => {
      expect(WEB_VITALS_THRESHOLDS.LCP.good).toBe(2500)
      expect(WEB_VITALS_THRESHOLDS.LCP.needsImprovement).toBe(4000)
      
      expect(WEB_VITALS_THRESHOLDS.FID.good).toBe(100)
      expect(WEB_VITALS_THRESHOLDS.FID.needsImprovement).toBe(300)
      
      expect(WEB_VITALS_THRESHOLDS.CLS.good).toBe(0.1)
      expect(WEB_VITALS_THRESHOLDS.CLS.needsImprovement).toBe(0.25)
      
      expect(WEB_VITALS_THRESHOLDS.FCP.good).toBe(1800)
      expect(WEB_VITALS_THRESHOLDS.FCP.needsImprovement).toBe(3000)
      
      expect(WEB_VITALS_THRESHOLDS.TTFB.good).toBe(800)
      expect(WEB_VITALS_THRESHOLDS.TTFB.needsImprovement).toBe(1800)
    })
  })
})