import type { Plan } from './types'

export interface Usage {
  storageGB: string
  maxStorageGB: number
  storagePercent: number
}

export function computeUsage(plan: Plan, storageUsedBytes: number): Usage {
  const maxStorageGB = plan === 'free' ? 5 : 100
  const storageGB = (storageUsedBytes / (1024 ** 3)).toFixed(2)
  const storagePercent = Math.min(100, (storageUsedBytes / (maxStorageGB * 1024 ** 3)) * 100)
  return { storageGB, maxStorageGB, storagePercent }
}
