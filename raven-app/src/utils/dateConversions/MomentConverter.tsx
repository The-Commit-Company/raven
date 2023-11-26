import { USER_DATE_FORMAT, convertFrappeTimestampToUserTimezone } from './utils'

const MomentConverter = ({ date, format = USER_DATE_FORMAT }: { format?: string, date: string }) => {

    return convertFrappeTimestampToUserTimezone(date).format(format)
}

export default MomentConverter