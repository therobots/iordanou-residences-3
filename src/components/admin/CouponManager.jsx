const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CouponManager() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_percentage: 10 });

  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => db.entities.Coupon.list(),
    initialData: [],
  });

  const createCoupon = useMutation({
    mutationFn: (data) => db.entities.Coupon.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setOpen(false);
      setNewCoupon({ code: '', discount_percentage: 10 });
      toast.success('Coupon created');
    },
  });

  const updateCoupon = useMutation({
    mutationFn: ({ id, data }) => db.entities.Coupon.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  const deleteCoupon = useMutation({
    mutationFn: (id) => db.entities.Coupon.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon deleted');
    },
  });

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">{t('coupons')}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90 font-body gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> {t('createCoupon')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">{t('createCoupon')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="font-body text-sm">{t('code')}</Label>
                <Input value={newCoupon.code} onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="WELCOME10" className="mt-1 font-body" />
              </div>
              <div>
                <Label className="font-body text-sm">{t('discount')} (%)</Label>
                <Input type="number" min={1} max={100} value={newCoupon.discount_percentage} onChange={e => setNewCoupon(p => ({ ...p, discount_percentage: parseInt(e.target.value) || 0 }))} className="mt-1 font-body" />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 font-body" onClick={() => createCoupon.mutate({ ...newCoupon, active: true, usage_count: 0 })} disabled={!newCoupon.code || createCoupon.isPending}>
                {t('save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-body text-xs">{t('code')}</TableHead>
              <TableHead className="font-body text-xs">{t('discount')}</TableHead>
              <TableHead className="font-body text-xs">{t('status')}</TableHead>
              <TableHead className="font-body text-xs">{t('uses')}</TableHead>
              <TableHead className="font-body text-xs">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-body text-sm font-mono font-medium">{c.code}</TableCell>
                <TableCell className="font-body text-sm">{c.discount_percentage}%</TableCell>
                <TableCell>
                  <Badge className={`font-body text-xs border ${c.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-muted text-muted-foreground border-border'}`}>
                    {c.active ? t('active') : t('inactive')}
                  </Badge>
                </TableCell>
                <TableCell className="font-body text-sm">{c.usage_count || 0}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="text-xs font-body h-7"
                      onClick={() => updateCoupon.mutate({ id: c.id, data: { active: !c.active } })}>
                      {c.active ? t('revoke') : t('activate')}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-red-50"
                      onClick={() => deleteCoupon.mutate(c.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}