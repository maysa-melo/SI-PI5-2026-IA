import { PawPrint } from 'lucide-react';

export function Logo({ variant = 'sidebar' }) {
  const isLogin = variant === 'login';

  return (
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
        isLogin ? 'bg-[#032048]' : 'bg-white/20'
      }`}
    >
      <PawPrint className="w-7 h-7 text-white" strokeWidth={1.5} />
    </div>
  );
}