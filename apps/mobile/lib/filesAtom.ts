import { atom } from "jotai";
import { CustomFile } from "@raven/types/common/File";

export const filesAtom = atom<CustomFile[]>([])