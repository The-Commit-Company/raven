import { GroupBase, OptionBase, Select, Props, ChakraStylesConfig } from 'chakra-react-select';
import { ReactNode } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export interface SelectOption extends OptionBase {
    value: string,
    label: ReactNode
}

interface SelectInputProps extends Props<SelectOption, true, GroupBase<SelectOption>> {
    requiredRule?: boolean | string,
    options: any[]
}

export const SelectInput = ({ requiredRule, options, ...props }: SelectInputProps) => {
    const { control } = useFormContext()
    return (
        <Controller
            control={control}
            name={props.name ?? "name"}
            rules={{ required: requiredRule }}
            render={({
                field: { onChange, onBlur, value, name, ref }
            }) => {
                return (
                    <Select<SelectOption, true, GroupBase<SelectOption>>
                        name={name}
                        ref={ref}
                        onChange={(v) => onChange(v)}
                        onBlur={onBlur}
                        value={value}
                        chakraStyles={{
                            ...defaultStyles,
                            dropdownIndicator: (provided) => ({
                                ...provided,
                                bg: "transparent",
                                px: 2,
                                cursor: "inherit"
                            }),
                            indicatorSeparator: (provided) => ({
                                ...provided,
                                display: "none"
                            }),
                            ...props.chakraStyles
                        }}
                        selectedOptionStyle="check"
                        options={options}
                        placeholder={props.placeholder ?? "Select ..."}
                        {...props}
                    />
                )
            }} />
    )
}

const defaultStyles: ChakraStylesConfig<SelectOption> = {
    control: (chakraStyles) => ({ ...chakraStyles, width: '14rem', fontSize: 'sm' }),
    menu: (chakraStyles) => ({ ...chakraStyles, borderRadius: 'md', width: '14rem', borderWidth: '1px' }),
    menuList: (chakraStyles) => ({ ...chakraStyles, borderColor: 'transparent' }),
    dropdownIndicator: (chakraStyles) => ({ ...chakraStyles, bg: "transparent", cursor: "inherit", width: '2rem' }),
    clearIndicator: (chakraStyles) => ({ ...chakraStyles, bg: "transparent", cursor: "inherit", width: '2rem' }),
    option: (chakraStyles, { isSelected }) => ({
        ...chakraStyles, width: '14rem', fontSize: 'sm', ...(isSelected && {
        })
    }),
    indicatorSeparator: (chakraStyles) => ({ ...chakraStyles, display: "none" }),
    input: (chakraStyles) => ({ ...chakraStyles }),
    noOptionsMessage: (chakraStyles) => ({ ...chakraStyles, width: '14rem', fontSize: 'sm' })
}