/**
 * Parse last_message_details (API may return JSON string) and return a plain-text teaser.
 */
export function getMessageTeaser(lastMessageDetails: unknown, maxLength = 80): string {
    if (!lastMessageDetails) return 'Message'
    try {
        const parsed =
            typeof lastMessageDetails === 'string'
                ? JSON.parse(lastMessageDetails)
                : lastMessageDetails
        const content = parsed?.content
        if (typeof content === 'string') {
            const stripped = content.replace(/<[^>]*>/g, '').trim()
            return stripped.slice(0, maxLength) + (stripped.length > maxLength ? '…' : '')
        }
    } catch {
        // ignore
    }
    return 'Message'
}
