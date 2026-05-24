import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, startOfDay, addDays } from 'date-fns';
import { el, enUS } from 'date-fns/locale';

export default function BookingCalendar({ blockedDates = [], bookings = [], onDateSelect, checkIn, checkOut }) {
  const { lang } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const locale = lang === 'el' ? el : enUS;

  const blockedSet = useMemo(() => {
    const set = new Set();
    blockedDates.forEach(d => set.add(d));
    bookings.forEach(b => {
      if (b.booking_status === 'cancelled') return;
      let cur = new Date(b.check_in_date);
      const end = new Date(b.check_out_date);
      while (cur < end) {
        set.add(format(cur, 'yyyy-MM-dd'));
        cur = addDays(cur, 1);
      }
    });
    return set;
  }, [blockedDates, bookings]);

  const today = startOfDay(new Date());

  const isBlocked = (date) => blockedSet.has(format(date, 'yyyy-MM-dd'));
  const isPast = (date) => isBefore(date, today);
  const isCheckIn = (date) => checkIn && isSameDay(date, checkIn);
  const isCheckOut = (date) => checkOut && isSameDay(date, checkOut);
  const isInRange = (date) => {
    if (!checkIn || !checkOut) return false;
    return isAfter(date, checkIn) && isBefore(date, checkOut);
  };

  const handleDayClick = (date) => {
    if (isPast(date) || isBlocked(date)) return;
    if (!checkIn || (checkIn && checkOut)) {
      onDateSelect(date, null);
    } else {
      if (isBefore(date, checkIn)) {
        onDateSelect(date, null);
      } else if (isSameDay(date, checkIn)) {
        return;
      } else {
        // Check if any blocked date is in the range
        let cur = addDays(checkIn, 1);
        while (isBefore(cur, date)) {
          if (isBlocked(cur)) {
            onDateSelect(date, null);
            return;
          }
          cur = addDays(cur, 1);
        }
        onDateSelect(checkIn, date);
      }
    }
  };

  const renderMonth = (monthDate) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = monthStart.getDay();
    const dayNames = lang === 'el'
      ? ['Κυ', 'Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα']
      : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <div>
        <h3 className="text-center font-heading font-semibold text-foreground mb-3 capitalize">
          {format(monthDate, 'MMMM yyyy', { locale })}
        </h3>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {dayNames.map(d => (
            <div key={d} className="text-center text-xs font-body font-medium text-muted-foreground py-1.5">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array(startDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map(day => {
            const blocked = isBlocked(day) || isPast(day);
            const selected = isCheckIn(day) || isCheckOut(day);
            const inRange = isInRange(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                disabled={blocked}
                className={`
                  relative h-10 text-sm font-body rounded-md transition-all
                  ${blocked ? 'text-muted-foreground/40 cursor-not-allowed line-through' : 'cursor-pointer hover:bg-primary/10'}
                  ${selected ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : ''}
                  ${inRange ? 'bg-primary/15 text-primary' : ''}
                  ${!blocked && !selected && !inRange ? 'text-foreground' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderMonth(currentMonth)}
        {renderMonth(addMonths(currentMonth, 1))}
      </div>
    </div>
  );
}