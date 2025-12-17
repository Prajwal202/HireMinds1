import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear form errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Don't clear submit error immediately - let user see it until they submit again
  };

  const getErrorMessage = (error) => {
    if (!error) return '';
    
    // Check for specific error messages and provide user-friendly responses
    if (error.toLowerCase().includes('invalid credentials') || 
        error.toLowerCase().includes('incorrect password') ||
        error.toLowerCase().includes('password is incorrect')) {
      return 'Incorrect password. Please try again.';
    }
    
    if (error.toLowerCase().includes('user not found') || 
        error.toLowerCase().includes('email not found') ||
        error.toLowerCase().includes('no account found')) {
      return 'No account found with this email address.';
    }
    
    if (error.toLowerCase().includes('email not verified')) {
      return 'Please verify your email address before logging in.';
    }
    
    if (error.toLowerCase().includes('account locked') || 
        error.toLowerCase().includes('account suspended')) {
      return 'Your account has been locked. Please contact support.';
    }
    
    if (error.toLowerCase().includes('too many attempts') ||
        error.toLowerCase().includes('rate limit')) {
      return 'Too many login attempts. Please try again later.';
    }
    
    // Default fallback
    return 'Login failed. Please check your credentials and try again.';
  };

  const handleSubmit = async (e) => {
    // Prevent any default form behavior
    e.preventDefault();
    e.stopPropagation();
    
    // Clear previous errors
    setSubmitError('');
    
    if (!validateForm() || isSubmitting) {
      console.log('Validation failed or already submitting');
      return false;
    }
    
    console.log('Starting login submission...');
    setIsSubmitting(true);
    
    try {
      const { email, password } = formData;
      console.log('Attempting login with:', { email, password: '***' });
      
      const { success, error: loginError, user: loggedInUser } = await login(email, password);
      
      console.log('Login response:', { success, error: loginError, user: loggedInUser });
      
      if (success) {
        toast.success('Successfully logged in!');
        
        // Get user role from login response
        const userRole = loggedInUser?.role;
        
        // Route based on user role
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'employer' || userRole === 'recruiter') {
          navigate('/recruiter/dashboard');
        } else if (userRole === 'freelancer') {
          navigate('/freelancer/dashboard');
        } else {
          // Default fallback to general dashboard
          navigate('/dashboard');
        }
      } else {
        console.log('Login failed, showing error:', loginError);
        const userFriendlyError = getErrorMessage(loginError);
        setSubmitError(userFriendlyError);
        toast.error(userFriendlyError);
        // Don't navigate, stay on the same page to show the error
      }
    } catch (err) {
      console.error('Login error caught:', err);
      const userFriendlyError = getErrorMessage(err.message || err.toString());
      setSubmitError(userFriendlyError);
      toast.error(userFriendlyError);
      // Don't navigate, stay on the same page to show the error
    } finally {
      console.log('Finally block, setting isSubmitting to false');
      setIsSubmitting(false);
    }
    
    return false;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 px-6 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-white bg-opacity-10">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-white">Welcome Back</h2>
            <p className="mt-2 text-sm text-primary-100">Sign in to access your account</p>
          </div>

          {/* Form */}
          <div className="px-6 py-8 sm:px-10">
            {/* Submit Error Alert */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Login Error</h3>
                    <p className="mt-1 text-sm text-red-700">{submitError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder="you@example.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      formErrors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="-ml-1 mr-2 h-5 w-5" />
                      Sign in
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sign Up Link */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Register now       
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
