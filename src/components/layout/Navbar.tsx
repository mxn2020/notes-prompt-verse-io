import React, { useState } from 'react';
import { Search, PlusCircle, Bell, Settings, User, LogOut, Menu, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-background border-b border-border z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden md:block ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="block w-full pl-10 pr-3 py-2 border border-input rounded-md leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="mr-2"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Link
                to="/notes/new"
                className="p-1 ml-2 rounded-full text-foreground hover:text-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <PlusCircle className="h-6 w-6" />
              </Link>
              <button className="p-1 ml-2 rounded-full text-foreground hover:text-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary">
                <Bell className="h-6 w-6" />
              </button>

              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={toggleUserMenu}
                    className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground uppercase">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  </button>
                </div>
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-background ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 text-sm text-foreground border-b border-border">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="mr-2"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Link
              to="/notes/new"
              className="p-1 rounded-full text-foreground hover:text-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary mr-2"
            >
              <PlusCircle className="h-6 w-6" />
            </Link>
            <button
              onClick={toggleUserMenu}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {user?.name?.charAt(0) || 'U'}
            </button>
            {userMenuOpen && (
              <div className="origin-top-right absolute right-4 top-16 mt-2 w-48 rounded-md shadow-lg py-1 bg-background ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-2 text-sm text-foreground border-b border-border">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden px-4 py-2 border-t border-border">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            className="block w-full pl-10 pr-3 py-2 border border-input rounded-md leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;