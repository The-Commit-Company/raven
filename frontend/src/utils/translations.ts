
function format(message: string, replace: any) {
    return message.replace(/{(\d+)}/g, function (match, number) {
        return typeof replace[number] != 'undefined' ? replace[number] : match
    })
}

function translate(message: string, replace?: any, context = null): any {

    // @ts-ignore
    const translatedMessages = window?.frappe?.boot?.__messages || {}

    let translatedMessage: string = ''

    if (context) {
        let key = `${message}:${context}`
        if (translatedMessages[key]) {
            translatedMessage = translatedMessages[key]
        }
    }

    if (!translatedMessage) {
        translatedMessage = translatedMessages[message] || message
    }

    const hasPlaceholders = /{\d+}/.test(message)
    if (!hasPlaceholders) {
        return translatedMessage
    }

    return format(translatedMessage, replace)
}

export const __ = translate