const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Link2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function CalendarSync({ properties }) {
  const { t, localField } = useLanguage();
  const queryClient = useQueryClient();
  const [icalUrls, setIcalUrls] = useState({});

  const updateProperty = useMutation({
    mutationFn: ({ id, data }) => db.entities.Property.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('iCal URL saved');
    },
  });

  const handleSave = (property) => {
    const url = icalUrls[property.id] ?? property.ical_url ?? '';
    updateProperty.mutate({ id: property.id, data: { ical_url: url } });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {t('calendarSync')}
        </h2>
        <p className="text-xs text-muted-foreground font-body mt-1">
          Paste iCal URLs from Airbnb or Booking.com to sync blocked dates
        </p>
      </div>
      <div className="p-5 space-y-4">
        {properties.map(p => (
          <Card key={p.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-body font-medium text-sm">{localField(p, 'name')}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    placeholder="https://www.airbnb.com/calendar/ical/..."
                    value={icalUrls[p.id] ?? p.ical_url ?? ''}
                    onChange={e => setIcalUrls(prev => ({ ...prev, [p.id]: e.target.value }))}
                    className="font-body text-sm"
                  />
                  <Button size="sm" variant="outline" className="font-body text-xs whitespace-nowrap gap-1"
                    onClick={() => handleSave(p)} disabled={updateProperty.isPending}>
                    <Link2 className="w-3 h-3" /> {t('save')}
                  </Button>
                </div>
                {p.ical_url && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="font-body text-xs gap-1">
                      <ExternalLink className="w-3 h-3" /> iCal linked
                    </Badge>
                    {p.blocked_dates?.length > 0 && (
                      <span className="text-xs text-muted-foreground font-body">
                        {p.blocked_dates.length} dates blocked
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}