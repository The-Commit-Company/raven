import { atom } from "jotai";
import { CustomFile } from "@raven/types/common/File";
import { atomFamily } from "jotai/utils";
import { Message } from "@raven/types/common/Message";

export const filesAtomFamily = atomFamily((id: string) => atom<CustomFile[]>([]))

export const selectedReplyMessageAtomFamily = atomFamily((id: string) => atom<Message | null>(null))

export const messageActionsSelectedMessageAtom = atomFamily((t: 'channel' | 'thread') => atom<Message | null>(null))