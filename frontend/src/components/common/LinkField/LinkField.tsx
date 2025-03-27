

import { useCombobox } from "downshift";
import { Filter, SearchResult, useSearch } from "frappe-react-sdk";
import { useState } from "react";
import { Label } from "../Form";
import { Text, TextField, VisuallyHidden } from "@radix-ui/themes";
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
    autofocus?: boolean,
    dropdownClass?: string,
    required?: boolean,
    suggestedItems?: SearchResult[],
    hideLabel?: boolean
}


const LinkField = ({ doctype, filters, hideLabel = false, label, placeholder, value, required, setValue, disabled, autofocus, dropdownClass, suggestedItems }: LinkFieldProps) => {

    const [searchText, setSearchText] = useState(value ?? '')

    const isDesktop = useIsDesktop()

    const { data } = useSearch(doctype, searchText, filters)

    const items: SearchResult[] = [...(suggestedItems ?? []), ...(data?.message ?? [])]

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
            if (!inputValue) {
                setValue('')
            }
        },
        items: items,
        itemToString(item) {
            return item ? item.value : ''
        },
        onSelectedItemChange({ selectedItem }) {

            setValue(selectedItem?.value ?? '')
        },
        defaultInputValue: value,
        defaultSelectedItem: items.find(item => item.value === value),
    })

    return <div className="w-full">
        <div className="flex flex-col">
            {hideLabel ? <VisuallyHidden>
                <Label isRequired={required} {...getLabelProps()}></Label>
            </VisuallyHidden> :
                <Label className="w-fit" isRequired={required} {...getLabelProps()}>
                    {label}
                </Label>
            }
            <TextField.Root
                placeholder={placeholder ?? `Search ${doctype}`}
                className='w-full'
                disabled={disabled}
                autoFocus={isDesktop && autofocus}
                {...getInputProps()}
            >

            </TextField.Root>
        </div>
        {isOpen && !items.length && (
            <div
                className={clsx(`p-2 sm:w-[550px] w-[24rem] absolute bg-background rounded-b-md mt-1 shadow-md z-[9999] max-h-96 overflow-scroll`, dropdownClass)}>
                <Text as='span' size='2' color='gray'>No results found</Text>
            </div>
        )}
        <ul
            className={clsx(`sm:w-[550px] w-[24rem] absolute bg-background rounded-b-md mt-1 shadow-md z-[9999] max-h-96 overflow-scroll p-0 ${!(isOpen && items.length) && 'hidden'
                }`, dropdownClass)}
            {...getMenuProps()}
        >
            {isOpen &&
                items.map((item, index) => (
                    <li
                        className={clsx(
                            highlightedIndex === index && 'bg-gray-3 dark:bg-gray-4',
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