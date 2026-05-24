const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import BookingCalendar from '@/components/BookingCalendar';
import PriceSummary, { calculatePricing } from '@/components/PriceSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, Users, BedDouble, Bath, Wifi, Car, Wind, Utensils, Waves, TreePine, Check, Info } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const amenityIcons = {
  'WiFi': Wifi, 'Parking': Car, 'Air Conditioning': Wind, 'Kitchen': Utensils,
  'Sea View': Waves, 'Garden': TreePine, 'Pool': Waves,
};

export default function PropertyDetails() {
  const { t, localField, lang } = useLanguage();
  const queryClient = useQueryClient();
  const propertyId = window.location.pathname.split('/').pop();

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [couponData, setCouponData] = useState(null);
  const [guestForm, setGuestForm] = useState({ guest_name: '', guest_email: '', guest_phone: '', num_guests: 1, special_requests: '' });
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const list = await db.entities.Property.filter({ id: propertyId });
      return list[0];
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['property-bookings', propertyId],
    queryFn: () => db.entities.Booking.filter({ property_id: propertyId }),
    initialData: [],
  });

  const createBooking = useMutation({
    mutationFn: (data) => db.entities.Booking.create(data),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['property-bookings'] });
      setBookingComplete(booking);
      toast.success(t('bookingSuccess'));
    },
  });

  const handleDateSelect = (ci, co) => {
    setCheckIn(ci);
    setCheckOut(co);
    setCouponData(null);
  };

  const handleSubmitBooking = () => {
    if (!checkIn || !checkOut || !guestForm.guest_name || !guestForm.guest_email) {
      toast.error('Please fill in all required fields');
      return;
    }
    const nights = differenceInDays(checkOut, checkIn);
    if (nights < 2) {
      toast.error(t('minStay'));
      return;
    }
    const pricing = calculatePricing(property, checkIn, checkOut, couponData);
    createBooking.mutate({
      property_id: propertyId,
      property_name: localField(property, 'name'),
      check_in_date: format(checkIn, 'yyyy-MM-dd'),
      check_out_date: format(checkOut, 'yyyy-MM-dd'),
      num_nights: pricing.nights,
      subtotal: pricing.subtotal,
      discount_applied: pricing.totalDiscount,
      coupon_code: couponData?.code || '',
      total_price: pricing.total,
      booking_status: 'pending',
      ...guestForm,
    });
  };

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <Skeleton className="aspect-[16/9] rounded-xl mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );

  if (!property) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground font-body">Property not found</p>
      <Button asChild variant="outline" className="mt-4"><Link to="/">{t('backHome')}</Link></Button>
    </div>
  );

  if (bookingComplete) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-foreground mb-2">{t('bookingSuccess')}</h2>
        <p className="font-body text-muted-foreground mb-6">{t('bookingSuccessMsg')}</p>
        <div className="bg-card border border-border rounded-xl p-4 mb-6 text-sm font-body text-left space-y-2">
          <div className="flex justify-between"><span className="text-muted-foreground">{t('bookingRef')}</span><span className="font-medium">#{bookingComplete.id?.slice(-8)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">{t('property')}</span><span className="font-medium">{bookingComplete.property_name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">{t('dates')}</span><span className="font-medium">{bookingComplete.check_in_date} → {bookingComplete.check_out_date}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">{t('total')}</span><span className="font-semibold text-primary">€{bookingComplete.total_price?.toFixed(2)}</span></div>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 font-body"><Link to="/">{t('backHome')}</Link></Button>
      </motion.div>
    </div>
  );

  const images = property.image_urls?.length > 0
    ? property.image_urls
    : ['https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80'];

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> {t('backHome')}
      </Link>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="aspect-[16/9] sm:aspect-[2/1] rounded-xl overflow-hidden mb-2">
          <img src={images[selectedImage]} alt="" className="w-full h-full object-cover" />
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button key={i} onClick={() => setSelectedImage(i)}
                className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">{localField(property, 'name')}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-body text-muted-foreground">{property.location}</span>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 font-body text-sm whitespace-nowrap">
                {localField(property, 'property_type') || 'Holiday Home'}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm font-body text-muted-foreground py-4 border-y border-border/50">
              <div className="flex items-center gap-1.5"><Users className="w-4 h-4" />{t('sleepsUpTo')} {property.max_guests || 6}</div>
              <div className="flex items-center gap-1.5"><BedDouble className="w-4 h-4" />{property.bedrooms || 2} {t('bedrooms')}</div>
              <div className="flex items-center gap-1.5"><Bath className="w-4 h-4" />{property.bathrooms || 1} {t('bathrooms')}</div>
            </div>

            <p className="font-body text-foreground/80 leading-relaxed mt-5 whitespace-pre-line">
              {localField(property, 'description')}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">{t('amenities')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map(a => {
                  const AIcon = amenityIcons[a] || Check;
                  return (
                    <div key={a} className="flex items-center gap-2.5 p-3 bg-muted/50 rounded-lg text-sm font-body">
                      <AIcon className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{a}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Calendar */}
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-1">{t('selectDates')}</h2>
            <p className="text-xs text-muted-foreground font-body mb-4 flex items-center gap-1"><Info className="w-3 h-3" /> {t('minStay')}</p>
            <BookingCalendar
              blockedDates={property.blocked_dates || []}
              bookings={bookings}
              onDateSelect={handleDateSelect}
              checkIn={checkIn}
              checkOut={checkOut}
            />
            {checkIn && checkOut && (
              <div className="mt-4 flex items-center gap-3 text-sm font-body">
                <Badge variant="outline" className="font-body">{t('checkIn')}: {format(checkIn, 'MMM d, yyyy')}</Badge>
                <ArrowLeft className="w-3 h-3 rotate-180 text-muted-foreground" />
                <Badge variant="outline" className="font-body">{t('checkOut')}: {format(checkOut, 'MMM d, yyyy')}</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20 font-body">{nights} {nights > 1 ? t('nights') : t('night')}</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-center mb-4">
              <span className="font-heading text-3xl font-bold text-foreground">€{property.base_price_per_night}</span>
              <span className="text-muted-foreground font-body text-sm"> {t('perNight')}</span>
            </div>
            <p className="text-xs text-center text-green-600 font-body bg-green-50 rounded-lg py-1.5 mb-4">{t('weeklyDiscountNote')}</p>
          </div>

          {checkIn && checkOut && nights >= 2 && (
            <>
              <PriceSummary
                property={property}
                checkIn={checkIn}
                checkOut={checkOut}
                couponData={couponData}
                onCouponApplied={setCouponData}
              />

              {!showBookingForm ? (
                <Button className="w-full bg-primary hover:bg-primary/90 font-body font-semibold text-base h-12" onClick={() => setShowBookingForm(true)}>
                  {t('bookNow')}
                </Button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="font-heading text-lg font-semibold">{t('guestDetails')}</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="font-body text-sm">{t('fullName')} *</Label>
                      <Input value={guestForm.guest_name} onChange={e => setGuestForm(p => ({ ...p, guest_name: e.target.value }))} className="mt-1 font-body" />
                    </div>
                    <div>
                      <Label className="font-body text-sm">{t('email')} *</Label>
                      <Input type="email" value={guestForm.guest_email} onChange={e => setGuestForm(p => ({ ...p, guest_email: e.target.value }))} className="mt-1 font-body" />
                    </div>
                    <div>
                      <Label className="font-body text-sm">{t('phone')}</Label>
                      <Input value={guestForm.guest_phone} onChange={e => setGuestForm(p => ({ ...p, guest_phone: e.target.value }))} className="mt-1 font-body" />
                    </div>
                    <div>
                      <Label className="font-body text-sm">{t('numGuests')}</Label>
                      <Input type="number" min={1} max={property.max_guests || 10} value={guestForm.num_guests} onChange={e => setGuestForm(p => ({ ...p, num_guests: parseInt(e.target.value) || 1 }))} className="mt-1 font-body" />
                    </div>
                    <div>
                      <Label className="font-body text-sm">{t('specialRequests')}</Label>
                      <Textarea value={guestForm.special_requests} onChange={e => setGuestForm(p => ({ ...p, special_requests: e.target.value }))} className="mt-1 font-body" rows={3} />
                    </div>
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 font-body font-semibold h-12"
                    onClick={handleSubmitBooking}
                    disabled={createBooking.isPending}
                  >
                    {createBooking.isPending ? '...' : t('confirmBooking')}
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}