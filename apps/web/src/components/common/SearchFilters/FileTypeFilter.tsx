import { FileText, Image, FileSpreadsheet, Presentation, ChevronDown } from 'lucide-react';
import { Label } from '@components/ui/label';
import { Checkbox } from '@components/ui/checkbox';
import { Button } from '@components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import React, { useCallback } from 'react';
import { SearchFilters } from './types';
import _ from '@lib/translate';
import { useSearchParams } from 'react-router';

export const FILE_TYPE_GROUPS: Record<string, string[]> = {
    pdf: ['PDF'],
    doc: ['DOC', 'DOCX', 'ODT', 'OTT', 'RTF', 'TXT', 'DOT', 'DOTX', 'DOCM', 'DOTM', 'PAGES'],
    ppt: ['PPT', 'PPTX', 'ODP', 'OTP', 'PPS', 'PPSX', 'POT', 'POTX', 'PPTM', 'PPSM', 'POTM', 'PPAM', 'PPA', 'KEY'],
    xls: ['XLS', 'XLSX', 'CSV', 'ODS', 'OTS', 'XLSB', 'XLSM', 'XLT', 'XLTX', 'XLTM', 'XLAM', 'XLA', 'NUMBERS'],
    image: ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'SVG', 'BMP', 'TIFF', 'HEIC', 'HEIF', 'AVIF', 'ICO'],
}

export const expandFileTypeGroups = (groups: string[]): string[] => {
    const out = new Set<string>()
    for (const g of groups) FILE_TYPE_GROUPS[g]?.forEach((ext) => out.add(ext))
    return [...out]
}

const FILE_TYPE_OPTIONS = [
    { id: 'pdf', label: 'PDFs', icon: FileText },
    { id: 'doc', label: 'Documents', icon: FileText },
    { id: 'ppt', label: 'Presentations', icon: Presentation },
    { id: 'xls', label: 'Spreadsheets', icon: FileSpreadsheet },
    { id: 'image', label: 'Images', icon: Image },
]

export function FileTypeFilter({ filters }: { filters: SearchFilters }) {

    const [, setSearchParams] = useSearchParams()
    const selected = filters.file_type || []
    const checkedCount = selected.length
    const [open, setOpen] = React.useState(false)

    const toggleFileType = useCallback((id: string) => {
        let newSelected: string[]
        if (selected.includes(id)) {
            newSelected = selected.filter((ft) => ft !== id)
        } else {
            newSelected = [...selected, id]
        }
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev)
            params.set('file_type', newSelected.join(','))
            if (newSelected.length === 0) params.delete('file_type')
            return params
        })
    }, [selected, setSearchParams])

    return (
        <div className="w-full">
            <Label className="text-xs text-ink-gray-4 mb-1 block">{_("File types")}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild autoFocus>
                    <Button
                        variant="outline"
                        className="w-full h-9 pl-3 pr-2 flex justify-between items-center text-left font-normal border bg-surface-white"
                        role="combobox"
                        aria-expanded={open}
                    >
                        <span className={`truncate text-sm pl-1 ${checkedCount > 0 ? 'text-ink-gray-8' : 'text-ink-gray-4'}`}>
                            {checkedCount === 0 ? _('File Type') : checkedCount === 1 ? _('1 File Type Selected') : _(`${checkedCount} File Types Selected`)}
                        </span>
                        <ChevronDown className="h-4 w-4 text-ink-gray-4/50 ml-2" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto min-w-(--radix-popover-trigger-width) max-w-[320px] p-0" align="start">
                    <div className="py-1 px-1 max-h-64 overflow-y-auto">
                        {FILE_TYPE_OPTIONS.map((fileType) => {
                            const IconComponent = fileType.icon
                            const checked = selected.includes(fileType.id)
                            return (
                                <div
                                    key={fileType.id}
                                    className={`flex items-center gap-2 py-1.5 pr-8 pl-2 cursor-pointer rounded-sm transition-colors text-sm ${checked ? 'bg-ink-gray-8/10' : ''} hover:bg-surface-gray-3`}
                                    onClick={() => toggleFileType(fileType.id)}
                                >
                                    <Checkbox
                                        checked={checked}
                                        onCheckedChange={() => toggleFileType(fileType.id)}
                                        className={checked ? 'border-primary data-[state=checked]:bg-ink-gray-8 data-[state=checked]:text-ink-white' : ''}
                                    />
                                    <IconComponent className={`h-4 w-4 ${checked ? 'text-ink-gray-8' : 'text-ink-gray-4'}`} />
                                    <span>{fileType.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}