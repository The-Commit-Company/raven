import * as dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import advancedFormat from 'dayjs/plugin/advancedFormat'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)

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

    return dayjs.tz(timestamp, SYSTEM_TIMEZONE)
}

/**
 * Returns a date in the standard format that the user has set in their preferences
 * @param date
 * @returns
 */
export const toStandardDate = (date: string) => {

    return getDateObject(date).format("DD/MM/YYYY")
}

/**
 * Returns a date in DD MMM YYYY format
 */
export const toDateMonthYear = (date: string) => {

    return getDateObject(date).format("Do MMMM YYYY")
}

/**
 *
 * @returns string in the format hh:mm AM/PM
 * @example 08:15 PM or 12:00 AM
 */
export const toHourMinuteAmPm = (date: string, amPm: boolean = true) => {

    return getDateObject(date).format(amPm ? "hh:mm A" : "hh:mm")
}

export const toDateMonthAtHourMinuteAmPm = (date: string) => {

    return getDateObject(date).format("Do MMMM [at] hh:mm A")
}