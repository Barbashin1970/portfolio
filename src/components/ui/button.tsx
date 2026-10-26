/**
 * Кнопка shadcn/ui (реестр new-york-v4), варианты переписаны под токены сайта:
 * основная — акцент с тёмным текстом (--on-accent, PLAN §3), вторая — стекло.
 * Переходы — длительность и easing из motion/tokens.ts через CSS-переменные.
 */
import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-sm font-text font-semibold leading-none',
    'transition-[transform,box-shadow,background-color,color] duration-(--dur-fast) ease-(--ease-out)',
    'disabled:pointer-events-none disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.125em]",
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-on-accent hover:-translate-y-0.5 hover:shadow-[0_10px_40px_-8px_var(--glow)] motion-reduce:hover:translate-y-0',
        ghost: 'glass border-border-strong text-text hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
        quiet: 'text-muted hover:bg-glass hover:text-text',
      },
      size: {
        md: 'h-12 px-6 text-base',
        sm: 'h-10 px-4 text-[15px]',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

function Button({
  className,
  variant = 'primary',
  size = 'md',
  asChild = false,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- так устроен shadcn: варианты нужны ссылкам-кнопкам
export { Button, buttonVariants };
