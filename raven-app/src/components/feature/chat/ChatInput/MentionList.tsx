import { UserAvatar } from '@/components/common/UserAvatar'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { UserFields } from '@/utils/users/UserListProvider'
import { Flex, Text, Theme } from '@radix-ui/themes'
import { ReactRendererOptions } from '@tiptap/react'
import { clsx } from 'clsx'
import {
    forwardRef, useEffect, useImperativeHandle,
    useState,
} from 'react'

export default forwardRef((props: ReactRendererOptions['props'], ref) => {

    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = props?.items[index]

        if (item) {
            props.command({ id: item.name, label: item.full_name })
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props?.items.length - 1) % props?.items.length)
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props?.items.length)
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [props?.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                downHandler()
                return true
            }

            if (event.key === 'Enter') {
                enterHandler()
                return true
            }

            return false
        },
    }))

    return (
        <Theme accentColor='iris' panelBackground='translucent'>
            <Flex
                direction='column'
                gap='0'
                className='shadow-lg dark:backdrop-blur-[8px] dark:bg-panel-translucent bg-white overflow-y-scroll max-h-64 rounded-md'
            >
                {props?.items.length
                    ? props.items.map((item: UserFields, index: number) => (
                        <MentionItem
                            item={item}
                            index={index}
                            selectItem={selectItem}
                            selectedIndex={selectedIndex}
                            key={item.name}
                            itemsLength={props.items.length}
                        />
                    ))
                    : <div className="item">No result</div>
                }
            </Flex>
        </Theme>
    )
})

const MentionItem = ({ item, index, selectItem, selectedIndex, itemsLength }: { itemsLength: number, selectedIndex: number, index: number, item: UserFields, selectItem: (index: number) => void }) => {

    const isActive = useIsUserActive(item.name)


    return <Flex
        role='button'
        align='center'
        title={item.full_name}
        aria-label={`Mention ${item.full_name}`}
        className={clsx('px-3 py-1.5 gap-2 rounded-md',
            index === itemsLength - 1 ? 'rounded-b-md' : 'rounded-b-none',
            index === 0 ? 'rounded-t-md' : 'rounded-t-none',
            index === selectedIndex ? 'bg-accent-a5' : 'bg-panel-translucent'
        )}
        key={index}
        onClick={() => selectItem(index)}
    >
        <UserAvatar
            src={item.user_image}
            alt={item.full_name}
            loading='lazy'
            variant='solid'
            radius='full'
            isActive={isActive}
        />
        <Text as='span' weight='medium' size='2'> {item.full_name}</Text>
    </Flex >
}