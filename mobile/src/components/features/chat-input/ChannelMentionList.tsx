import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ReactRendererOptions } from '@tiptap/react'
import {
    forwardRef, useEffect, useImperativeHandle,
    useState,
} from 'react'
import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'

export default forwardRef((props: ReactRendererOptions['props'], ref) => {

    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = props?.items[index]
        if (item) {
            props.command({ id: item.name, label: item.channel_name })
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
            <ul role="list" className="divide-y divide-zinc-700 bg-zinc-900 border border-zinc-800 shadow-lg shadow-black list-none rounded-md">
                {props.items.map((item: ChannelListItem, index: number) => (
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

const MentionItem = ({ item, index, selectItem, selectedIndex, itemsLength }: { itemsLength: number, selectedIndex: number, index: number, item: ChannelListItem, selectItem: (index: number) => void }) => {

    const roundedTop = index === 0 ? ' rounded-t-md' : ''

    const roundedBottom = index === itemsLength - 1 ? ' rounded-b-md' : ''

    return <li
        className={'py-2 px-3 text-zinc-200 text-md active:bg-blue-500 focus:bg-blue-500 focus-visible:bg-blue-500 hover:bg-blue-500' + roundedBottom + roundedTop}
        onClick={() => selectItem(index)}
    >
        <div className="flex items-center gap-x-3">
            {item.type === "Private" ? <BiLockAlt size='18' color='var(--ion-color-dark)' /> : item.type === "Public" ? <BiHash size='18' color='var(--ion-color-dark)' /> :
                <BiGlobe size='18' color='var(--ion-color-dark)' />}
            <span>{item.channel_name}</span>
        </div>
    </li>
}