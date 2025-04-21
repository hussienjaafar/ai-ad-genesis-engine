
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { useAuth } from '@/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

// Mock the SocialLoginButtons component
jest.mock('@/components/Auth/SocialLoginButtons', () => ({
  SocialLoginButtons: () => <div data-testid="social-login-buttons">Social Login Buttons</div>
}));

describe('Login Page', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
      isLoading: false
    });
  });

  it('renders login form with email and password fields', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays social login buttons', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('social-login-buttons')).toBeInTheDocument();
  });

  it('calls login function when form is submitted', () => {
    const mockLogin = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('disables the sign in button when loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
      isLoading: true
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const signInButton = screen.getByRole('button', { name: /signing in/i });
    expect(signInButton).toBeDisabled();
  });
});
