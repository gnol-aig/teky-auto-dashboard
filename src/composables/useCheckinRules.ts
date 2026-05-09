import type { Checkin, SessionDateTime } from '@/types'

const toMinutes = (hour: number, minute: number) => hour * 60 + minute
const EARLY_CHECKIN_WINDOW_MINUTES = 15

const isSameSessionDay = (sessionDatetime: SessionDateTime, now: Date) => {
  return (
    now.getFullYear() === sessionDatetime.year &&
    now.getMonth() + 1 === sessionDatetime.month &&
    now.getDate() === sessionDatetime.day
  )
}

const isWithinSessionWindow = (sessionDatetime: SessionDateTime, now: Date) => {
  if (!isSameSessionDay(sessionDatetime, now)) return false

  const currentMinutes = toMinutes(now.getHours(), now.getMinutes())
  return (
    currentMinutes >= sessionDatetime.start_time - EARLY_CHECKIN_WINDOW_MINUTES &&
    currentMinutes <= sessionDatetime.end_time
  )
}

export function useCheckinRules() {
  const canCheckinNow = (checkin: Checkin | null, sessionDatetime: SessionDateTime | null, now = new Date()) => {
    if (!checkin || !sessionDatetime) return false

    if (checkin.state === 'NO_INFO') {
      return isWithinSessionWindow(sessionDatetime, now)
    }

    return false
  }

  const getCheckinButtonLabel = (
    checkin: Checkin | null,
    sessionDatetime: SessionDateTime | null,
    loading = false,
    now = new Date(),
  ) => {
    if (loading) return 'Checking in...'
    if (!checkin) return 'Loading check-in'

    switch (checkin.state) {
      case 'MISSED':
        return 'Missed check-in'
      case 'NO_INFO':
        return canCheckinNow(checkin, sessionDatetime, now) ? 'Check in now' : 'Cannot check in yet'
      case 'INTIME':
        return 'Checked in on time'
      case 'LATE':
        return 'Checked in late'
      default:
        return 'Loading check-in'
    }
  }

  const getCheckinButtonClasses = (
    checkin: Checkin | null,
    sessionDatetime: SessionDateTime | null,
    now = new Date(),
  ) => {
    switch (checkin?.state) {
      case 'MISSED':
        return 'bg-red-50 text-red-700 ring-red-200'
      case 'NO_INFO':
        return canCheckinNow(checkin, sessionDatetime, now)
          ? 'bg-blue-600 text-white ring-blue-600 hover:bg-blue-700'
          : 'bg-slate-100 text-slate-600 ring-slate-200'
      case 'INTIME':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      case 'LATE':
        return 'bg-amber-50 text-amber-700 ring-amber-200'
      default:
        return 'bg-slate-100 text-slate-500 ring-slate-200'
    }
  }

  return {
    canCheckinNow,
    getCheckinButtonClasses,
    getCheckinButtonLabel,
  }
}
