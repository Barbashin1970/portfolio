/**
 * Фильтр-«таблетки»: группа кнопок с aria-pressed (UC-3). Своя замена toggle-group shadcn:
 * та на Radix тянула пять пакетов, около 10 КБ gzip, ради восьми кнопок (Р-29).
 * Вид — как в макете: выбранная кнопка инвертирована.
 */
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function FilterChips({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {children}
    </div>
  );
}

export function FilterChip({ pressed, className, ...props }: ComponentProps<'button'> & { pressed: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        'inline-flex h-11 items-center gap-1.5 rounded-full border border-border-strong px-4 font-text text-[15px] font-medium text-text',
        'cursor-pointer transition-[background-color,color,border-color] duration-(--dur-fast) ease-(--ease-out)',
        'hover:bg-glass aria-pressed:border-text aria-pressed:bg-text aria-pressed:text-bg',
        className,
      )}
      {...props}
    />
  );
}
