import { CONTACTS } from '@/data/contacts';
import { useI18n } from '@/i18n/context';

/** Футер: контакты, GitHub, исходники и лицензия кода. Ник и адрес — те же, что в кнопках (UC-4). */
export function Footer() {
  const { dict } = useI18n();
  const t = dict.footer;
  const external = { target: '_blank', rel: 'noopener' } as const;

  return (
    <footer className="site-footer">
      <div className="container-page footer-inner">
        <p>{t.rights}</p>
        <ul className="footer-links">
          <li>
            <a href={CONTACTS.telegram.url} {...external}>
              Telegram
            </a>
          </li>
          <li>
            <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>
          </li>
          <li>
            <a href={CONTACTS.github} {...external}>
              GitHub
            </a>
          </li>
          <li>
            <a href={CONTACTS.repo} {...external}>
              {t.source}
            </a>
          </li>
          <li>
            <a href={`${CONTACTS.repo}/blob/main/LICENSE`} {...external}>
              {t.license}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
