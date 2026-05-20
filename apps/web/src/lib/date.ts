import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)
dayjs.extend(relativeTime)

const DEFAULT_TIME_ZONE = 'Asia/Kolkata'

export const SYSTEM_TIMEZONE = window.frappe?.boot?.time_zone?.system || DEFAULT_TIME_ZONE


export const USER_DATE_FORMAT = (window.frappe?.boot?.user?.defaults?.date_format?.toUpperCase() || window.frappe?.boot?.sysdefaults?.date_format?.toUpperCase()
    || 'DD/MM/YYYY')

export const FRAPPE_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
export const FRAPPE_DATE_FORMAT = 'YYYY-MM-DD'
export const FRAPPE_TIME_FORMAT = 'HH:mm:ss'

export const formatDate = (date?: string | Date, format?: string) => {
  if (!format) {
    format = USER_DATE_FORMAT
  }

  if (date) {
    return dayjs(date).format(format)
  }
  return ""
}

export const getDateObject = (timestamp: string): dayjs.Dayjs => {

    return dayjs.tz(timestamp, SYSTEM_TIMEZONE).local()
}

export const convertMillisecondsToReadableDate = (timestampInMilliseconds: number, format: string = 'hh:mm A (Do MMM)') => {

    return dayjs.unix(timestampInMilliseconds / 1000)
}

// Convert a Date object to Frappe datetime format string
export const convertDateToTimeString = (date: Date): string => {
    return dayjs(date).format(FRAPPE_DATETIME_FORMAT)
}

/** Format timestamp for sidebar/list (e.g. "9:34 AM", "Yesterday", or relative like "2 days ago") */
export const formatRelativeDate = (timestamp?: string) => {
  if (!timestamp) return ""
  const d = getDateObject(timestamp)
  if (d.isAfter(dayjs().startOf("day"))) return d.format("h:mm A")
  if (d.isAfter(dayjs().subtract(1, "day").startOf("day"))) return "Yesterday"
  return d.fromNow()
}

/**
 * Utility function to convert a date string to a Date object
 * @param date
 * @returns
 */
export const toDate = (date: string, format: string = "YYYY-MM-DD") => {
  return dayjs(date, format).toDate()
}