import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Logo } from './Logo';
import api from '../utils/api';

export function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: false, password: false });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setServerError('');

    if (touched.email) {
      setErrors((prev) => ({
        ...prev,
        email: !validateEmail(value) && value.length > 0
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setServerError('');

    if (touched.password) {
      setErrors((prev) => ({
        ...prev,
        password: value.length === 0
      }));
    }
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    setErrors((prev) => ({
      ...prev,
      email: !validateEmail(email) && email.length > 0
    }));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    setErrors((prev) => ({
      ...prev,
      password: password.length === 0
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setTouched({ email: true, password: true });
    setServerError('');

    const emailValid = validateEmail(email);
    const passwordValid = password.length > 0;

    setErrors({
      email: !emailValid,
      password: !passwordValid
    });

    if (!emailValid || !passwordValid) return;

    try {
      setIsLoading(true);

      const response = await api.post('/auth/login', {
        email: email.trim(),
        senha: password
      });

      const { veterinario, mensagem } = response.data;

      localStorage.setItem('veterinario', JSON.stringify(veterinario));
      localStorage.setItem('isAuthenticated', 'true');

      if (mensagem) {
        localStorage.setItem('loginMessage', mensagem);
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);

      const detail =
        error?.response?.data?.detail ||
        'Não foi possível fazer login. Verifique suas credenciais.';

      setServerError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-6 sm:px-0">
      <div className="sm:bg-white sm:rounded-2xl sm:shadow-lg sm:p-8">
        <div className="mb-8">
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

          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-gray-600">
              Entre com suas credenciais para acessar
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
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
                autoComplete="email"
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
              <p className="text-xs text-red-500">
                Por favor, insira um endereço de e-mail válido
              </p>
            )}
          </div>

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
                autoComplete="current-password"
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
              <p className="text-xs text-red-500">
                A senha é obrigatória
              </p>
            )}
          </div>

          {serverError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

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

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 mt-0.5 text-[#7DD87D] flex-shrink-0" />
            <p>
              Sua conexão é protegida com criptografia de padrão industrial.
              O acesso é liberado somente para veterinários cadastrados no banco.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 mt-6">
        © 2026 AnimalTalk. Todos os direitos reservados.
      </p>
    </div>
  );
}