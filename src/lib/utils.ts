import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function paginate(page: number, total: number, separator = "-") {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const result: Set<number> = new Set()

  result.add(0)
  result.add(1)

  for (let i = page - 1; i <= page + 1; i++) {
    if (i >= 1 && i <= total) result.add(i)
  }

  result.add(total - 1)
  result.add(total)

  const nums: number[] = Array.from(result).sort((a, b) => a - b)

  const out = []
  for (let i = 0; i < nums.length - 1; i++) {
    if (i > 0 && nums[i] - nums[i - 1] > 1) {
      out.push(separator)
    }
    out.push(nums[i])
  }

  return out
}
