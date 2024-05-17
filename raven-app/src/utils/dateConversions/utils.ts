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