import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-display font-bold text-primary-foreground text-xl group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              N
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-secondary opacity-50 blur-lg group-hover:opacity-75 transition-opacity" />
          </div>
          <span className="font-display font-bold text-xl text-gradient hidden sm:inline">
            Nova's Platform
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/software" className="text-muted-foreground hover:text-foreground transition-colors">
            Software
          </Link>
          <Link to="/games" className="text-muted-foreground hover:text-foreground transition-colors">
            Games
          </Link>
          <Link to="/files" className="text-muted-foreground hover:text-foreground transition-colors">
            Files
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Button variant="cyber" size="sm" asChild>
                  <Link to="/admin">
                    <Shield className="h-4 w-4 mr-1" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <User className="h-4 w-4 mr-1" />
                {user.email?.split('@')[0]}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Login</Link>
              </Button>
              <Button variant="glow" size="sm" asChild>
                <Link to="/auth?mode=signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/50 p-4 animate-fade-in">
          <nav className="flex flex-col gap-3">
            <Link to="/" className="text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/software" className="text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
              Software
            </Link>
            <Link to="/games" className="text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
              Games
            </Link>
            <Link to="/files" className="text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
              Files
            </Link>
            <div className="h-px bg-border my-2" />
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
                    <Shield className="h-4 w-4 inline mr-2" />
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={handleSignOut} className="text-left text-foreground py-2">
                  <LogOut className="h-4 w-4 inline mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/auth?mode=signup" className="text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
