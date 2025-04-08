import { DayOfWeek } from '@/types'

// Ordered days of week (starting with Monday)
export const DAYS_OF_WEEK = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
]

// Map JavaScript day index (0=Sunday) to our DayOfWeek enum
export const JS_DAY_TO_DAY_OF_WEEK: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
}

// Display names for days of week
export const DAY_NAMES: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Monday',
  [DayOfWeek.TUESDAY]: 'Tuesday',
  [DayOfWeek.WEDNESDAY]: 'Wednesday',
  [DayOfWeek.THURSDAY]: 'Thursday',
  [DayOfWeek.FRIDAY]: 'Friday',
  [DayOfWeek.SATURDAY]: 'Saturday',
  [DayOfWeek.SUNDAY]: 'Sunday',
}

// Sort array of days according to standard week order
export const sortDays = <T extends string>(days: T[]): T[] => {
  return days.sort(
    (a, b) => DAYS_OF_WEEK.indexOf(a as unknown as DayOfWeek) - DAYS_OF_WEEK.indexOf(b as unknown as DayOfWeek),
  )
}

// Format time (hour:minute) in a consistent way
export const formatTime = (hour: number, minute: number): string => {
  const time = new Date()
  time.setHours(hour, minute, 0, 0)
  return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Group availabilities by day
export const groupAvailabilitiesByDay = <T extends { day: string }>(availabilities: T[]): Record<string, T[]> => {
  return (
    availabilities?.reduce(
      (acc, slot) => {
        if (!acc[slot.day]) {
          acc[slot.day] = []
        }
        acc[slot.day].push(slot)
        return acc
      },
      {} as Record<string, T[]>,
    ) || {}
  )
}
