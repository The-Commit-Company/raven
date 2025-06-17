import { atom } from 'jotai'

export const labelListAtom = atom<{ label_id: string; label: string }[]>([])
export const refreshLabelListAtom = atom(0)
