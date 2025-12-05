import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

export const channelDrawerAtom = atomFamily((_channelID: string) => atom<'' | 'members' | 'files' | 'pins' | 'links' | 'threads' | 'info'>(''))