import { atomWithStorage } from "jotai/utils";

export const lastWorkspaceAtom = atomWithStorage<string>('ravenLastWorkspace', '', undefined, {
    getOnInit: true
})
export const lastChannelAtom = atomWithStorage<string>('ravenLastChannel', '', undefined, {
    getOnInit: true
})