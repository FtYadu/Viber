import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import { ChatBubble } from '@/components/chat/chat-bubble'

// Mock usePathname
const mockUsePathname = jest.fn()
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: () => mockUsePathname(),
}))

// Mock ChatWindow component
jest.mock('@/components/chat/chat-window', () => ({
  ChatWindow: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="chat-window">
      <button onClick={onClose} data-testid="close-chat">Close</button>
    </div>
  ),
}))

describe('ChatBubble Component', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  it('renders chat bubble button', async () => {
    render(<ChatBubble />)
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /open chat/i })
      expect(button).toBeInTheDocument()
    })
  })

  it('does not render on admin pages', async () => {
    mockUsePathname.mockReturnValue('/admin')
    
    render(<ChatBubble />)
    
    await waitFor(() => {
      const button = screen.queryByRole('button', { name: /open chat/i })
      expect(button).not.toBeInTheDocument()
    })
  })

  it('opens chat window when clicked', async () => {
    render(<ChatBubble />)
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(button)
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('chat-window')).toBeInTheDocument()
    })
  })

  it('closes chat window when close button is clicked', async () => {
    render(<ChatBubble />)
    
    // Open chat
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(button)
    })
    
    // Close chat
    await waitFor(() => {
      const closeButton = screen.getByTestId('close-chat')
      fireEvent.click(closeButton)
    })
    
    await waitFor(() => {
      expect(screen.queryByTestId('chat-window')).not.toBeInTheDocument()
    })
  })

  it('changes button icon when chat is open', async () => {
    render(<ChatBubble />)
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(button)
    })
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /close chat/i })
      expect(button).toBeInTheDocument()
    })
  })

  it('closes chat when pathname changes', async () => {
    const { rerender } = render(<ChatBubble />)
    
    // Open chat
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(button)
    })
    
    // Change pathname
    mockUsePathname.mockReturnValue('/portfolio')
    rerender(<ChatBubble />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('chat-window')).not.toBeInTheDocument()
    })
  })
})