import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Product, RawProduct } from '@/types.ts';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const update =
  <T>(setState: React.Dispatch<React.SetStateAction<T>>) =>
  (patch: Partial<T>) =>
    setState((prev) => ({ ...prev, ...patch }));

/** 1-based */
export function paginate(page: number, total: number, separator = '...') {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const result = new Set<number>();

  result.add(1);
  result.add(2);

  for (let i = page - 1; i <= page + 1; i++) {
    if (i >= 1 && i <= total) {
      result.add(i);
    }
  }

  result.add(total - 1);
  result.add(total);

  const nums = Array.from(result).sort((a, b) => a - b);

  const out: (number | string)[] = [];

  for (let i = 0; i < nums.length; i++) {
    if (i > 0 && nums[i] - nums[i - 1] > 1) {
      out.push(separator);
    }

    out.push(nums[i]);
  }

  return out;
}

export const emit = <T>(handler: ((p: T) => void) | undefined, payload: T) => {
  handler?.(payload);
};

export function mapRawToProduct(cp: RawProduct): Product {
  return {
    name: cp.name,
    productId: cp.product_id,
    price: parseFloat(cp.price),
    brand: cp.model,
    status: cp.status === '1',
  };
}

export const decodeHtmlString = (text: string) => {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.documentElement.textContent;
};
