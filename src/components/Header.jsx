import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe } from 'lucide-react';

export default function Header() {
  const { lang, setLang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-lg">I</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-heading text-lg font-semibold text-foreground tracking-tight">
                {t('brand')}
              </span>
              <p className="text-[11px] text-muted-foreground -mt-0.5 font-body">Lesvos, Greece</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
              {t('home')}
            </Link>
            <Link to="/explore" className="px-4 py-2 text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
              {t('explore')}
            </Link>
            <Link to="/admin" className="px-4 py-2 text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
              {t('dashboard')}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === 'en' ? 'el' : 'en')}
              className="gap-1.5 text-xs font-body font-medium border-border/60 hover:bg-accent"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'en' ? 'EL' : 'EN'}
            </Button>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-border/50 pt-3 space-y-1">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-body font-medium text-foreground rounded-lg hover:bg-muted">
              {t('home')}
            </Link>
            <Link to="/explore" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-body font-medium text-foreground rounded-lg hover:bg-muted">
              {t('explore')}
            </Link>
            <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-body font-medium text-foreground rounded-lg hover:bg-muted">
              {t('dashboard')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}