import { Outlet, Link, useLocation } from 'react-router';
import { Users, LogOut, Home, Menu } from 'lucide-react';
import { Logo } from './Logo';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';

function SidebarContent({ isActive, closeMobileMenu }) {
  return (
    <>
      {/* Logo and Title */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="scale-75 origin-left">
            <Logo />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">VetScribe</h1>
            <p className="text-xs text-gray-300">Sistema Veterinário</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          <Link
            to="/dashboard"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'bg-[#CFEAF3] text-[#032048]'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>

          <Link
            to="/dashboard/pacientes"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard/pacientes')
                ? 'bg-[#CFEAF3] text-[#032048]'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Pacientes</span>
          </Link>
        </div>
      </nav>

      {/* User/Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors w-full">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </>
  );
}

export function DashboardLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-sidebar flex-col">
        <SidebarContent isActive={isActive} closeMobileMenu={closeMobileMenu} />
      </aside>

      {/* Mobile Menu Button */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#032048] text-white rounded-lg shadow-lg hover:bg-[#032048]/90 transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-sidebar border-sidebar-border w-64">
          {/* Hidden accessibility elements */}
          <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
          <SheetDescription className="sr-only">
            Navegue entre as páginas do VetScribe
          </SheetDescription>
          
          <div className="flex flex-col h-full">
            <SidebarContent isActive={isActive} closeMobileMenu={closeMobileMenu} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}