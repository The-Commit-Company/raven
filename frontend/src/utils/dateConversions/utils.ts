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
//@ts-expect-error
export const SYSTEM_TIMEZONE = window.frappe?.boot?.time_zone?.system || DEFAULT_TIME_ZONE

//@ts-expect-error
export const USER_DATE_FORMAT = (window.frappe?.boot?.user?.defaults?.date_format?.toUpperCase() || window.frappe?.boot?.sysdefaults?.date_format?.toUpperCase()
    || 'DD/MM/YYYY')

export const FRAPPE_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
export const FRAPPE_DATE_FORMAT = 'YYYY-MM-DD'
export const FRAPPE_TIME_FORMAT = 'HH:mm:ss'

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