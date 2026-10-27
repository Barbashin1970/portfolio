import { useRef, useState, type MouseEvent } from 'react';
import { Check, Copy, Send, Share2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { FilterChip, FilterChips } from '@/components/ui/filter-chips';
import { CONTACTS, mailShareHref, mailtoHref, telegramHref, telegramShareHref } from '@/data/contacts';
import { useI18n } from '@/i18n/context';
import { answerOf, hasStep, nextStep, REQUEST_MAX, setStepLine, STEPS, stepOptions, type StepId } from '@/lib/request';
import { cn } from '@/lib/utils';
import { gsap, ScrollTrigger, useGSAP } from '@/motion/gsap';
import { CHAT, DUR, EASE, MEDIA } from '@/motion/tokens';

/** Только то, что ставил GSAP: после интро окно снова в руках React и CSS. */
const INTRO_PROPS = 'opacity,visibility,transform';

/**
 * Контакт — чат-конструктор запроса (Р-37, UC-4). Идея промпт-конструктора Олега, доработанная
 * под чат: вопросы по одному, ответы кнопками под окном пишут строки в поле запроса, а текст
 * в поле человек правит прямо на сайте. «Отправить» открывает Telegram с этим текстом в поле
 * ввода, адрес под окном — письмо с ним же. Бота нет, на сервер ничего не уходит, черновик
 * нигде не хранится — сайт по-прежнему не собирает данных (Р-13).
 *
 * Сильный эффект секции — «печатает…» перед приветствием при первом показе окна. При
 * reduced-motion и если окно уже на экране — приветствие сразу.
 */
export function Contact() {
  const { dict } = useI18n();
  const t = dict.contact;
  const scope = useRef<HTMLElement>(null);
  const intro = useRef<gsap.core.Timeline | null>(null);
  const [text, setText] = useState('');
  const [active, setActive] = useState<StepId>(STEPS[0]);
  const [touched, setTouched] = useState(false);
  const [sentText, setSentText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const message = text.trim();
  const done = STEPS.every((step) => hasStep(t, text, step));
  const chosen = answerOf(t, text, active);
  const initials = dict.header.name
    .split(' ')
    .map((word) => word[0])
    .join('');

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        const chat = scope.current?.querySelector<HTMLElement>('.chat');
        if (!chat || chat.getBoundingClientRect().top < window.innerHeight) return undefined;
        const q = gsap.utils.selector(chat);
        const typing = q('.chat-typing');
        const bubbles = q('.chat-greeting, .chat-question');
        gsap.set(bubbles, { autoAlpha: 0, y: CHAT.lift });
        const timeline = gsap
          .timeline({ paused: true, onComplete: () => gsap.set([...typing, ...bubbles], { clearProps: INTRO_PROPS }) })
          .set(typing, { autoAlpha: 1 })
          .to(q('.chat-typing i'), {
            y: -CHAT.dotLift,
            duration: DUR.fast,
            ease: EASE.inOut,
            yoyo: true,
            repeat: CHAT.bounces * 2 - 1,
            stagger: CHAT.dotStagger,
          })
          .set(typing, { autoAlpha: 0 })
          .to(bubbles, { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.out, stagger: CHAT.gap });
        intro.current = timeline;
        const trigger = ScrollTrigger.create({ trigger: chat, start: CHAT.start, once: true, onEnter: () => timeline.play() });
        return () => {
          trigger.kill();
          intro.current = null;
        };
      });
      return () => mm.revert();
    },
    { scope },
  );

  /** Человек начал отвечать: интро доигрывается сразу, дальше окно меняется без ожидания. */
  const touch = () => {
    intro.current?.progress(1);
    setTouched(true);
  };

  const edit = (next: string) => {
    setText(next);
    setCopied(false);
  };

  /** Кнопка меняет строку своего шага; повторное нажатие убирает её. */
  const choose = (option: string) => {
    touch();
    const next = setStepLine(t, text, active, chosen === option ? null : option);
    edit(next);
    if (chosen === option) return;
    const following = nextStep(t, next, active);
    if (following) setActive(following);
  };

  const copy = () => {
    navigator.clipboard.writeText(message).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  return (
    <section ref={scope} id="contact" aria-labelledby="contact-title" className="section-block contact" tabIndex={-1}>
      <div className="container-page contact-grid">
        <div data-reveal>
          <p className="label-mono">{t.eyebrow}</p>
          <h2 id="contact-title" className="section-title">
            {t.title}
          </h2>
          <p className="contact-lead">{t.lead}</p>
        </div>

        <div data-reveal>
          <div className="chat">
            <div className="chat-head">
              <span className="chat-avatar" aria-hidden="true">
                {initials}
              </span>
              <div>
                <p className="chat-name">{dict.header.name}</p>
                <p className="chat-status">Telegram · @{CONTACTS.telegram.handle}</p>
              </div>
            </div>

            <div className="chat-log" role="log" aria-label={t.chat.label}>
              <div className="chat-first">
                <span className="chat-typing" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <p className="chat-msg chat-greeting">{t.chat.greeting}</p>
              </div>
              <p key={done ? 'ready' : active} className={cn('chat-msg chat-question', touched && 'is-new')}>
                {done ? t.chat.ready : t.steps[active].question}
              </p>
              {sentText !== null && (
                <>
                  {sentText && (
                    <div className="chat-own is-new">
                      <p className="chat-msg is-own">{sentText}</p>
                      <p className="chat-meta">{t.chat.opened}</p>
                    </div>
                  )}
                  <p className="chat-note is-new">
                    {sentText ? t.chat.after : t.chat.afterEmpty} {t.chat.fallback}
                  </p>
                </>
              )}
            </div>

            <div className="chat-composer">
              <div className="chat-steps" role="group" aria-label={t.chat.steps}>
                {STEPS.map((step) => {
                  const answered = hasStep(t, text, step);
                  const answer = answerOf(t, text, step);
                  return (
                    <button
                      key={step}
                      type="button"
                      className="chat-step"
                      aria-current={step === active ? 'step' : undefined}
                      onClick={() => {
                        touch();
                        setActive(step);
                      }}
                    >
                      {answered && <Check aria-hidden="true" />}
                      {t.steps[step].tab}
                      {answer && <span className="sr-only">: {stepOptions(t, step)[answer].label}</span>}
                    </button>
                  );
                })}
              </div>
              <FilterChips label={t.steps[active].question} className="chat-chips">
                {Object.entries(stepOptions(t, active)).map(([id, option]) => (
                  <FilterChip
                    key={id}
                    pressed={chosen === id}
                    className="h-auto min-h-11 py-2 text-left leading-snug"
                    onClick={() => choose(id)}
                  >
                    {option.label}
                  </FilterChip>
                ))}
              </FilterChips>

              <div className="chat-input">
                <label htmlFor="chat-text" className="sr-only">
                  {t.chat.field}
                </label>
                <textarea
                  id="chat-text"
                  className="chat-text"
                  value={text}
                  placeholder={t.chat.placeholder}
                  rows={5}
                  maxLength={REQUEST_MAX}
                  data-lenis-prevent
                  onChange={(event) => {
                    touch();
                    edit(event.target.value);
                  }}
                />
                <div className="chat-tools">
                  <Button variant="quiet" size="sm" disabled={!message} onClick={copy}>
                    <Copy />
                    {t.chat.copy}
                  </Button>
                  <span className="chat-copied" role="status">
                    {copied ? t.chat.copied : ''}
                  </span>
                  <Button asChild className="chat-send">
                    <a
                      href={telegramHref(message)}
                      target="_blank"
                      rel="noopener"
                      onClick={() => {
                        touch();
                        setSentText(message);
                      }}
                    >
                      {t.chat.send}
                      <Send />
                      <span className="sr-only"> ({t.chat.sendNote})</span>
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <p className="contact-address">
            <span className="label-mono">{t.emailLabel}</span>{' '}
            <a href={mailtoHref({ subject: t.subject, body: message ? `${message}\n` : t.body })}>{CONTACTS.email}</a>
          </p>
          <Recommend />
        </div>
      </div>
    </section>
  );
}

