const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

const statusColors = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export default function BookingsTable({ bookings }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const updateBooking = useMutation({
    mutationFn: ({ id, data }) => db.entities.Booking.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Booking updated');
    },
  });

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="font-heading text-lg font-semibold">{t('reservations')}</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-body text-xs">{t('property')}</TableHead>
              <TableHead className="font-body text-xs">{t('guest')}</TableHead>
              <TableHead className="font-body text-xs">{t('dates')}</TableHead>
              <TableHead className="font-body text-xs">{t('amount')}</TableHead>
              <TableHead className="font-body text-xs">{t('status')}</TableHead>
              <TableHead className="font-body text-xs">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground font-body">No bookings yet</TableCell>
              </TableRow>
            ) : (
              bookings.map(b => (
                <TableRow key={b.id} className="hover:bg-muted/30">
                  <TableCell className="font-body text-sm font-medium">{b.property_name}</TableCell>
                  <TableCell className="font-body text-sm">
                    <div>{b.guest_name}</div>
                    <div className="text-xs text-muted-foreground">{b.guest_email}</div>
                  </TableCell>
                  <TableCell className="font-body text-sm whitespace-nowrap">{b.check_in_date} → {b.check_out_date}</TableCell>
                  <TableCell className="font-body text-sm font-medium">€{b.total_price?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[b.booking_status]} border font-body text-xs`}>
                      {b.booking_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {b.booking_status === 'pending' && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:bg-green-50"
                          onClick={() => updateBooking.mutate({ id: b.id, data: { booking_status: 'confirmed' } })}>
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50"
                          onClick={() => updateBooking.mutate({ id: b.id, data: { booking_status: 'cancelled' } })}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}