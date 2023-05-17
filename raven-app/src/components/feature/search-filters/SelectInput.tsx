import { GroupBase, OptionBase, Select, Props, ChakraStylesConfig } from 'chakra-react-select';
import { ReactNode } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export interface SelectOption extends OptionBase {
    value: string,
    label: ReactNode,
    is_archived?: number
}

interface SelectInputProps extends Props<SelectOption, true, GroupBase<SelectOption>> {
    requiredRule?: boolean | string,
    options: any[]
}

export const SelectInput = ({ requiredRule, options, chakraStyles, ...props }: SelectInputProps) => {
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
                            ...chakraStyles
                        }}
                        selectedOptionStyle='color'
                        hideSelectedOptions={false}
                        options={options}
                        placeholder={props.placeholder ?? "Select ..."}
                        {...props}
                    />
                )
            }} />
    )
}

const defaultStyles: ChakraStylesConfig<SelectOption> = {
    control: (chakraStyles) => ({ ...chakraStyles, width: '14rem', fontSize: 'sm', maxHeight: '2rem', position: 'relative' }),
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
    noOptionsMessage: (chakraStyles) => ({ ...chakraStyles, width: '14rem', fontSize: 'sm' }),
    indicatorsContainer: (chakraStyles) => ({ ...chakraStyles, bg: "transparent", cursor: "inherit", width: '2rem', maxHeight: '2rem', position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', }),
    multiValue: (chakraStyles) => ({ ...chakraStyles, display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '0rem 0.2rem 0rem 0.2rem' }),
    valueContainer: (chakraStyles) => ({ ...chakraStyles, display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }),
}