import { atom } from "jotai";
import { CustomFile } from "@raven/types/common/File";
import { atomFamily } from "jotai/utils";

export const filesAtomFamily = atomFamily((is: string) => atom<CustomFile[]>([]))