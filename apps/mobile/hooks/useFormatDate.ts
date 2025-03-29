import { useMemo } from 'react'
import * as dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import useSiteContext from './useSiteContext'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)

type DateFormatOptions = 'Do MMMM YYYY, hh:mm A' | 'Do MMMM [at] hh:mm A' | 'hh:mm A' | 'hh:mm'

/**
 * Hook to format a date string based on the format option
 * @param timestamp - The date string to format
 * @param format - The format option to use
 * @returns The formatted date string
 */
const useDateFormat = (timestamp: string, format: DateFormatOptions | string = 'Do MMMM YYYY, hh:mm A') => {

  const siteInformation = useSiteContext()

  const SYSTEM_TIMEZONE = siteInformation?.system_timezone ?? 'Asia/Kolkata'

  const formattedDate = useMemo(() => {

    return dayjs.tz(timestamp, SYSTEM_TIMEZONE).local().format(format)

  }, [timestamp, format, SYSTEM_TIMEZONE])

  return formattedDate

}

export default useDateFormat