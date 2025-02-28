import { getDateObject } from "./utils";

interface Props {
    date: string;
}
/**
 * Returns a date in the standard format that the user has set in their preferences
 * @param props
 * @returns
 */
export const StandardDate = (props: Props) => {

    return getDateObject(props.date).format("DD/MM/YYYY")
}

/**
 * Returns a date in DD MMM YYYY format
 */
export const DateMonthYear = (props: Props) => {

    return getDateObject(props.date).format("Do MMMM YYYY")
}

export const DateMonthAtHourMinuteAmPm = (props: Props) => {

    return getDateObject(props.date).format("Do MMMM [at] hh:mm A")
}

export const getTimePassed = (date: string) => {

    return getDateObject(date).fromNow()
}