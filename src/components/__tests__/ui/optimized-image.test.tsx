import { render, screen, waitFor } from '@/lib/test-utils'
import { OptimizedImage } from '@/components/ui/optimized-image'

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, onError, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        data-testid="next-image"
        {...props}
      />
    )
  }
})

describe('OptimizedImage Component', () => {
  const defaultProps = {
    src: 'https://res.cloudinary.com/test/image/upload/test.jpg',
    alt: 'Test image',
    width: 400,
    height: 300,
  }

  it('renders with default props', () => {
    render(<OptimizedImage {...defaultProps} />)
    
    const image = screen.getByTestId('next-image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('alt', 'Test image')
  })

  it('shows loading placeholder initially', () => {
    render(<OptimizedImage {...defaultProps} />)
    
    const image = screen.getByTestId('next-image')
    expect(image).toHaveClass('opacity-0')
  })

  it('shows image after loading', async () => {
    render(<OptimizedImage {...defaultProps} />)
    
    const image = screen.getByTestId('next-image')
    
    // Simulate image load
    fireEvent.load(image)
    
    await waitFor(() => {
      expect(image).toHaveClass('opacity-100')
    })
  })

  it('shows error state when image fails to load', async () => {
    render(<OptimizedImage {...defaultProps} />)
    
    const image = screen.getByTestId('next-image')
    
    // Simulate image error
    fireEvent.error(image)
    
    await waitFor(() => {
      expect(screen.getByText('Test image')).toBeInTheDocument()
    })
  })

  it('uses fallback src when main image fails and fallback is provided', async () => {
    const fallbackSrc = '/fallback.jpg'
    render(<OptimizedImage {...defaultProps} fallbackSrc={fallbackSrc} />)
    
    const image = screen.getByTestId('next-image')
    
    // Simulate image error
    fireEvent.error(image)
    
    await waitFor(() => {
      expect(image).toHaveAttribute('src', fallbackSrc)
    })
  })

  it('applies custom className', () => {
    render(<OptimizedImage {...defaultProps} className="custom-class" />)
    
    const image = screen.getByTestId('next-image')
    expect(image).toHaveClass('custom-class')
  })

  it('applies custom container className', () => {
    render(<OptimizedImage {...defaultProps} containerClassName="container-class" />)
    
    const container = screen.getByTestId('next-image').parentElement
    expect(container).toHaveClass('container-class')
  })
})