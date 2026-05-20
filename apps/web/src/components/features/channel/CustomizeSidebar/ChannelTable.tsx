import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import { DataTable } from "@components/common/DataTable/DataTable"
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@components/ui/select"
import { ChannelSidebarData } from "@raven/lib/hooks/useGroupedChannels"
import { RavenGroupedChannels } from "@raven/types/Raven/RavenGroupedChannels"
import { RavenPinnedChannels } from "@raven/types/Raven/RavenPinnedChannels"
import { RavenUser } from "@raven/types/Raven/RavenUser"
import { useMemo, useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { ColumnDef, SortingState } from "src/types/DataTable"
import _ from "@lib/translate"
import { Star } from "lucide-react"

interface ChannelTable {
  name: string,
  channel_name: string,
  channel_description: string,
  type: "Private" | "Public" | "Open",
  channel_group: string
}

export const ChannelTable = ({ data }: { data: ChannelSidebarData }) => {

  const [sorting, setSorting] = useState<SortingState | null>(null)

  const tableData = useMemo<ChannelTable[]>(() => {

    const result: ChannelTable[] = []

    // Process grouped channels
    data.groupedChannels.forEach(([groupName, channels]) => {
      channels.forEach(channel => {
        result.push({
          name: channel.name,
          channel_name: channel.channel_name,
          channel_description: channel.channel_description || '',
          type: channel.type,
          channel_group: groupName
        })
      })
    })

    // Process ungrouped channels
    data.ungroupedChannels.forEach(channel => {
      result.push({
        name: channel.name,
        channel_name: channel.channel_name,
        channel_description: channel.channel_description || '',
        type: channel.type,
        channel_group: ''
      })
    })

    return result
  }, [data])

  const columns: ColumnDef<ChannelTable>[] = useMemo(() => [
    {
      id: 'channel_name',
      header: _('Name'),
      accessorKey: 'channel_name',
      enableSorting: true,
      headerClassName: 'w-[30%]',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <ChannelIcon
            type={row.type || "Public"}
            className="w-4 h-4 shrink-0"
          />
          <span className='text-sm font-medium line-clamp-1 text-ellipsis'>{row.channel_name}</span>
        </div>
      )
    },
    {
      id: 'channel_description',
      header: _('Description'),
      accessorKey: 'channel_description',
      enableSorting: false,
      headerClassName: 'w-[40%]',
      cell: ({ value }) => (
        <span className='text-sm text-ink-gray-4 line-clamp-1 text-ellipsis'>
          {value as string || '—'}
        </span>
      )
    },
    {
      id: 'channel_group',
      header: _('Group'),
      accessorKey: 'channel_group',
      enableSorting: true,
      headerClassName: 'w-[30%]',
      cell: ({ row }) => (
        <ChannelGroupDropdown channel={row} />
      )
    }
  ], [])

  const sortedData = useMemo(() => {
    if (!sorting) return tableData
    const { field, order } = sorting
    return [...tableData].sort((a, b) => {
      const aVal = a[field as keyof ChannelTable] ?? ''
      const bVal = b[field as keyof ChannelTable] ?? ''
      const cmp = aVal.localeCompare(bVal)
      return order === 'desc' ? -cmp : cmp
    })
  }, [tableData, sorting])

  return (
    <DataTable
      className="flex-1 min-h-0 h-full"
      columns={columns}
      data={sortedData}
      getRowId={(row) => row.name}
      sorting={sorting}
      onSortingChange={setSorting}
      tableClassName="table-fixed"
    />
  )
}

const ChannelGroupDropdown = ({ channel }: { channel: ChannelTable }) => {

  const { control, getValues } = useFormContext<RavenUser>()

  const { update: updateGroupedChannels, append: appendGroupedChannels, remove: removeGroupedChannels } = useFieldArray<RavenUser, 'grouped_channels'>({
    control,
    name: 'grouped_channels'
  })
  const { fields: groups } = useFieldArray<RavenUser, 'channel_groups'>({
    control,
    name: 'channel_groups'
  })
  const { append: appendPinnedChannels, remove: removePinnedChannels } = useFieldArray<RavenUser, 'pinned_channels'>({
    control,
    name: 'pinned_channels'
  })

  const handleGroupChange = (value: string) => {
    const currentPinnedChannels = getValues('pinned_channels') || []
    const currentGroupedChannels = getValues('grouped_channels') || []

    const pinnedIndex = currentPinnedChannels.findIndex(
      field => field.channel_id === channel.name
    )

    const groupedIndex = currentGroupedChannels.findIndex(
      field => field.channel_id === channel.name
    )

    if (value === "Favorites") {
      if (pinnedIndex < 0) {
        appendPinnedChannels({
          channel_id: channel.name,
        } as RavenPinnedChannels)
      }
      if (groupedIndex >= 0) {
        removeGroupedChannels(groupedIndex)
      }
    } else if (value === "Ungroup Channel") {
      if (pinnedIndex >= 0) {
        removePinnedChannels(pinnedIndex)
      }
      if (groupedIndex >= 0) {
        removeGroupedChannels(groupedIndex)
      }
    } else {
      if (pinnedIndex >= 0) {
        removePinnedChannels(pinnedIndex)
      }

      if (groupedIndex >= 0) {
        updateGroupedChannels(groupedIndex, {
          ...currentGroupedChannels[groupedIndex],
          channel_group: value
        })
      } else {
        appendGroupedChannels({
          channel_id: channel.name,
          channel_group: value,
        } as RavenGroupedChannels)
      }
    }
  }

  return (<Select
    value={channel.channel_group}
    onValueChange={handleGroupChange}
  >
    <SelectTrigger className="w-52 **:data-[slot=select-value]:truncate **:data-[slot=select-value]:block">
      <SelectValue placeholder={_('Select a group')} />
    </SelectTrigger>
    <SelectContent className="min-w-56 max-w-72">
      <SelectItem value="Favorites">
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 text-ink-gray-8/80 fill-amber-300 stroke-amber-300 mr-1" />
          {_("Favorites")}
        </div>
      </SelectItem>
      {groups.length > 0 && <SelectSeparator className="mx-1" />}
      {groups.map((field) => (
        <SelectItem key={field.name} value={field.group_name} className="overflow-hidden *:last:truncate *:last:block!">
          {field.group_name}
        </SelectItem>
      ))}
      {channel.channel_group && <div>
        <SelectSeparator className="mx-1" />
        <SelectItem value="Ungroup Channel" className="text-ink-red-4">{_("Ungroup Channel")}</SelectItem>
      </div>}
    </SelectContent>
  </Select>)
}