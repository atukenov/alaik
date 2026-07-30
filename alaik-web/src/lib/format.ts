import type { CSSProperties } from 'react';
import type { EventType } from './types';
import type { Lang } from '../store/ui';

const tints: Record<EventType, string> = {
  Wedding: '#efd9d2',
  Birthday: '#f6ddd0',
  BabyShower: '#f2e7d3',
  Housewarming: '#ecdccb',
  Custom: '#edddd0',
};

export function tint(type: EventType): string {
  return tints[type];
}

// Striped placeholder cover for a given event type.
export function coverStyle(type: EventType): CSSProperties {
  return {
    backgroundImage: `repeating-linear-gradient(135deg, rgba(0,0,0,.04) 0 10px, transparent 10px 20px), linear-gradient(0deg, ${tints[type]}, ${tints[type]})`,
  };
}

export function formatPrice(
  price: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (price == null) return '';
  const n = new Intl.NumberFormat('ru-RU').format(price);
  const symbol = currency === 'KZT' || !currency ? '₸' : currency;
  return `${n} ${symbol}`;
}

const months: Record<Lang, string[]> = {
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  kz: ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

export function formatDate(iso: string | null, lang: Lang, short = false): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  const day = d.getDate();
  const m = months[lang][d.getMonth()];
  if (short) {
    const m3 = m.slice(0, 3);
    return `${day} ${m3}`;
  }
  return lang === 'en' ? `${m} ${day}, ${d.getFullYear()}` : `${day} ${m} ${d.getFullYear()}`;
}
