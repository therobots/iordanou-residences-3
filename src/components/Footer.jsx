import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading text-xl font-semibold text-background mb-3">{t('brand')}</h3>
            <p className="text-sm font-body leading-relaxed text-background/60">
              {t('tagline')}
            </p>
          </div>
          <div>
            <h4 className="font-body font-semibold text-background mb-3 text-sm uppercase tracking-wider">Contact</h4>
            <div className="space-y-2.5 text-sm font-body">
              <div className="flex items-center gap-2.5 text-background/60">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Lesvos, Greece</span>
              </div>
              <div className="flex items-center gap-2.5 text-background/60">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@iordanouResidences.gr</span>
              </div>
              <div className="flex items-center gap-2.5 text-background/60">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+30 690 000 0000</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-body font-semibold text-background mb-3 text-sm uppercase tracking-wider">Quick Links</h4>
            <div className="space-y-2 text-sm font-body">
              <a href="/" className="block text-background/60 hover:text-background transition-colors">{t('home')}</a>
              <a href="/explore" className="block text-background/60 hover:text-background transition-colors">{t('explore')}</a>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 mt-8 pt-6 text-center text-xs font-body text-background/40">
          © {new Date().getFullYear()} {t('brand')}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}