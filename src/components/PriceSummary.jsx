const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, Check, AlertCircle, Info } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function PriceSummary({ property, checkIn, checkOut, couponData, onCouponApplied }) {
  const { t } = useLanguage();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  if (!checkIn || !checkOut || !property) return null;

  const nights = differenceInDays(checkOut, checkIn);
  const pricePerNight = property.base_price_per_night;
  const subtotal = nights * pricePerNight;
  const hasWeeklyDiscount = nights >= 7;
  const weeklyDiscountAmount = hasWeeklyDiscount ? subtotal * 0.1 : 0;
  const afterWeekly = subtotal - weeklyDiscountAmount;
  const couponDiscountPct = couponData?.discount_percentage || 0;
  const couponDiscountAmount = afterWeekly * (couponDiscountPct / 100);
  const total = afterWeekly - couponDiscountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponError('');
    const coupons = await db.entities.Coupon.filter({ code: couponCode.trim().toUpperCase(), active: true });
    if (coupons.length > 0) {
      onCouponApplied(coupons[0]);
    } else {
      setCouponError('Invalid or expired coupon code');
      onCouponApplied(null);
    }
    setApplying(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h3 className="font-heading text-lg font-semibold text-foreground">{t('priceSummary')}</h3>

      <div className="space-y-2.5 text-sm font-body">
        <div className="flex justify-between text-muted-foreground">
          <span>€{pricePerNight} × {nights} {nights > 1 ? t('nights') : t('night')}</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>

        {hasWeeklyDiscount && (
          <div className="flex justify-between text-green-600">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              {t('weeklyDiscount')}
            </span>
            <span>-€{weeklyDiscountAmount.toFixed(2)}</span>
          </div>
        )}

        {couponData && (
          <div className="flex justify-between text-green-600">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              {t('couponDiscount')} ({couponDiscountPct}%)
            </span>
            <span>-€{couponDiscountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-border pt-2.5 flex justify-between font-semibold text-foreground text-base">
          <span>{t('total')}</span>
          <span>€{total.toFixed(2)}</span>
        </div>
      </div>

      {!couponData && (
        <div className="flex gap-2">
          <Input
            placeholder={t('couponPlaceholder')}
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="font-body text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleApplyCoupon}
            disabled={applying}
            className="font-body whitespace-nowrap"
          >
            {t('apply')}
          </Button>
        </div>
      )}

      {couponData && (
        <Badge className="bg-green-50 text-green-700 border-green-200 font-body gap-1">
          <Check className="w-3 h-3" /> {couponData.code} applied
        </Badge>
      )}

      {couponError && (
        <p className="text-xs text-destructive font-body flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {couponError}
        </p>
      )}

      {nights < 2 && (
        <p className="text-xs text-amber-600 font-body flex items-center gap-1.5 bg-amber-50 p-2.5 rounded-lg">
          <Info className="w-3.5 h-3.5 flex-shrink-0" /> {t('minStay')}
        </p>
      )}

      {hasWeeklyDiscount && (
        <p className="text-xs text-green-700 font-body flex items-center gap-1.5 bg-green-50 p-2.5 rounded-lg">
          <Info className="w-3.5 h-3.5 flex-shrink-0" /> {t('weeklyDiscountNote')}
        </p>
      )}
    </div>
  );
}

export function calculatePricing(property, checkIn, checkOut, couponData) {
  const nights = differenceInDays(checkOut, checkIn);
  const subtotal = nights * property.base_price_per_night;
  const hasWeeklyDiscount = nights >= 7;
  const weeklyDiscountAmount = hasWeeklyDiscount ? subtotal * 0.1 : 0;
  const afterWeekly = subtotal - weeklyDiscountAmount;
  const couponDiscountPct = couponData?.discount_percentage || 0;
  const couponDiscountAmount = afterWeekly * (couponDiscountPct / 100);
  const total = afterWeekly - couponDiscountAmount;
  const totalDiscount = (hasWeeklyDiscount ? 10 : 0) + couponDiscountPct;

  return { nights, subtotal, weeklyDiscountAmount, couponDiscountAmount, total, totalDiscount, hasWeeklyDiscount };
}