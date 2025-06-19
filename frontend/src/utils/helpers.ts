export const YOUTUBE_REGEX =
  /^((?:https?:)?\/\/)?((?:www|m|music)\.)?((?:youtube\.com|youtu.be|youtube-nocookie\.com))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/

export const isValidYoutubeUrl = (url: string | undefined) => {
  if (!url) return
  return url.match(YOUTUBE_REGEX)
}

export const getYoutubeEmbedUrl = (nocookie?: boolean) => {
  return nocookie ? 'https://www.youtube-nocookie.com/embed/' : 'https://www.youtube.com/embed/'
}

export const getEmbedUrlFromYoutubeUrl = (url: string | undefined) => {
  if (!url) return
  // If it's already an embed url, return it
  if (url.includes('/embed/')) {
    return url
  }

  // if is a youtu.be url, get the id after the /
  if (url.includes('youtu.be')) {
    const id = url.split('/').pop()

    if (!id) {
      return null
    }
    return `${getYoutubeEmbedUrl()}${id}`
  }

  const videoIdRegex = /(?:v=|shorts\/)([-\w]+)/gm
  const matches = videoIdRegex.exec(url)

  if (!matches || !matches[1]) {
    return null
  }

  return `${getYoutubeEmbedUrl()}${matches[1]}`
}

export const isValidUrl = (url: string | undefined) => {
  if (!url) return

  try {
    new URL(url)
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
