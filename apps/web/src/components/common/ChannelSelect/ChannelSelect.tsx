import { useMemo, useRef, useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectSeparator,
    SelectLabel,
    SelectGroup,
} from "@components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/ui/command"
import { Button } from "@components/ui/button"
import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { Label } from "@components/ui/label"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "@lib/utils"
import type { ChannelListItem, DMChannelListItem } from "@raven/types/common/ChannelListItem"
import type { UserFields } from "@raven/types/common/UserFields"

export type ChannelSelectItem = ChannelListItem | DMChannelListItem

interface ChannelSelectProps {
    /** Regular channels */
    channels: ChannelListItem[]
    /** DM channels */
    dmChannels: DMChannelListItem[]
    /** Users for resolving DM peer names/avatars (optional; falls back to peer_user_id when empty) */
    availableUsers?: UserFields[]
    value: string
    onValueChange: (value: string) => void
    /** Placeholder when nothing selected */
    placeholder?: string
    /** Exclude this channel ID from the list */
    excludeChannelId?: string | null
    /** Show "In Any Channel" / "All" option */
    allowAll?: boolean
    allLabel?: string
    /** Size variant */
    size?: "sm" | "default"
    /** Dropdown content width */
    dropdownClassName?: string
    /** Show label above */
    showLabel?: boolean
    label?: string
    /** Use searchable combobox (better for long lists) */
    searchable?: boolean
}

function getChannelLabel(
    ch: ChannelSelectItem,
    availableUsers: UserFields[]
): string {
    if (ch.is_direct_message === 1) {
        const dm = ch as DMChannelListItem
        const peer = availableUsers.find((u) => u.name === dm.peer_user_id)
        return peer?.full_name ?? dm.peer_user_id ?? ch.name
    }
    return ch.channel_name ?? ch.name ?? ""
}

function ChannelOption({
    channel,
    availableUsers,
}: {
    channel: ChannelSelectItem
    availableUsers: UserFields[]
}) {
    const isDM = channel.is_direct_message === 1
    const dmChannel = channel as DMChannelListItem
    const peerUser = availableUsers.find((u) => u.name === dmChannel.peer_user_id)
    const label = getChannelLabel(channel, availableUsers)

    return (
        <div className="flex items-center gap-2">
            {isDM ? (
                peerUser ? (
                    <UserAvatar
                        user={peerUser}
                        size="sm"
                        showStatusIndicator={false}
                        showBotIndicator={false}
                    />
                ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-bold text-muted-foreground">
                        ?
                    </span>
                )
            ) : (
                <ChannelIcon
                    type={(channel as ChannelListItem).type as "Public" | "Private" | "Open"}
                    className="h-4 w-4"
                />
            )}
            <span className="truncate pl-0.5">{label}</span>
        </div>
    )
}

