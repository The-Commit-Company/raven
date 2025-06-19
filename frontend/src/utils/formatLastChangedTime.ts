export const formatLastChangedTime = (date: string): string => {
  const seconds: number = Math.floor(
    (new Date().getTime() - new Date(Date.parse(date.replace(' ', 'T'))).getTime()) / 1000
  )
  let interval: number = Math.floor(seconds / 31536000)

  if (interval > 1) {
    return interval + ' năm trước'
  }
  interval = Math.floor(seconds / 2592000)
  if (interval > 1) {
    return interval + ' tháng trước'
  }
  interval = Math.floor(seconds / 86400)
  if (interval > 1) {
    return interval + ' ngày trước'
  } else if (interval === 1) {
    return '1 ngày trước'
  }
  interval = Math.floor(seconds / 3600)
  if (interval > 1) {
    return interval + ' giờ trước'
  } else if (interval === 1) {
    return '1 giờ trước'
  }
  interval = Math.floor(seconds / 60)
  if (interval > 1) {
    return interval + ' phút trước'
  } else if (interval === 1) {
    return '1 phút trước'
  }
  return Math.floor(seconds) + ' giây trước'
}
