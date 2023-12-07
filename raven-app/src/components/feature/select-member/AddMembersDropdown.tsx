import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { useContext, useMemo, useState } from 'react'
import '../../feature/command-palette/styles.css'
import { UserFields, UserListContext } from '@/utils/users/UserListProvider'
import { Text, TextField } from '@radix-ui/themes'
import { ChannelMembers } from '@/utils/channel/ChannelMembersProvider'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useMultipleSelection, useCombobox } from 'downshift'
import { clsx } from 'clsx'
import { Label } from '@/components/common/Form'
interface AddMembersDropdownProps {
    channelMembers?: ChannelMembers,
    label?: string,
    selectedUsers: UserFields[],
    setSelectedUsers: (users: UserFields[]) => void
}

const AddMembersDropdown = ({ channelMembers, label = 'Select users', selectedUsers, setSelectedUsers }: AddMembersDropdownProps) => {

    // All users
    const users = useContext(UserListContext)

    //Options for dropdown
    const nonChannelMembers = users.users?.filter((m: UserFields) => !channelMembers?.[m.name]) ?? []

    /** Function to filter users */
    function getFilteredUsers(selectedUsers: UserFields[], inputValue: string) {
        const lowerCasedInputValue = inputValue.toLowerCase()

        return nonChannelMembers.filter((user: UserFields) => {
            return (
                !selectedUsers.includes(user) &&
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

        return (
            <div className="w-full">
                <div className="flex flex-col gap-1">
                    <Label className="w-fit" {...getLabelProps()}>
                        {label}
                    </Label>
                    <TextField.Root className="w-full bg-transparent" variant='soft' color='gray'>
                        <div className="inline-flex gap-1 p-2 items-center flex-wrap">
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
                            <div className="flex gap-0.5 grow">
                                <TextField.Input
                                    placeholder="Type a name..."
                                    width='9'
                                    autoFocus
                                    {...getInputProps(getDropdownProps())}
                                />
                            </div>
                        </div>
                    </TextField.Root>
                </div >
                <ul
                    className={`absolute w-inherit bg-background rounded-b-md mt-1 shadow-md max-h-36 overflow-scroll p-0 z-50 ${!(isOpen && items.length) && 'hidden'
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