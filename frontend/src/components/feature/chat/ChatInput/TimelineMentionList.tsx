import { Flex, Theme, Text } from '@radix-ui/themes'
import { ReactRendererOptions } from '@tiptap/react'
import { clsx } from 'clsx'
import {
    forwardRef, useEffect, useImperativeHandle,
    useRef,
    useState,
} from 'react'
import { BiCalendar } from 'react-icons/bi'

export interface TimelineItem {
    name: string
    experiment_id: string
    timeline_task: string
    owner_name: string
    start_date: string
    end_date: string
    status: string
}

export default forwardRef((props: ReactRendererOptions['props'], ref) => {

    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = props?.items[index]
        if (item) {
            props.command({ 
                id: item.name, 
                label: `${item.timeline_task} (${item.experiment_id})`,
                timeline_id: item.name,
                experiment_id: item.experiment_id,
                timeline_task: item.timeline_task
            })
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
                className='shadow-lg dark:bg-panel-solid bg-white overflow-y-scroll max-h-64 rounded-md'
            >
                {props?.items.length
                    ? props.items.map((item: TimelineItem, index: number) => (
                        <MentionItem
                            item={item}
                            index={index}
                            selectItem={selectItem}
                            selectedIndex={selectedIndex}
                            key={item.name}
                            itemsLength={props.items.length}
                        />
                    ))
                    : <div className="px-3 py-2 text-sm text-gray-500">No timeline items found</div>
                }
            </Flex>
        </Theme>
    )
})

const MentionItem = ({ item, index, selectItem, selectedIndex, itemsLength }: { 
    itemsLength: number, 
    selectedIndex: number, 
    index: number, 
    item: TimelineItem, 
    selectItem: (index: number) => void 
}) => {

    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (index === selectedIndex) ref.current?.scrollIntoView({ block: 'nearest' })
    }, [selectedIndex, index])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    return <Flex
        role='button'
        align='center'
        ref={ref}
        title={`${item.timeline_task} - ${item.experiment_id}`}
        aria-label={`Mention timeline ${item.timeline_task}`}
        className={clsx('px-3 py-2 gap-2 rounded-md',
            index === itemsLength - 1 ? 'rounded-b-md' : 'rounded-b-none',
            index === 0 ? 'rounded-t-md' : 'rounded-t-none',
            index === selectedIndex ? 'bg-accent-a5' : 'bg-panel-translucent'
        )}
        key={index}
        onClick={() => selectItem(index)}
    >
        <BiCalendar size={18} className="text-gray-500" />
        <Flex direction='column' gap='1' className="flex-1">
            <Text as='span' weight='medium' size='2'>{item.timeline_task}</Text>
            <Flex align='center' gap='2'>
                <Text as='span' size='1' color='gray'>{item.experiment_id}</Text>
                <Text as='span' size='1' color='gray'>•</Text>
                <Text as='span' size='1' color='gray'>{formatDate(item.start_date)} - {formatDate(item.end_date)}</Text>
                <Text as='span' size='1' color='gray'>•</Text>
                <Text as='span' size='1' color={item.status === 'Done' ? 'green' : item.status === 'Ongoing' ? 'blue' : 'gray'}>
                    {item.status}
                </Text>
            </Flex>
        </Flex>
    </Flex>
}