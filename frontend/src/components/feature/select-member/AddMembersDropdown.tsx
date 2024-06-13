import { useContext, useMemo, useState } from 'react'
import { UserFields, UserListContext } from '@/utils/users/UserListProvider'
import { Text, TextField } from '@radix-ui/themes'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useMultipleSelection, useCombobox } from 'downshift'
import { clsx } from 'clsx'
import { Label } from '@/components/common/Form'
import useFetchChannelMembers from '@/hooks/fetchers/useFetchChannelMembers'
import { useIsDesktop } from '@/hooks/useMediaQuery'

interface AddMembersDropdownProps {
    channelID: string,
    label?: string,
    selectedUsers: UserFields[],
    setSelectedUsers: (users: UserFields[]) => void
}

const AddMembersDropdown = ({ channelID, label = 'Select users', selectedUsers, setSelectedUsers }: AddMembersDropdownProps) => {

    const { channelMembers } = useFetchChannelMembers(channelID)

    // All users
    const users = useContext(UserListContext)

    //Options for dropdown
    const nonChannelMembers = users.enabledUsers?.filter((m: UserFields) => !channelMembers?.[m.name]) ?? []

    /** Function to filter users */
    function getFilteredUsers(selectedUsers: UserFields[], inputValue: string) {
        const lowerCasedInputValue = inputValue.toLowerCase()

        return nonChannelMembers.filter((user: UserFields) => {
            const isUserSelected = selectedUsers.find(selectedUser => selectedUser.name === user.name)
            return (
                !isUserSelected &&
                (user.full_name.toLowerCase().includes(lowerCasedInputValue) ||
                    user.name.toLowerCase().includes(lowerCasedInputValue))
            )
        })
    }

    function MultipleComboBox({ selectedUsers, setSelectedUsers }: { selectedUsers: UserFields[], setSelectedUsers: (users: UserFields[]) => void }) {
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
            getToggleButtonProps,
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
                        className='w-full'
                        autoFocus={isDesktop}
                        {...getInputProps(getDropdownProps())}
                    >

                    </TextField.Root>

                    <div className="inline-flex gap-1 p-1 items-center flex-wrap">
                        {selectedUsers.map(function renderSelectedItem(
                            selectedItemForRender,
                            index,
                        ) {
                            return (
                                <span
                                    className="rt-Button rt-BaseButton rt-variant-surface rt-r-size-2 flex items-center"
                                    key={`selected-item-${index}`}
                                    {...getSelectedItemProps({
                                        selectedItem: selectedItemForRender,
                                        index,
                                    })}
                                >
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
                                        }}
                                    >
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
                            <li
                                className={clsx(
                                    highlightedIndex === index && 'bg-accent-4',
                                    selectedItem === item && 'font-bold',
                                    'py-2 px-3 shadow-sm flex gap-2 items-center',
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
            </div>
        )
    }

    return <MultipleComboBox selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />
}


export default AddMembersDropdown