export function ChannelSelect({
    channels,
    dmChannels,
    availableUsers,
    value,
    onValueChange,
    placeholder = "Select channel",
    excludeChannelId,
    allowAll = false,
    allLabel = "In Any Channel",
    size = "default",
    dropdownClassName,
    showLabel = false,
    label = "Channel",
    searchable = false,
}: ChannelSelectProps) {
    const filteredChannels = useMemo(
        () => channels.filter((c) => c.name !== excludeChannelId),
        [channels, excludeChannelId]
    )
    const filteredDms = useMemo(
        () => dmChannels.filter((d) => d.name !== excludeChannelId),
        [dmChannels, excludeChannelId]
    )

    const selectedChannel = useMemo(() => {
        if (!value || value === "all") return null
        const ch = filteredChannels.find((c) => c.name === value)
        if (ch) return ch
        return filteredDms.find((d) => d.name === value) ?? null
    }, [value, filteredChannels, filteredDms])

    const resolvedAvailableUsers = availableUsers ?? []

    const triggerSizeClass = size === "sm" ? "!h-7 !py-1 text-xs [&>span]:!px-0" : "!h-9 !py-2 [&>span]:!px-0"
    const paddingClass =
        selectedChannel && value !== "all"
            ? size === "sm"
                ? "!px-2"
                : "!px-3"
            : size === "sm"
              ? "!px-3"
              : "!px-4"

    const content = (
        <>
            {allowAll && (
                <SelectItem value="all" textValue={allLabel}>
                    {allLabel}
                </SelectItem>
            )}
            <SelectGroup>
                <SelectLabel className="text-xs text-muted-foreground/80 px-2 py-1.5">
                    Channels
                </SelectLabel>
                {filteredChannels.map((ch) => (
                    <SelectItem
                        key={ch.name}
                        value={ch.name}
                        textValue={getChannelLabel(ch, resolvedAvailableUsers)}
                    >
                        <ChannelOption channel={ch} availableUsers={resolvedAvailableUsers} />
                    </SelectItem>
                ))}
            </SelectGroup>
            {filteredDms.length > 0 && (
                <>
                    <SelectSeparator />
                    <SelectGroup>
                        <SelectLabel className="text-xs text-muted-foreground/80 px-2 py-1.5">
                            Direct Messages
                        </SelectLabel>
                        {filteredDms.map((dm) => (
                            <SelectItem
                                key={dm.name}
                                value={dm.name}
                                textValue={getChannelLabel(dm, resolvedAvailableUsers)}
                            >
                                <ChannelOption channel={dm} availableUsers={resolvedAvailableUsers} />
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </>
            )}
        </>
    )

    const triggerContent = selectedChannel && value !== "all" ? (
        <div className="flex items-center gap-1">
            <ChannelOption channel={selectedChannel} availableUsers={resolvedAvailableUsers} />
        </div>
    ) : (
        <SelectValue placeholder={placeholder} className="pl-1" />
    )

    if (searchable) {
        return (
            <ChannelSelectCombobox
                channels={filteredChannels}
                dmChannels={filteredDms}
                availableUsers={resolvedAvailableUsers}
                value={value}
                onValueChange={onValueChange}
                placeholder={placeholder}
                allowAll={allowAll}
                allLabel={allLabel}
                showLabel={showLabel}
                label={label}
                dropdownClassName={dropdownClassName}
                triggerSizeClass={triggerSizeClass}
                paddingClass={paddingClass}
            />
        )
    }

    return (
        <div className="shrink-0">
            {showLabel && (
                <Label className="mb-1 block text-xs text-muted-foreground">{label}</Label>
            )}
            <Select value={value || (allowAll ? "all" : "")} onValueChange={onValueChange}>
                <SelectTrigger
                    className={cn(
                        "w-fit [&>span]:text-inherit",
                        triggerSizeClass,
                        paddingClass,
                        dropdownClassName
                    )}
                >
                    {triggerContent}
                </SelectTrigger>
                <SelectContent className={dropdownClassName || "w-full"}>
                    {content}
                </SelectContent>
            </Select>
        </div>
    )
}

/** Searchable combobox variant */
function ChannelSelectCombobox({
    channels,
    dmChannels,
    availableUsers,
    value,
    onValueChange,
    placeholder,
    allowAll,
    allLabel,
    showLabel,
    label,
    dropdownClassName,
    triggerSizeClass,
    paddingClass,
}: Omit<ChannelSelectProps, "excludeChannelId" | "size"> & {
    triggerSizeClass: string
    paddingClass: string
}) {
    const resolvedAvailableUsers = availableUsers ?? []
    const [open, setOpen] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const selectedChannel = useMemo(() => {
        if (!value || value === "all") return null
        const ch = channels.find((c) => c.name === value)
        if (ch) return ch
        return dmChannels.find((d) => d.name === value) ?? null
    }, [value, channels, dmChannels])

    const triggerContent = selectedChannel && value !== "all" ? (
        <div className="flex items-center gap-1">
            <ChannelOption channel={selectedChannel} availableUsers={resolvedAvailableUsers} />
        </div>
    ) : (
        <span className="text-muted-foreground">{placeholder}</span>
    )

    return (
        <div className="shrink-0">
            {showLabel && (
                <Label className="mb-1 block text-xs text-muted-foreground">{label}</Label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between font-normal",
                            triggerSizeClass,
                            paddingClass,
                            "h-auto min-h-0"
                        )}
                    >
                        {triggerContent}
                        <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    side="bottom"
                    align="start"
                    className={cn("w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) p-0", dropdownClassName)}
                >
                    <Command shouldFilter={true}>
                        <CommandInput placeholder="Search channels and DMs..." />
                        <div
                            ref={scrollRef}
                            className="h-[200px] overflow-y-auto overflow-x-hidden"
                            onWheel={(e) => {
                                const el = scrollRef.current
                                if (el) {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    el.scrollTop += e.deltaY
                                }
                            }}
                        >
                                <CommandList className="max-h-none overflow-visible">
                            <CommandEmpty>No channels or DMs found.</CommandEmpty>
                            {allowAll && (
                                <CommandGroup>
                                    <CommandItem value="all" onSelect={() => { onValueChange("all"); setOpen(false); }}>
                                        {allLabel}
                                    </CommandItem>
                                </CommandGroup>
                            )}
                            <CommandGroup heading="Channels">
                                {channels.map((ch) => (
                                    <CommandItem
                                        key={ch.name}
                                        value={`${ch.name} ${getChannelLabel(ch, resolvedAvailableUsers)}`}
                                        onSelect={() => {
                                            onValueChange(ch.name)
                                            setOpen(false)
                                        }}
                                    >
                                        <ChannelOption channel={ch} availableUsers={resolvedAvailableUsers} />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            {dmChannels.length > 0 && (
                                <CommandGroup heading="Direct Messages">
                                    {dmChannels.map((dm) => (
                                        <CommandItem
                                            key={dm.name}
                                            value={`${dm.name} ${getChannelLabel(dm, resolvedAvailableUsers)}`}
                                            onSelect={() => {
                                                onValueChange(dm.name)
                                                setOpen(false)
                                            }}
                                        >
                                            <ChannelOption channel={dm} availableUsers={resolvedAvailableUsers} />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                                </CommandList>
                        </div>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
