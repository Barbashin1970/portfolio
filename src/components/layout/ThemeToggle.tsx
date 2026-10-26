import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setTheme, useTheme } from '@/lib/theme';

/** Переключатель светлой темы: подпись постоянная, состояние — в aria-pressed. */
export function ThemeToggle({ label }: { label: string }) {
  const light = useTheme() === 'light';
  return (
    <Button
      type="button"
      variant="quiet"
      size="icon"
      aria-pressed={light}
      title={label}
      onClick={() => setTheme(light ? 'dark' : 'light')}
    >
      {light ? <Moon /> : <Sun />}
      <span className="sr-only">{label}</span>
    </Button>
  );
}
