const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Landmark, Eye, Home, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categoryConfig = {
  residence: { icon: Home, color: 'bg-primary/10 text-primary border-primary/20' },
  landmark: { icon: Landmark, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  location: { icon: Eye, color: 'bg-green-50 text-green-700 border-green-200' },
};

export default function ExploreLesvos() {
  const { t, localField } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['guidebook'],
    queryFn: () => db.entities.Guidebook.list(),
    initialData: [],
  });

  const filtered = activeCategory === 'all' ? entries : entries.filter(e => e.category === activeCategory);

  const categories = [
    { key: 'all', label: t('allCategories') },
    { key: 'residence', label: t('ourResidences') },
    { key: 'landmark', label: t('landmarks') },
    { key: 'location', label: t('hiddenLocations') },
  ];

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/20 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-body font-medium text-primary">Lesvos Island</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">{t('exploreTitle')}</h1>
            <p className="font-body text-muted-foreground leading-relaxed">{t('exploreSubtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(c => (
            <Button
              key={c.key}
              variant={activeCategory === c.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(c.key)}
              className={`font-body text-sm ${activeCategory === c.key ? 'bg-primary text-primary-foreground' : ''}`}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((entry, i) => {
                const config = categoryConfig[entry.category] || categoryConfig.location;
                const CategoryIcon = config.icon;
                const isResidence = entry.category === 'residence' && entry.property_id;

                const CardContent = (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={entry.image_url || 'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?w=800&q=80'}
                        alt={localField(entry, 'title')}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className={`${config.color} border font-body text-xs gap-1`}>
                          <CategoryIcon className="w-3 h-3" />
                          {t(entry.category)}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="font-heading text-lg font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                        {localField(entry, 'title')}
                      </h3>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {localField(entry, 'description')}
                      </p>
                      {isResidence && (
                        <div className="mt-3 flex items-center gap-1 text-primary font-body text-sm font-medium">
                          {t('viewProperty')} <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );

                if (isResidence) {
                  return <Link key={entry.id} to={`/property/${entry.property_id}`}>{CardContent}</Link>;
                }
                return CardContent;
              })}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-body text-muted-foreground">No entries found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}