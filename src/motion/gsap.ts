/**
 * Единственная точка регистрации плагинов GSAP. Компоненты берут gsap, ScrollTrigger,
 * SplitText и useGSAP отсюда, а не из пакетов напрямую: регистрация — один раз.
 * Модуль безопасен для предсборки: плагины не трогают window до вызова.
 */
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export { gsap, ScrollTrigger, SplitText, useGSAP };
