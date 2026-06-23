import { useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/tabs"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { useUser } from "@hooks/useUser"
import { parseReactions } from "../../renderers/MessageReactions"
import type { ReactionObject } from "@raven/types/common/ChatStream"
import type { Message } from "@raven/types/common/Message"
import type { UserData } from "@db"
import _ from "@lib/translate"

/** Renders one reaction's glyph — a custom emoji image, or the Apple-set native emoji. */
const EmojiGlyph = ({ reaction }: { reaction: ReactionObject }) =>
    reaction.is_custom ? (
        <img src={reaction.reaction} alt={reaction.emoji_name} loading="lazy" className="h-4 w-4 object-contain" />
    ) : (
        <em-emoji native={reaction.reaction} set="apple" size="1.1em" fallback={reaction.reaction} />
    )

/**
 * One reactor row: avatar + name, resolved reactively from the users store (so a profile /
 * photo update reflects live). `trailing` shows which emoji(s) they used in the "All" tab.
 * Falls back to the raw id while the user isn't cached.
 */
const ReactorRow = ({ userID, trailing }: { userID: string; trailing?: React.ReactNode }) => {
    const user = useUser(userID)
    const display = user ?? ({ name: userID, full_name: userID } as UserData)
    return (
        <div className="flex items-center gap-2 py-2">
            <UserAvatar user={display} size="sm" showStatusIndicator={false} />
            <span className="flex-1 truncate text-sm text-ink-gray-8">{display.full_name || display.name}</span>
            {trailing}
        </div>
    )
}

/**
 * "View reactions" — who reacted, grouped by emoji. The reaction blob already carries the
 * reactor ids (no fetch); only the avatars/names are resolved from the users store. An
 * "All" tab lists each reactor once with the emoji(s) they used.
 */
export const ReactionsDialog = ({ message, open, onClose }: { message: Message | null; open: boolean; onClose: () => void }) => {
    const reactions = useMemo(() => parseReactions(message?.message_reactions), [message?.message_reactions])

    // userID → the reactions they used (for the "All" tab + its unique-reactor count).
    const reactorsByUser = useMemo(() => {
        const map = new Map<string, ReactionObject[]>()
        for (const reaction of reactions) {
            for (const userID of reaction.users) {
                const list = map.get(userID) ?? []
                list.push(reaction)
                map.set(userID, list)
            }
        }
        return map
    }, [reactions])

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{_("Reactions")}</DialogTitle>
                </DialogHeader>
                {reactions.length > 0 && (
                    <Tabs defaultValue="all">
                        <TabsList className="flex w-full justify-start overflow-x-auto">
                            <TabsTrigger value="all" className="gap-2">
                                {_("All")} <span className="text-ink-gray-5 text-sm-regular">{reactorsByUser.size}</span>
                            </TabsTrigger>
                            {reactions.map((reaction) => (
                                <TabsTrigger key={reaction.emoji_name} value={reaction.emoji_name} className="gap-2">
                                    <EmojiGlyph reaction={reaction} />
                                    <span className="text-ink-gray-5 text-sm-regular">{reaction.count}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="all" className="max-h-80 min-h-64 overflow-y-auto">
                            {[...reactorsByUser].map(([userID, used]) => (
                                <ReactorRow
                                    key={userID}
                                    userID={userID}
                                    trailing={
                                        <span className="flex shrink-0 items-center gap-1">
                                            {used.map((reaction) => (
                                                <EmojiGlyph key={reaction.emoji_name} reaction={reaction} />
                                            ))}
                                        </span>
                                    }
                                />
                            ))}
                        </TabsContent>

                        {reactions.map((reaction) => (
                            <TabsContent key={reaction.emoji_name} value={reaction.emoji_name} className="max-h-80 min-h-64 overflow-y-auto">
                                {reaction.users.map((userID) => (
                                    <ReactorRow key={userID} userID={userID} />
                                ))}
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    )
}
