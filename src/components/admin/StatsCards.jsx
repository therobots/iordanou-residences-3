import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Card } from '@/components/ui/card';
import { DollarSign, CalendarCheck, Clock, XCircle } from 'lucide-react';

export default function StatsCards({ bookings }) {
  const { t } = useLanguage();
  const confirmed = bookings.filter(b => b.booking_status === 'confirmed');
  const pending = bookings.filter(b => b.booking_status === 'pending');
  const cancelled = bookings.filter(b => b.booking_status === 'cancelled');
  const totalRevenue = confirmed.reduce((sum, b) => sum + (b.total_price || 0), 0);

  const stats = [
    { label: t('totalRevenue'), value: `€${totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: t('confirmedBookings'), value: confirmed.length, icon: CalendarCheck, color: 'text-primary bg-primary/10' },
    { label: t('pendingBookings'), value: pending.length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: t('cancelledBookings'), value: cancelled.length, icon: XCircle, color: 'text-red-500 bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(s => (
        <Card key={s.label} className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-heading font-bold text-foreground mt-1">{s.value}</p>
            </div>
            <div className={`p-2 rounded-lg ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}