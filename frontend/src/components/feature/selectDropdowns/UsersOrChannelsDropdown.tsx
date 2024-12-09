import { Label } from "@/components/common/Form"
import { UserAvatar } from "@/components/common/UserAvatar"
import { HStack } from "@/components/layout/Stack"
import { useIsDesktop } from "@/hooks/useMediaQuery"
import { ChannelListContext, ChannelListContextType, ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelIcon } from "@/utils/layout/channelIcon"
import { UserFields, UserListContext } from "@/utils/users/UserListProvider"
import { TextField, Text } from "@radix-ui/themes"
import clsx from "clsx"
import { useMultipleSelection, useCombobox } from "downshift"
import { useContext, useMemo, useState } from "react"
import { BiBuildings } from "react-icons/bi"

interface UsersOrChannelsDropdownProps {
    label?: string,
    selectedOptions: (UserFields | ChannelListItem)[],
    setSelectedOptions: (options: (UserFields | ChannelListItem)[]) => void
}

const UsersOrChannelsDropdown = ({ selectedOptions, setSelectedOptions, label = 'Select Users / Channels', ...props }: UsersOrChannelsDropdownProps) => {

    // All users
    const users = useContext(UserListContext)

    // All channels
    const channels = useContext(ChannelListContext) as ChannelListContextType

    //Options for dropdown
    const options: (UserFields | ChannelListItem)[] = [...users.enabledUsers, ...channels.channels]

    const isDesktop = useIsDesktop()

    /** Function to filter options */
    function getFilteredOptions(selectedOptions: (UserFields | ChannelListItem)[], inputValue: string) {
        const lowerCasedInputValue = inputValue.toLowerCase()

        return options.filter((option: UserFields | ChannelListItem) => {
            const isOptionSelected = selectedOptions.find(selectedOption => selectedOption.name === option.name)
            if ('full_name' in option)
                return (
                    !isOptionSelected &&
                    (option.full_name.toLowerCase().includes(lowerCasedInputValue) ||
                        option.name.toLowerCase().includes(lowerCasedInputValue))
                )
            return (
                !isOptionSelected &&
                (option.channel_name.toLowerCase().includes(lowerCasedInputValue) ||
                    option.name.toLowerCase().includes(lowerCasedInputValue))
            )
        })
    }

    function MultipleComboBox({ selectedOptions, setSelectedOptions }: { selectedOptions: (UserFields | ChannelListItem)[], setSelectedOptions: (options: (UserFields | ChannelListItem)[]) => void }) {
        const [inputValue, setInputValue] = useState('')

        const items = useMemo(() => getFilteredOptions(selectedOptions, inputValue), [selectedOptions, inputValue])

        const { getSelectedItemProps, getDropdownProps, removeSelectedItem } = useMultipleSelection({
            selectedItems: selectedOptions,
            onStateChange({ selectedItems: newSelectedItems, type }) {
                switch (type) {
                    case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
                    case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
                    case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
                    case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
                        setSelectedOptions(newSelectedItems ?? [])
                        break
                    default:
                        break
                }
            }
        })
        const {
            isOpen,
            getLabelProps,
            getMenuProps,
            getInputProps,
            highlightedIndex,
            getItemProps,
            selectedItem,
        } = useCombobox({
            items,
            itemToString(item) {
                return item ? item.name : ''
            },
            defaultHighlightedIndex: 0, // after selection, highlight the first item.
            selectedItem: null,
            inputValue,
            stateReducer(state, actionAndChanges) {
                const { changes, type } = actionAndChanges

                switch (type) {
                    case useCombobox.stateChangeTypes.InputKeyDownEnter:
                    case useCombobox.stateChangeTypes.ItemClick:
                        return {
                            ...changes,
                            isOpen: true, // keep the menu open after selection.
                            highlightedIndex: 0, // with the first option highlighted.
                        }
                    default:
                        return changes
                }
            },
            onStateChange({
                inputValue: newInputValue,
                type,
                selectedItem: newSelectedItem,
            }) {
                switch (type) {
                    case useCombobox.stateChangeTypes.InputKeyDownEnter:
                    case useCombobox.stateChangeTypes.ItemClick:
                    case useCombobox.stateChangeTypes.InputBlur:
                        if (newSelectedItem) {
                            setSelectedOptions([...selectedOptions, newSelectedItem])
                            setInputValue('')
                        }
                        break

                    case useCombobox.stateChangeTypes.InputChange:
                        setInputValue(newInputValue ?? '')

                        break
                    default:
                        break
                }
            },
        })

        return (
            <div className="w-full">
                <div className="flex flex-col gap-1">
                    <Label className="w-fit" {...getLabelProps()}>
                        {label}
                    </Label>
                    <TextField.Root
                        placeholder="Type a name..."
                        className='w-full'
                        autoFocus={isDesktop}
                        {...getInputProps(getDropdownProps())}
                    >

                    </TextField.Root>

                    <div className="inline-flex gap-1 p-1 items-center flex-wrap">
                        {selectedOptions.map(function renderSelectedItem(
                            selectedItemForRender,
                            index,
                        ) {
                            if ('channel_name' in selectedItemForRender) {
                                return (
                                    <span
                                        className="rt-Button rt-BaseButton rt-variant-surface rt-r-size-2 flex items-center"
                                        key={`selected-item-${index}`}
                                        {...getSelectedItemProps({
                                            selectedItem: selectedItemForRender,
                                            index,
                                        })}>
                                        <ChannelIcon type={selectedItemForRender.type} size='14' />
                                        <Text size='2'>
                                            {selectedItemForRender.channel_name}
                                        </Text>
                                        <span
                                            className="cursor-pointer"
                                            onClick={e => {
                                                e.stopPropagation()
                                                removeSelectedItem(selectedItemForRender)
                                            }}>
                                            &#10005;
                                        </span>
                                    </span>
                                )
                            }
                            return (
                                <span
                                    className="rt-Button rt-BaseButton rt-variant-surface rt-r-size-2 flex items-center"
                                    key={`selected-item-${index}`}
                                    {...getSelectedItemProps({
                                        selectedItem: selectedItemForRender,
                                        index,
                                    })}>
                                    <UserAvatar
                                        src={selectedItemForRender.user_image ?? ''}
                                        alt={selectedItemForRender.full_name}
                                        size='1'
                                        variant='solid'
                                        color='gray'

                                    />
                                    <Text size='2'>
                                        {selectedItemForRender.full_name}
                                    </Text>
                                    <span
                                        className="cursor-pointer"
                                        onClick={e => {
                                            e.stopPropagation()
                                            removeSelectedItem(selectedItemForRender)
                                        }}>
                                        &#10005;
                                    </span>
                                </span>
                            )
                        })}
                    </div>
                </div>
                <ul
                    className={`sm:w-[550px] w-[24rem] absolute bg-background rounded-b-md mt-1 shadow-md z-[9999] max-h-96 overflow-scroll p-0 ${!(isOpen && items.length) && 'hidden'
                        }`}
                    {...getMenuProps()}
                >
                    {isOpen &&
                        items.map((item, index) => (
                            <li className={clsx(
                                highlightedIndex === index && 'bg-accent-4',
                                selectedItem === item && 'font-bold',
                                'py-2 px-3 shadow-sm flex gap-2 items-center',
                            )} key={`${item.name}`}
                                {...getItemProps({ item, index })}>
                                {'channel_name' in item ?
                                    <HStack justify='between' width='100%'>
                                        <HStack gap='1' align='center'>
                                            <ChannelIcon type={item.type} size='14' />
                                            <Text as='span' weight='medium' size='2'>{item.channel_name}</Text>
                                        </HStack>
                                        <HStack gap='1' align='center'>
                                            <BiBuildings color='gray' />
                                            <Text size='1' color='gray'>{item.workspace}</Text>
                                        </HStack>
                                    </HStack>
                                    :
                                    <>
                                        <UserAvatar src={item.user_image ?? ''} alt={item.full_name} size='2' />
                                        <div className='flex flex-col'>
                                            <Text as='span' weight='medium' size='2'>{item.full_name}</Text>
                                            <Text as='span' size='1'>{item.name}</Text>
                                        </div>
                                    </>
                                }
                            </li>
                        ))}
                </ul>
            </div>
        )
    }

    return <MultipleComboBox selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} />

}

export default UsersOrChannelsDropdown