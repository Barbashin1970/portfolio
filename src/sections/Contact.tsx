import { Mail, Send } from 'lucide-react';
import { ACCENT_COLORS } from '@/boot';
import ClickSpark from '@/components/fx/ClickSpark';
import { Button } from '@/components/ui/button';
import { CONTACTS, mailtoHref } from '@/data/contacts';
import { useI18n } from '@/i18n/context';
import { useTheme } from '@/lib/theme';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { MEDIA } from '@/motion/tokens';

/**
 * Контакт (UC-4, Р-13): Telegram и письмо с темой и заготовкой; адрес написан буквами.
 * Формы нет. Сильный эффект секции — искры на кнопках, только на десктопе без reduced-motion.
 */
export function Contact() {
  const { dict } = useI18n();
  const t = dict.contact;
  const sparks = useMediaQuery(MEDIA.desktopMotion);
  const theme = useTheme();

  return (
    <section id="contact" aria-labelledby="contact-title" className="section-block contact" tabIndex={-1}>
      <div className="container-page">
        <div className="contact-box glass" data-reveal>
          <p className="label-mono">{t.eyebrow}</p>
          <h2 id="contact-title" className="section-title">
            {t.title}
          </h2>
          <p className="contact-lead">{t.lead}</p>
          <ClickSpark disabled={!sparks} sparkColor={ACCENT_COLORS[theme]} className="contact-sparks">
            <div className="contact-actions">
              <Button asChild>
                <a href={CONTACTS.telegram.url} target="_blank" rel="noopener">
                  <Send />
                  {t.telegram}
                  <span className="sr-only"> ({dict.card.newTab})</span>
                </a>
              </Button>
              <Button asChild variant="ghost">
                <a href={mailtoHref({ subject: t.subject, body: t.body })}>
                  <Mail />
                  {t.email}
                </a>
              </Button>
            </div>
          </ClickSpark>
          <p className="contact-address">
            <span className="label-mono">{t.emailLabel}</span>{' '}
            <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>
          </p>
        </div>
      </div>
    </section>
  );
}
