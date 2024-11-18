import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { signInUser } from '../lib/auth';
import { toast } from 'sonner';
import { useAuthStore } from '../lib/auth-store';

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
  save_password: boolean;
}

export default function Login() {
  const navigate = useNavigate();
  const { setUser, savedCredentials, setSavedCredentials } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    defaultValues: {
      username: savedCredentials?.username || '',
      password: savedCredentials?.password || '',
      remember: true,
      save_password: !!savedCredentials
    }
  });

  useEffect(() => {
    if (savedCredentials) {
      setValue('username', savedCredentials.username);
      setValue('password', savedCredentials.password);
      setValue('save_password', true);
    }
  }, [savedCredentials, setValue]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const user = await signInUser(data.username, data.password);

      if (data.save_password) {
        setSavedCredentials({ username: data.username, password: data.password });
      } else {
        setSavedCredentials(null);
      }

      setUser(user);
      navigate(user.role === 'admin' ? '/' : '/debtors');
      toast.success('Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Building2 className="w-12 h-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          DebtFlow AI
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          AI-Powered Debt Collection CRM
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-muted-foreground">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  {...register('username', { required: 'Username is required' })}
                  className="appearance-none block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password', { required: 'Password is required' })}
                  className="appearance-none block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
                  {...register('remember')}
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-muted-foreground">
                  Remember me
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="save_password"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
                  {...register('save_password')}
                />
                <label htmlFor="save_password" className="ml-2 block text-sm text-muted-foreground">
                  Save password for quick login
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  Admin Credentials
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className="rounded-md bg-muted/50 p-4">
                <div className="text-sm text-muted-foreground">
                  <p>Username: admin</p>
                  <p>Password: admin123!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}