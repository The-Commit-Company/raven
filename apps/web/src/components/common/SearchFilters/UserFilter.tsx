import { useRef, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@components/ui/command'
import { Button } from '@components/ui/button'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { Label } from '@components/ui/label'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { cn } from '@lib/utils'
import { SearchFilters } from './types'
import { UserData } from "@db"
import _ from '@lib/translate'

interface UserFilterProps {
    filters: SearchFilters
    users: UserData[]
    onValueChange?: (value: string) => void
    showLabel?: boolean
    size?: 'sm'
    dropdownClassName?: string
}

export function UserFilter({ filters, users, onValueChange, showLabel = true, size, dropdownClassName = "w-[240px]" }: UserFilterProps) {
    const [open, setOpen] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    if (!users || users.length === 0) return null

    const value = filters.owner || ''
    const selectedUser = users.find(u => u.name === value)
    const isAllSelected = !value || value === 'all'

    const triggerSizeClass = size === 'sm' ? '!h-7 !py-1 text-xs [&>span]:!px-0' : '!h-9 !py-2 [&>span]:!px-0'
    const hasSelectedAvatar = selectedUser && value !== 'all'
    const paddingClass = (size === 'sm' ? '!px-2' : '!px-3')
    const isCompact = size === 'sm'

    const triggerContent = hasSelectedAvatar ? (
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            <UserAvatar
                user={selectedUser}
                size={isCompact ? 'xs' : 'sm'}
                showStatusIndicator={false}
                showBotIndicator={false}
            />
            <span className="min-w-0 flex-1 truncate text-left">{selectedUser.full_name}</span>
        </div>
    ) : isAllSelected ? (
        <span className="min-w-0 flex-1 truncate text-left">{_("From Anyone")}</span>
    ) : (
        <span className="min-w-0 flex-1 truncate text-left text-ink-gray-4">{_("From")}</span>
    )

    const handleSelect = (v: string) => {
        onValueChange?.(v)
        setOpen(false)
    }

    return (
        <div className="shrink-0">
            {showLabel && <Label className="text-xs text-ink-gray-4 mb-1 block">{_("From")}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-fit justify-between font-normal gap-2 overflow-hidden",
                            triggerSizeClass,
                            paddingClass,
                            dropdownClassName
                        )}
                    >
                        {triggerContent}
                        <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    side="bottom"
                    align="start"
                    className={cn("w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) max-h-100 p-0 flex flex-col", dropdownClassName)}
                >
                    <Command shouldFilter={true} className="flex-1 min-h-0">
                        <CommandInput placeholder={_("Search users...")} className="focus:ring-0 border-0 bg-transparent" />
                        <div
                            ref={scrollRef}
                            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
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
                                <CommandEmpty>{_("No users found.")}</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem value="all" onSelect={() => handleSelect('all')} className="justify-between">
                                        <span>{_("From Anyone")}</span>
                                        {isAllSelected && <CheckIcon className="h-4 w-4 opacity-70" />}
                                    </CommandItem>
                                </CommandGroup>
                                <CommandGroup heading={_("Users")}>
                                    {users.map((user) => (
                                        <CommandItem
                                            key={user.name}
                                            value={`${user.name} ${user.full_name ?? ''}`}
                                            onSelect={() => handleSelect(user.name)}
                                            className="justify-between"
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                                                <UserAvatar
                                                    user={user}
                                                    size="sm"
                                                    showStatusIndicator={false}
                                                    showBotIndicator={false}
                                                />
                                                <span className="min-w-0 flex-1 truncate text-left">{user.full_name}</span>
                                            </div>
                                            {value === user.name && <CheckIcon className="h-4 w-4 opacity-70 shrink-0" />}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </div>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
