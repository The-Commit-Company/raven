import { FileText, Image, FileSpreadsheet, Presentation, ChevronDown } from 'lucide-react';
import { FilterComponentProps } from './types';
import { updateFilter } from './utils';
import { Label } from '@components/ui/label';
import { Checkbox } from '@components/ui/checkbox';
import { Button } from '@components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import React from 'react';

const FILE_TYPE_OPTIONS = [
    { id: 'pdf', label: 'PDFs', icon: FileText },
    { id: 'doc', label: 'Documents', icon: FileText },
    { id: 'ppt', label: 'Presentations', icon: Presentation },
    { id: 'xls', label: 'Spreadsheets', icon: FileSpreadsheet },
    { id: 'image', label: 'Images', icon: Image },
];

export function FileTypeFilter({ filters, onFiltersChange }: FilterComponentProps) {
    const selected = filters.fileType || [];
    const checkedCount = selected.length;
    const [open, setOpen] = React.useState(false);

    const toggleFileType = (id: string) => {
        let newSelected: string[];
        if (selected.includes(id)) {
            newSelected = selected.filter((ft) => ft !== id);
        } else {
            newSelected = [...selected, id];
        }
        updateFilter(filters, 'fileType', newSelected, onFiltersChange);
    };

    return (
        <div className="w-full">
            <Label className="text-xs text-muted-foreground mb-1 block">File types</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full h-9 pl-3 pr-2 flex justify-between items-center text-left font-normal border bg-background"
                        role="combobox"
                        aria-expanded={open}
                    >
                        <span className="truncate text-sm pl-1">
                            {checkedCount === 0 ? 'File Type' : checkedCount === 1 ? '1 File Type' : `${checkedCount} File Types`}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto min-w-[var(--radix-popover-trigger-width)] max-w-[320px] p-0" align="start">
                    <div className="py-1 px-1 max-h-64 overflow-y-auto">
                        {FILE_TYPE_OPTIONS.map((fileType) => {
                            const IconComponent = fileType.icon;
                            const checked = selected.includes(fileType.id);
                            return (
                                <div
                                    key={fileType.id}
                                    className={`flex items-center gap-2 py-1.5 pr-8 pl-2 cursor-pointer rounded-sm transition-colors text-sm ${checked ? 'bg-primary/10' : ''} hover:bg-accent`}
                                    onClick={() => toggleFileType(fileType.id)}
                                >
                                    <Checkbox
                                        checked={checked}
                                        onCheckedChange={() => toggleFileType(fileType.id)}
                                        className={checked ? 'border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground' : ''}
                                    />
                                    <IconComponent className={`h-4 w-4 ${checked ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span>{fileType.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}