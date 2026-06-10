import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { RavenPoll } from "@raven/types/RavenMessaging/RavenPoll";
import type { UserData } from "@db";

export type DrawerType = '' | 'members' | 'files' | 'pins' | 'links' | 'threads' | 'info'

export const channelDrawerAtom = atomFamily((_channelID: string) => atom<DrawerType>(''))

/** DM conversation drawer: files, links, or threads. Separate from channel drawer to avoid reusing channel code. */
export const dmDrawerAtom = atomFamily((_dmChannelId: string) => atom<'' | 'files' | 'links' | 'threads'>(''))

export type PollDrawerData = {
    user: UserData
    poll: RavenPoll
    currentUserVotes: Array<{ option: string }>
} | null

export const pollDrawerAtom = atomFamily((_channelID: string) => atom<PollDrawerData>(null))