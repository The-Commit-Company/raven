import { Label } from '@/components/common/Form'
import { UserAvatar } from '@/components/common/UserAvatar'
import { HStack } from '@/components/layout/Stack'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { ChannelListContext, ChannelListContextType, ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { UserFields, UserListContext } from '@/utils/users/UserListProvider'
import { Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { useCombobox, useMultipleSelection } from 'downshift'
import { useContext, useMemo, useState } from 'react'
import { BiBuildings } from 'react-icons/bi'

interface UsersOrChannelsDropdownProps {
  label?: string
  selectedOptions: (UserFields | ChannelListItem)[]
  setSelectedOptions: (options: (UserFields | ChannelListItem)[]) => void
}

const UsersOrChannelsDropdown = ({
  selectedOptions,
  setSelectedOptions,
  label = 'Select Users / Channels'
}: UsersOrChannelsDropdownProps) => {
  const users = useContext(UserListContext)
  const channels = useContext(ChannelListContext) as ChannelListContextType
  const options: (UserFields | ChannelListItem)[] = [...users.enabledUsers, ...channels.channels]
  const isDesktop = useIsDesktop()

  function getFilteredOptions(inputValue: string) {
    const lowerCasedInputValue = inputValue.toLowerCase()
    return options.filter((option) => {
      if ('full_name' in option) {
        return (
          option.full_name.toLowerCase().includes(lowerCasedInputValue) ||
          option.name.toLowerCase().includes(lowerCasedInputValue)
        )
      }
      return (
        option.channel_name.toLowerCase().includes(lowerCasedInputValue) ||
        option.name.toLowerCase().includes(lowerCasedInputValue)
      )
    })
  }

  const [inputValue, setInputValue] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!isComposing) {
      setInputValue(value)
    }
  }

  const items = useMemo(() => getFilteredOptions(inputValue), [inputValue])

  const { getSelectedItemProps, removeSelectedItem } = useMultipleSelection({
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

  const { isOpen, getLabelProps, getMenuProps, highlightedIndex, getItemProps, getInputProps } = useCombobox({
    items,
    itemToString(item) {
      return item ? item.name : ''
    },
    defaultHighlightedIndex: 0,
    selectedItem: null,
    inputValue,
    onStateChange({ type }) {
      switch (type) {
        default:
          break
      }
    }
  })

  const inputProps = getInputProps({
    value: inputValue,
    onChange: handleInputChange,
    onCompositionStart: () => setIsComposing(true),
    onCompositionEnd: () => {
      setIsComposing(false)
      setInputValue((prev) => prev)
    }
  })

  return (
    <div className='w-full'>
      <div className='flex flex-col gap-1'>
        <Label className='w-fit' {...getLabelProps()}>
          {label}
        </Label>

        <input
          type='text'
          placeholder='Nhập để tìm...'
          autoFocus={isDesktop}
          className='w-90 border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2 rounded-md text-sm transition duration-150 ease-in-out'
          {...inputProps}
        />

        <div className='inline-flex gap-1 p-1 items-center flex-wrap'>
          {selectedOptions?.map((selectedItemForRender, index) => {
            const isChannel = 'channel_name' in selectedItemForRender
            return (
              <span
                className='rt-Button rt-BaseButton rt-variant-surface rt-r-size-2 flex items-center'
                key={`selected-item-${index}`}
              >
                {isChannel ? (
                  <>
                    <ChannelIcon type={selectedItemForRender.type} size='14' />
                    <Text size='2'>{selectedItemForRender.channel_name}</Text>
                  </>
                ) : (
                  <>
                    <UserAvatar
                      src={selectedItemForRender.user_image ?? ''}
                      alt={selectedItemForRender.full_name}
                      size='1'
                      variant='solid'
                      color='gray'
                    />
                    <Text size='2'>{selectedItemForRender.full_name}</Text>
                  </>
                )}
                <span
                  className='cursor-pointer ml-1'
                  onClick={(e) => {
                    setSelectedOptions(selectedOptions.filter((o) => o.name !== selectedItemForRender.name))
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
        className={`sm:w-[550px] w-[24rem] absolute bg-background rounded-b-md mt-1 shadow-md z-[999] max-h-96 overflow-scroll p-0 ${
          !(isOpen && items?.length) && 'hidden'
        }`}
        {...getMenuProps()}
      >
        {isOpen &&
          items?.map((item, index) => {
            const isChecked = selectedOptions.some((o) => o.name === item.name)
            return (
              <li
                className={clsx(
                  highlightedIndex === index && 'bg-accent-4',
                  'py-2 px-3 shadow-sm flex gap-2 items-center cursor-pointer'
                )}
                key={`${item.name}`}
                {...getItemProps({ item, index })}
                onClick={(e) => {
                  e.preventDefault()
                  const isChecked = selectedOptions.some((o) => o.name === item.name)
                  if (isChecked) {
                    setSelectedOptions(selectedOptions.filter((o) => o.name !== item.name))
                  } else {
                    setSelectedOptions([...selectedOptions, item])
                  }
                }}
              >
                <input
                  type='checkbox'
                  checked={selectedOptions.some((o) => o.name === item.name)}
                  onChange={(e) => {
                    const checked = e.target.checked
                    if (checked) {
                      setSelectedOptions([...selectedOptions, item])
                    } else {
                      setSelectedOptions(selectedOptions.filter((o) => o.name !== item.name))
                    }
                  }}
                  onClick={(e) => e.stopPropagation()} // để không bị duplicate toggle khi click input
                />

                {'channel_name' in item ? (
                  <HStack justify='between' width='100%'>
                    <HStack gap='1' align='center'>
                      <ChannelIcon type={item.type} size='14' />
                      <Text as='span' weight='medium' size='2'>
                        {item.channel_name}
                      </Text>
                    </HStack>
                    <HStack gap='1' align='center'>
                      <BiBuildings color='gray' />
                      <Text size='1' color='gray'>
                        {item.workspace}
                      </Text>
                    </HStack>
                  </HStack>
                ) : (
                  <>
                    <UserAvatar src={item.user_image ?? ''} alt={item.full_name} size='2' />
                    <div className='flex flex-col'>
                      <Text as='span' weight='medium' size='2'>
                        {item.full_name}
                      </Text>
                      <Text as='span' size='1'>
                        {item.name}
                      </Text>
                    </div>
                  </>
                )}
              </li>
            )
          })}
      </ul>
    </div>
  )
}

export default UsersOrChannelsDropdown
