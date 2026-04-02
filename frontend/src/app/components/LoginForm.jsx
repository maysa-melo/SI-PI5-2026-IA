import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Logo } from './Logo';

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: false, password: false });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      setErrors({ ...errors, email: !validateEmail(value) && value.length > 0 });
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setErrors({ ...errors, password: value.length === 0 });
    }
  };

  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
    setErrors({ ...errors, email: !validateEmail(email) && email.length > 0 });
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    setErrors({ ...errors, password: password.length === 0 });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Mark all fields
    setTouched({ email: true, password: true });
    
    // Validate all fields
    const emailValid = validateEmail(email);
    const passwordValid = password.length > 0;
    
    setErrors({
      email: !emailValid,
      password: !passwordValid
    });

    if (emailValid && passwordValid) {
      setIsLoading(true);
      // Simulate API call for JWT authentication
      setTimeout(() => {
        setIsLoading(false);
        navigate('/dashboard');
      }, 1500);
    }
  };

  return (
    <div className="w-full max-w-md px-6 sm:px-0">
      <div className="sm:bg-white sm:rounded-2xl sm:shadow-lg sm:p-8">
        {/* Header */}
        <div className="mb-8">
          {/* Logo and System Name */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Logo variant="login" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                AnimalTalk
              </h1>
              <p className="text-sm text-gray-500">
                Gestão Veterinária
              </p>
            </div>
          </div>
          
          {/* Welcome Message */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-gray-600">
              Entre com suas credenciais para acessar
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              E-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                className={`pl-10 h-11 ${
                  errors.email && touched.email
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.email && touched.email && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              )}
            </div>
            {errors.email && touched.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span>Por favor, insira um endereço de e-mail válido</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <button
                type="button"
                className="text-xs text-[#EF6C50] hover:text-[#E05C40] transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                className={`pl-10 h-11 ${
                  errors.password && touched.password
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.password && touched.password && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              )}
            </div>
            {errors.password && touched.password && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span>A senha é obrigatória</span>
              </p>
            )}
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#EF6C50] hover:bg-[#E05C40] text-white font-medium transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Autenticando...
              </span>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 mt-0.5 text-[#7DD87D] flex-shrink-0" />
            <p>
              Sua conexão é protegida com criptografia de padrão industrial. 
              A autenticação utiliza tokens JWT para gerenciamento seguro de sessão.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-500 mt-6">
        © 2026 AnimalTalk. Todos os direitos reservados.
      </p>
    </div>
  );
}