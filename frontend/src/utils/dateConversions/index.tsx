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

interface HourMinuteAmPmProps extends Props {
    amPm?: boolean
}
/**
 *
 * @returns JSX Element of the format hh:mm AM/PM
 * @example 08:15 PM or 12:00 AM
 */
export const HourMinuteAmPm = ({ amPm = true, date }: HourMinuteAmPmProps) => {

    return getDateObject(date).format(amPm ? "hh:mm A" : "hh:mm")
}

export const DateMonthAtHourMinuteAmPm = (props: Props) => {

    return getDateObject(props.date).format("Do MMMM [at] hh:mm A")
}