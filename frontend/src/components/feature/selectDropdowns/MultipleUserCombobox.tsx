import { Label } from "@/components/common/Form"
import { UserAvatar } from "@/components/common/UserAvatar"
import { HStack, Stack } from "@/components/layout/Stack"
import { useIsDesktop } from "@/hooks/useMediaQuery"
import { UserFields } from "@/utils/users/UserListProvider"
import { ScrollArea, Text, TextField } from "@radix-ui/themes"
import clsx from "clsx"
import { useCombobox, useMultipleSelection } from "downshift"
import { useMemo, useState } from "react"
import { FiX } from "react-icons/fi"

function MultipleUserComboBox({ selectedUsers, setSelectedUsers, getFilteredUsers, label }: { selectedUsers: UserFields[], setSelectedUsers: (users: UserFields[]) => void, getFilteredUsers: (selectedUsers: UserFields[], inputValue: string) => UserFields[], label: string }) {
    const [inputValue, setInputValue] = useState('')

    const items = useMemo(() => getFilteredUsers(selectedUsers, inputValue), [selectedUsers, inputValue])

    const { getSelectedItemProps, getDropdownProps, removeSelectedItem } = useMultipleSelection({
        selectedItems: selectedUsers,
        onStateChange({ selectedItems: newSelectedItems, type }) {
            switch (type) {
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
                case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
                    setSelectedUsers(newSelectedItems ?? [])
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
        // defaultHighlightedIndex: 0, // after selection, highlight the first item.
        // selectedItem: null,
        inputValue,
        stateReducer(state, actionAndChanges) {
            const { changes, type } = actionAndChanges

            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                    return {
                        ...changes,
                        // isOpen: true, // keep the menu open after selection.
                        // highlightedIndex: 0, // with the first option highlighted.
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
                        setSelectedUsers([...selectedUsers, newSelectedItem])
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

    const isDesktop = useIsDesktop()

    return (
        <div className="w-full">
            <div className="flex flex-col gap-1">
                <Label className="w-fit" {...getLabelProps()}>
                    {label}
                </Label>
                <TextField.Root
                    // variant='soft'
                    placeholder="Type a name..."
                    size='3'
                    className='w-full'
                    autoFocus={isDesktop}
                    {...getInputProps(getDropdownProps())}
                >

                </TextField.Root>
            </div>
            <ul
                className={`sm:w-[550px] w-[24rem] absolute bg-background rounded-b-md mt-1 shadow-md z-[9999] max-h-96 overflow-scroll p-0 ${!(isOpen && items.length) && 'hidden'
                    }`}
                {...getMenuProps()}
            >
                {isOpen &&
                    items.map((item, index) => (
                        <li
                            className={clsx(
                                highlightedIndex === index && 'bg-gray-3',
                                selectedItem === item && 'font-bold',
                                'py-2 px-3 shadow-sm flex gap-2 items-center cursor-default',
                            )}
                            key={`${item.name}`}
                            {...getItemProps({ item, index })}
                        >
                            <UserAvatar src={item.user_image ?? ''} alt={item.full_name} size='2' />
                            <div className='flex flex-col'>
                                <Text as='span' weight='medium' size='2'>{item.full_name}</Text>
                                <Text as='span' size='1'>{item.name}</Text>
                            </div>

                        </li>
                    ))}
            </ul>

            <ScrollArea className="flex gap-1 my-1 items-center flex-wrap max-h-96" scrollbars='vertical'>
                {selectedUsers.map(function renderSelectedItem(
                    selectedItemForRender,
                    index,
                ) {
                    return (
                        <span
                            className="flex justify-between w-full items-center hover:bg-gray-2 hover:dark:bg-gray-3 py-1.5 rounded-md transition-all duration-200"
                            key={`selected-item-${index}`}
                            {...getSelectedItemProps({
                                selectedItem: selectedItemForRender,
                                index,
                            })}
                        >
                            <HStack align='center' gap='2' px='2'>
                                <UserAvatar
                                    src={selectedItemForRender.user_image ?? ''}
                                    alt={selectedItemForRender.full_name}
                                    size='2'
                                    variant='solid'
                                    color='gray'

                                />
                                <Stack gap='0'>
                                    <Text size='2' weight='medium'>
                                        {selectedItemForRender.full_name}
                                    </Text>
                                    <Text size='1' weight='light'>
                                        {selectedItemForRender.name}
                                    </Text>
                                </Stack>

                            </HStack>


                            <span
                                className="cursor-pointer h-full flex items-center px-4 text-gray-9 hover:text-red-9"
                                role='button'
                                aria-label='Remove user'
                                title='Remove user'
                                onClick={e => {
                                    e.stopPropagation()
                                    removeSelectedItem(selectedItemForRender)
                                }}
                            >
                                <FiX size={20} />
                            </span>
                        </span>
                    )
                })}
            </ScrollArea>
        </div>
    )
}

export default MultipleUserComboBox