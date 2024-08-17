

import { useCombobox } from "downshift";
import { Filter, SearchResult, useSearch } from "frappe-react-sdk";
import { useState } from "react";
import { Label } from "../Form";
import { Text, TextField } from "@radix-ui/themes";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import clsx from "clsx";

export interface LinkFieldProps {
    doctype: string;
    filters?: Filter[];
    label?: string,
    placeholder?: string,
    value: string,
    setValue: (value: string) => void,
    disabled?: boolean,
    autofocus?: boolean
}


const LinkField = ({ doctype, filters, label, placeholder, value, setValue, disabled, autofocus }: LinkFieldProps) => {

    const [searchText, setSearchText] = useState('')

    const isDesktop = useIsDesktop()

    const { data } = useSearch(doctype, searchText, filters)

    const items: SearchResult[] = data?.message ?? []

    const {
        isOpen,
        // getToggleButtonProps,
        getLabelProps,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        selectedItem,
    } = useCombobox({
        onInputValueChange({ inputValue }) {
            setSearchText(inputValue ?? '')
        },
        items: items,
        itemToString(item) {
            return item ? item.value : ''
        },
        selectedItem: items.find(item => item.value === value),
        onSelectedItemChange({ selectedItem }) {
            setValue(selectedItem?.value ?? '')
        },
    })

    return <div className="w-full">
        <div className="flex flex-col gap-1">
            <Label className="w-fit" {...getLabelProps()}>
                {label}
            </Label>
            <TextField.Root
                placeholder={placeholder ?? `Search ${doctype}`}
                className='w-full'
                disabled={disabled}
                autoFocus={isDesktop && autofocus}
                {...getInputProps()}
            >

            </TextField.Root>
        </div>
        <ul
            className={`sm:w-[550px] w-[24rem] absolute bg-background rounded-b-md mt-1 shadow-md z-[9999] max-h-96 overflow-scroll p-0 ${!(isOpen && items.length) && 'hidden'
                }`}
            {...getMenuProps()}
        >
            {isOpen &&
                items.map((item, index) => (
                    <li
                        className={clsx(
                            highlightedIndex === index && 'bg-accent-4',
                            selectedItem === item && 'font-bold',
                            'py-2 px-3 shadow-sm flex gap-2 items-center',
                        )}
                        key={`${item.value}`}
                        {...getItemProps({ item, index })}
                    >
                        <div className='flex flex-col'>
                            <Text as='span' weight='medium' size='2'>{item.label ?? item.value}</Text>
                            <Text as='span' size='1' color='gray'>{item.description}</Text>
                        </div>

                    </li>
                ))}
        </ul>
    </div>
}

export default LinkField