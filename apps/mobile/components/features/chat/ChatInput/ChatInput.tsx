import { Keyboard, ScrollView, View } from "react-native"
import AdditionalInputs from "./AdditionalInputs"
import { Button } from "@components/nativewindui/Button"
import SendIcon from "@assets/icons/SendIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import SendItem from "./SendItem"
import { useAtom, useSetAtom } from 'jotai'
import { CustomFile } from "@raven/types/common/File"
import { useCallback, useState } from "react"
import { filesAtomFamily, selectedReplyMessageAtomFamily } from "@lib/ChatInputUtils"
import { useSendMessage } from "@hooks/useSendMessage"
import { MentionInput, replaceMentionValues } from 'react-native-controlled-mentions'
import markdownit from 'markdown-it'
import useSiteContext from "@hooks/useSiteContext"
import TypingIndicator from "./TypingIndicator"
import { UserMentions } from "./mentions"
import ReplyMessagePreview from "./ReplyMessagePreview"
import AIEventIndicator from "./AIEventIndicator"
import { useTyping } from "@raven/lib/hooks/useTypingIndicator"

interface ChatInputProps {
    channelID: string
    onSendMessage?: () => void
}

const ChatInput = ({ channelID, onSendMessage }: ChatInputProps) => {

    const { onUserType, stopTyping } = useTyping(channelID)

    const [content, setContent] = useState('')

    const siteInfo = useSiteContext()
    const siteID = siteInfo?.sitename ?? ''

    const setSelectedMessage = useSetAtom(selectedReplyMessageAtomFamily(siteID + channelID))

    const cleanupAfterSendingMessage = useCallback(() => {
        setContent('')
        onSendMessage?.()
        stopTyping()
        setSelectedMessage(null)
    }, [onSendMessage, setSelectedMessage, stopTyping])


    const { sendMessage, loading } = useSendMessage(siteID, channelID as string, cleanupAfterSendingMessage)

    const { colors } = useColorScheme()

    const onSend = () => {
        /* Parse the cotent to detect mentions and links.
        For example, when typing "Hey @Mary check this out www.frappe.io"
        The output of the component will be:
        Hey @[Mary](2) check this out www.frappe.io

        We need to detect the mentions and links and replace them with HTML tags before sending the message.
        */

        // Find the mentions in the content and replace them with HTML tags
        const replacedValue = replaceMentionValues(content, (mention) => {
            if (mention.trigger === '@') {
                return `<span data-type="userMention" class="mention" data-id="${mention.id}" data-label="${mention.name}">@${mention.name}</span>`
            }

            if (mention.trigger === '#') {
                return `<span data-type="channelMention" class="mention" data-id="${mention.id}" data-label="${mention.name}">#${mention.name}</span>`
            }

            return mention.original
        })

        // We can allow HTML tags since this is only on the client side. XSS Protection is handled by Frappe on the server side.
        const md = markdownit({ breaks: true, linkify: true, html: true })

        let html = md.render(replacedValue)

        sendMessage(html)
            .then(() => {
                Keyboard.dismiss()
            })
    }


    // This is used by the GIF Picker and additional inputs (doctype link sending etc)
    const onMessageContentSend = (content: string) => {
        sendMessage(content, true)
    }

    const onContentChange = useCallback((text: string) => {
        onUserType()
        setContent(text)
    }, [onUserType])

    return <View className="flex flex-col gap-1 bg-background">
        <AIEventIndicator channelID={channelID} />
        <TypingIndicator channel={channelID} />
        {siteID && <ReplyMessagePreview channelID={channelID} siteID={siteID} />}
        {siteID && <FileScroller channelID={channelID} siteID={siteID} />}

        <View className={`flex-row items-end px-4 pt-2 pb-4 gap-2 
            min-h-16 justify-between`}>
            <AdditionalInputs channelID={channelID} onMessageContentSend={onMessageContentSend} />
            <View className="flex-1  border border-border rounded-lg">

                <MentionInput
                    value={content}
                    multiline
                    placeholderTextColor={colors.grey}
                    placeholder="Type a message..."
                    onChange={onContentChange}
                    partTypes={[
                        {
                            isBottomMentionSuggestionsRender: false,
                            trigger: '@', // Should be a single character like '@' or '#'
                            renderSuggestions: (props) => <UserMentions {...props} channelID={channelID} />,
                            textStyle: { fontWeight: 'medium', color: colors.primary }, // The mention style in the input
                        },
                        {
                            pattern: /(https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.(xn--)?[a-z0-9-]{2,20}\b([-a-zA-Z0-9@:%_\+\[\],.~#?&\/=]*[-a-zA-Z0-9@:%_\+\]~#?&\/=])*/gi,
                            textStyle: { color: colors.primary, fontSize: 16 },
                        },
                    ]}
                    style={{
                        padding: 12,
                        color: colors.foreground,
                        fontSize: 16,
                    }}
                    containerStyle={{
                        position: 'static'
                    }}
                    className="text-base"
                />

            </View>
            <View>
                <Button disabled={loading} size='icon' variant="plain" className="w-8 h-8 rounded-full mb-1" hitSlop={10} onPress={onSend}>
                    <SendIcon fill={colors.primary} />
                </Button>
            </View>
        </View>
    </View>
}

const FileScroller = ({ channelID, siteID }: { channelID: string, siteID: string }) => {

    const [files, setFiles] = useAtom(filesAtomFamily(siteID + channelID))

    const removeFile = (file: CustomFile) => {
        setFiles((prevFiles) => {
            return prevFiles.filter((f) => f.fileID !== file.fileID)
        })
    }

    return <View>
        {files.length > 0 && <View className="px-2 pt-2 border-t border-border">
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-4 justify-start items-start py-2 pr-2">
                    {files.map((file) => (
                        <SendItem
                            key={file.fileID}
                            file={file}
                            numberOfFiles={files.length}
                            removeFile={removeFile}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
        }
    </View>
}


export default ChatInput