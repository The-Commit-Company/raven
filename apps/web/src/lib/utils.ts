import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Espresso per-weight type classes — `text-<size>-<weight>` and the paragraph
// variant `text-p-<size>-<weight>` (e.g. text-base-medium, text-4xl-semibold,
// text-p-sm-bold). Without this, tailwind-merge classifies them as text-color
// and drops them when a `text-ink-*` color sits in the same cn() call.
const isTextStyleClass = (value: string) =>
  /^(p-)?[0-9a-z]+-(medium|semibold|bold|black)$/.test(value)

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "p-base", "p-2xs", "p-xs", "p-sm", "p-lg", "p-xl", "p-2xl", "p-3xl",
            isTextStyleClass,
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
