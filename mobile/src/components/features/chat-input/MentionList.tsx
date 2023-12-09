// import './MentionList.scss'

import { UserAvatar } from '@/components/common/UserAvatar'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { UserFields } from '@/utils/users/UserListProvider'
import { ReactRendererOptions } from '@tiptap/react'
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

    if (props?.items.length) {
        return (
            <ul role="list" className="divide-y divide-zinc-700 bg-zinc-900 border border-zinc-800 shadow-lg shadow-black list-none rounded-md overflow-y-auto max-h-96">
                {props.items.map((item: UserFields, index: number) => (
                    <MentionItem
                        item={item}
                        index={index}
                        selectItem={selectItem}
                        selectedIndex={selectedIndex}
                        key={item.name}
                        itemsLength={props.items.length}
                    />
                ))

                }
            </ul>
        )
    } else {
        return null
    }


})

const MentionItem = ({ item, index, selectItem, selectedIndex, itemsLength }: { itemsLength: number, selectedIndex: number, index: number, item: UserFields, selectItem: (index: number) => void }) => {

    const isActive = useIsUserActive(item.name)

    const roundedTop = index === 0 ? ' rounded-t-md' : ''

    const roundedBottom = index === itemsLength - 1 ? ' rounded-b-md' : ''

    return <li
        className={'py-2 px-3 text-zinc-200 text-md active:bg-blue-500 focus:bg-blue-500 focus-visible:bg-blue-500 hover:bg-blue-500' + roundedBottom + roundedTop}
        onClick={() => selectItem(index)}
    >
        <div className="flex items-center gap-x-3">
            <UserAvatar alt={item.full_name} src={item.user_image} isActive={isActive} />
            <span>{item.full_name}</span>
        </div>
    </li>
}