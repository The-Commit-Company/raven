import { ChannelSearch } from "./ChannelSearch"
import { FileSearch } from "./FileSearch"
import { MessageSearch } from "./MessageSearch"
import { Dialog, Flex, Tabs, Box } from "@radix-ui/themes"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { useBoolean } from "@/hooks/useBoolean"

interface GlobalSearchModalProps {
    isOpen: boolean,
    onClose: () => void,
    tabIndex: number,
    input: string,
    fromFilter?: string,
    inFilter?: string,
    withFilter?: string,
    onCommandPaletteClose?: () => void
}

export default function GlobalSearch({ isOpen, onClose, tabIndex, input, fromFilter, inFilter, withFilter, onCommandPaletteClose }: GlobalSearchModalProps) {

    const [isOpenMyChannels, { toggle: onToggleMyChannels }] = useBoolean()
    const [isSaved, { toggle: onToggleSaved }] = useBoolean()

    const onCloseAll = () => {
        onClose()
        onCommandPaletteClose && onCommandPaletteClose()
    }
    const onOpenChange = (open: boolean) => {
        if (!open) {
            onCloseAll()
        }
    }


    return (
        <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
            <Dialog.Content className={DIALOG_CONTENT_CLASS} style={{
                width: '80vw',
                maxWidth: '80vw'
            }}>
                <Dialog.Title>Search Results</Dialog.Title>
                <Flex direction='column' gap='2'>
                    <Tabs.Root defaultValue={tabIndex.toString()}>
                        <Tabs.List>
                            <Tabs.Trigger value="0">Messages</Tabs.Trigger>
                            <Tabs.Trigger value="1">Files</Tabs.Trigger>
                            <Tabs.Trigger value="2">Channels</Tabs.Trigger>
                        </Tabs.List>
                        <Box pt="3" pb="2">
                            <Tabs.Content value="0">
                                {onCommandPaletteClose && <MessageSearch onToggleMyChannels={onToggleMyChannels} isOpenMyChannels={isOpenMyChannels} onToggleSaved={onToggleSaved} isSaved={isSaved} input={input} fromFilter={fromFilter} inFilter={inFilter} withFilter={withFilter} onCommandPaletteClose={onCommandPaletteClose} onClose={onClose} />}
                            </Tabs.Content>
                            <Tabs.Content value="1">
                                <FileSearch onToggleMyChannels={onToggleMyChannels} isOpenMyChannels={isOpenMyChannels} onToggleSaved={onToggleSaved} isSaved={isSaved} input={input} fromFilter={fromFilter} inFilter={inFilter} withFilter={withFilter} />
                            </Tabs.Content>
                            <Tabs.Content value="2">
                                <ChannelSearch onToggleMyChannels={onToggleMyChannels} isOpenMyChannels={isOpenMyChannels} input={input} onClose={onCloseAll} />
                            </Tabs.Content>
                        </Box>
                    </Tabs.Root>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    )
}

interface Option {
    label: string,
    value: string
}

export const dateOption: Option[] = [
    { label: "Today", value: getDateString(0) },
    { label: "Yesterday", value: getDateString(-1) },
    { label: "Last 7 days", value: getDateString(-6) },
    { label: "Last 30 days", value: getDateString(-29) },
    { label: "Last three months", value: getDateString(-89) },
    { label: "Last 12 months", value: getDateString(-364) }
]

function getDateString(offset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day} 00:00:00`;
}