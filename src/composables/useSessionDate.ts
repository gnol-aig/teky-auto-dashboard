import type { SessionDateTime } from '@/types'

const weekday: Record<number, string> = {
  0: 'Thu 2',
  1: 'Thu 3',
  2: 'Thu 4',
  3: 'Thu 5',
  4: 'Thu 6',
  5: 'Thu 7',
  6: 'Chu nhat',
}

const pad = (value: number) => String(value).padStart(2, '0')

export function useSessionDate() {
  const formatDate = (date: Date) => {
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`
  }

  const formatDateFromObject = (datetime: Pick<SessionDateTime, 'day' | 'month' | 'year'>) => {
    return `${pad(datetime.day)}-${pad(datetime.month)}-${datetime.year}`
  }

  const formatInputDate = (dateString: string) => {
    if (!dateString) return ''

    const parts = dateString.split('-')
    const year = parts[0]
    const month = parts[1]
    const day = parts[2]

    if (!year || !month || !day) return ''

    return `${day}-${month}-${year}`
  }

  const formatTime = (timeInMinutes: number) => {
    const hours = Math.trunc(timeInMinutes / 60)
    const minutes = timeInMinutes % 60

    return `${pad(hours)}:${pad(minutes)}`
  }

  const formatSessionDateTime = (datetime: SessionDateTime) => {
    return `${weekday[datetime.weekday] ?? ''} ${formatDateFromObject(datetime)} ${formatTime(
      datetime.start_time,
    )} - ${formatTime(datetime.end_time)}`
  }

  const getPresetDateRange = (filterType: 'today' | 'month' | 'range') => {
    const now = new Date()

    if (filterType === 'today') {
      const today = formatDate(now)
      return { from: today, to: today }
    }

    if (filterType === 'month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return { from: formatDate(first), to: formatDate(last) }
    }

    return { from: '', to: '' }
  }

  return {
    formatDate,
    formatDateFromObject,
    formatInputDate,
    formatSessionDateTime,
    formatTime,
    getPresetDateRange,
    weekday,
  }
}