/**
 * Порекомендовать Олега другу или коллеге (UC-9). Где есть Web Share — телефоны, Safari —
 * системное окно «Поделиться»; где нет — список: Telegram, письмо, «Скопировать». Список —
 * обычный <details>: он раскрывается и без JavaScript.
 */
function Recommend() {
  const { dict } = useI18n();
  const t = dict.contact.recommend;
  const menu = useRef<HTMLDetailsElement>(null);
  const [copied, setCopied] = useState(false);
  const url = CONTACTS.site;

  const share = (event: MouseEvent<HTMLElement>) => {
    if (typeof navigator.share !== 'function') return;
    event.preventDefault();
    navigator.share({ title: dict.meta.title, text: t.text, url }).catch((error: unknown) => {
      // Человек закрыл окно — ничего не делаем; окно недоступно — раскрываем список.
      const closed = error instanceof DOMException && error.name === 'AbortError';
      if (!closed && menu.current) menu.current.open = true;
    });
  };

  const copy = () => {
    navigator.clipboard.writeText(`${t.text}\n${url}`).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  return (
    <div className="recommend">
      <p className="recommend-lead">
        <strong>{t.title}</strong> {t.lead}
      </p>
      <details ref={menu} className="recommend-menu">
        <summary className={buttonVariants({ variant: 'ghost', size: 'sm' })} onClick={share}>
          <Share2 />
          {t.button}
        </summary>
        <ul className="recommend-list">
          <li>
            <a href={telegramShareHref(url, t.text)} target="_blank" rel="noopener">
              {t.telegram}
              <span className="sr-only"> ({dict.card.newTab})</span>
            </a>
          </li>
          <li>
            <a href={mailShareHref(t.subject, `${t.text}\n\n${url}`)}>{t.email}</a>
          </li>
          <li>
            <button type="button" onClick={copy}>
              {t.copy}
            </button>
          </li>
        </ul>
        <span className="chat-copied" role="status">
          {copied ? t.copied : ''}
        </span>
      </details>
    </div>
  );
}
