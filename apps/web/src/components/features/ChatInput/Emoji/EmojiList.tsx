import { ReactRendererOptions } from '@tiptap/react'
import { clsx } from 'clsx'
import {
    forwardRef, useEffect, useImperativeHandle,
    useRef,
    useState,
} from 'react'
import { EmojiType } from './EmojiSuggestion'

export default forwardRef((props: ReactRendererOptions['props'], ref) => {

    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = props?.items[index]

        if (item) {
            props.command(item)
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
            // support themes
            <div
                className='flex flex-col gap-0 shadow-lg dark:bg-popover bg-white overflow-y-scroll max-h-96 rounded-md'
            >
                {props?.items.length
                    ? props.items.map((item: EmojiType, index: number) => (
                        <MentionItem
                            item={item}
                            index={index}
                            selectItem={selectItem}
                            selectedIndex={selectedIndex}
                            key={item.shortcodes ?? item.id}
                            itemsLength={props.items.length}
                        />
                    ))
                    : null
                }
            </div>
    )
})

const MentionItem = ({ item, index, selectItem, selectedIndex, itemsLength }: { itemsLength: number, selectedIndex: number, index: number, item: EmojiType, selectItem: (index: number) => void }) => {

    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (index === selectedIndex) ref.current?.scrollIntoView({ block: 'nearest' })
    }, [selectedIndex, index])


    return <div
        role='button'
        ref={ref}
        title={item.id}
        aria-label={`Select emoji ${item.id}`}
        className={clsx('px-3 py-1.5 gap-2 rounded-md cursor-pointer flex items-center',
            index === itemsLength - 1 ? 'rounded-b-md' : 'rounded-b-none',
            index === 0 ? 'rounded-t-md' : 'rounded-t-none',
            index === selectedIndex ? 'bg-accent-a5' : 'bg-panel-translucent'
        )}
        key={index}
        onClick={() => selectItem(index)}
    >

        <span className='text-sm'>
            {/* @ts-expect-error */}
            <em-emoji shortcodes={item.shortcodes}></em-emoji> {item.shortcodes ?? item.id}</span>
    </div >
}
