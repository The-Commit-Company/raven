import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Text } from '@radix-ui/themes'
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
            <ul role="list"
                data-is-toolbar-element={true}
                className="divide-y w-full divide-gray-5 overflow-x-hidden bg-gray-2 border border-gray-5 shadow-lg list-none rounded-md overflow-y-scroll max-h-72">
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
        data-is-toolbar-element={true}
        className={'py-2 px-3 w-[90vw] text-md  active:bg-gray-4 focus:bg-gray-4 focus-visible:bg-gray-4 hover:bg-gray-4' + roundedBottom + roundedTop}
        onClick={() => selectItem(index)}
    >
        <div className="flex items-center gap-x-3" data-is-toolbar-element={true}>
            {item.type === "Private" ? <BiLockAlt size='18' className='text-gray-12' /> : item.type === "Public" ? <BiHash size='18' className='text-gray-12' /> :
                <BiGlobe size='18' className='text-gray-12' />}
            <Text as='span' data-is-toolbar-element={true}>{item.channel_name}</Text>
        </div>
    </li>
}