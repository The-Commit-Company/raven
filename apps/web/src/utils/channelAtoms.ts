import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { RavenPoll } from "@raven/types/RavenMessaging/RavenPoll";
import type { UserFields } from "@raven/types/common/UserFields";

export const channelDrawerAtom = atomFamily((_channelID: string) => atom<'' | 'members' | 'files' | 'pins' | 'links' | 'threads' | 'info'>(''))

/** DM conversation drawer: files or links only. Separate from channel drawer to avoid reusing channel code. */
export const dmDrawerAtom = atomFamily((_dmChannelId: string) => atom<'' | 'files' | 'links'>(''))

export type PollDrawerData = {
    user: UserFields
    poll: RavenPoll
    currentUserVotes: Array<{ option: string }>
} | null

export const pollDrawerAtom = atomFamily((_channelID: string) => atom<PollDrawerData>(null))