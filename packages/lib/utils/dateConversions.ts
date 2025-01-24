import dayjs from 'dayjs';

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
    const time = dayjs(date).format('hh:mm A')
    const formattedDate = formatDate(date)
    return `${formattedDate}, ${time}`
}