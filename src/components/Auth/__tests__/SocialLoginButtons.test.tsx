
import { render, screen, fireEvent } from '@testing-library/react';
import { SocialLoginButtons } from '../SocialLoginButtons';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn()
    }
  }
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}));

describe('SocialLoginButtons Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Google sign in button', () => {
    render(<SocialLoginButtons />);
    const googleButton = screen.getByText(/Continue with Google/i);
    expect(googleButton).toBeInTheDocument();
  });

  it('calls Supabase signInWithOAuth when Google button is clicked', async () => {
    // Mock a successful response
    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({ error: null });
    
    render(<SocialLoginButtons />);
    const googleButton = screen.getByText(/Continue with Google/i);
    
    fireEvent.click(googleButton);
    
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: expect.objectContaining({
        redirectTo: expect.any(String),
        queryParams: expect.objectContaining({
          access_type: 'offline',
          prompt: 'consent'
        })
      })
    });
  });

  it('displays an error toast when sign-in fails', async () => {
    // Mock an error response
    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({ 
      error: { message: 'Auth error' } 
    });
    
    render(<SocialLoginButtons />);
    const googleButton = screen.getByText(/Continue with Google/i);
    
    fireEvent.click(googleButton);
    
    expect(toast.error).toHaveBeenCalled();
  });
});
