import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { securedDecrypt } from "./encrypter-client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* ─── Browser cookie helpers ─── */

/** Read browser cookie by name — returns raw decoded value */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; *)${encodeURIComponent(name)}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/** Check if user appears authenticated based on _U cookie existence */
export function isAuthenticated(): boolean {
  return getCookie("_U") !== null
}

/** Get the readable user payload from _U cookie. */
export function getUserFromCookie(): Record<string, unknown> | null {
  const raw = getCookie("_U")
  if (!raw) return null
  try {
    return securedDecrypt<Record<string, unknown>>(raw)
  } catch {
    return null
  }
}
