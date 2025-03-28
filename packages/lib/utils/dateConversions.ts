import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);

export const SYSTEM_TIMEZONE = 'UTC'

export const formatDate = (date: string) => {
    const parsedDate = dayjs(date).local()
    const today = dayjs()
    const yesterday = dayjs().subtract(1, 'day')

    let formattedDateString = ""

    // If the date is today, return "Today"
    // If the date is yesterday, return "Yesterday"
    // Otherwise, return the date in the format "MMM Do" if the date is within the current year
    // Otherwise, return the date in the format "MMM Do, YYYY"

    if (parsedDate.isSame(today, 'date')) {
        formattedDateString = "Today"
    } else if (parsedDate.isSame(yesterday, 'date')) {
        formattedDateString = "Yesterday"
    } else if (parsedDate.isSame(today, 'year')) {
        formattedDateString = parsedDate.format('MMM Do')
    } else {
        formattedDateString = parsedDate.format('MMM Do, YYYY')
    }

    return formattedDateString
}

export const formatDateAndTime = (date: string) => {

    if (!date) {
        return ''
    }

    const dateObj = dayjs(date)
    if (!dateObj.isValid()) {
        return date
    }

    const time = dateObj.format('hh:mm A')
    const formattedDate = dateObj.format('MMM Do, YYYY')
    return `${formattedDate}, ${time}`
}

export const getDateObject = (timestamp: string): dayjs.Dayjs => {
    return dayjs.tz(timestamp, SYSTEM_TIMEZONE).local()
}

export const getTimePassed = (date: string) => {
    return getDateObject(date).fromNow()
}

export const getStandardDateFormat = (inputDate: string | Date = new Date()): string => {
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of the year

    return `${month}/${day}/${year}`;
};