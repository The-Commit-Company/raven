import { Select, ChakraStylesConfig, OptionBase, Props, GroupBase } from 'chakra-react-select'
import { Controller, useFormContext } from 'react-hook-form'
import { useContext, useMemo } from 'react'
import { generateColorHsl } from './GenerateAvatarColor'
import { UserFields, UserListContext } from '@/utils/users/UserListProvider'

export interface MemberOption extends OptionBase {
    value: string
    label: string
    image: string
}

export const AddMembersDropdown = ({ name, chakraStyles, ...props }: Props<MemberOption, true, GroupBase<MemberOption>>) => {

    const users = useContext(UserListContext)

    const memberOptions: MemberOption[] = useMemo(() => {
        if (users) {
            return users.users.map((m: UserFields) => ({
                value: m.name,
                label: m.full_name,
                image: m.user_image ?? ''
            }))
        } else {
            return []
        }
    }, [users])

    const { control } = useFormContext()

    return (
        <Controller
            control={control}
            name={name ?? 'members'}
            render={({
                field: { onChange, onBlur, value, name, ref }
            }) => {
                const memberValue = memberOptions.find((u) => u.value === value)
                return (
                    <Select<MemberOption, true, GroupBase<MemberOption>>
                        name={name}
                        ref={ref}
                        isMulti
                        onChange={(value) => { onChange(value?.map((v) => v.value)) }}
                        onBlur={onBlur}
                        value={memberValue}
                        chakraStyles={{
                            dropdownIndicator: (provided) => ({
                                ...provided,
                                paddingLeft: 0,
                                marginLeft: 0,
                                marginRight: 1.5,
                                fontSize: '1.2rem',
                                paddingRight: 0,
                                backgroundColor: 'transparent',
                            }),
                            indicatorSeparator: (provided) => ({
                                ...provided,
                                display: "none"
                            }),
                            valueContainer: (provided) => ({
                                ...provided,
                                border: 'none',
                                paddingLeft: 1.5,
                                display: 'flex'
                            }),
                            container: (provided) => ({
                                ...provided,
                                width: '100%',
                            }),
                            ...defaultStyles
                        }}
                        options={memberOptions}
                        placeholder={props.placeholder ?? "ex. John, or lily@gmail.com"}
                        noOptionsMessage={() => ('No matches found - try using their email instead')}
                        {...props}
                    />
                )
            }} />
    )
}

function initials(name: string) {
    const [firstName, lastName] = name.split(" ")
    return firstName && lastName
        ? `${firstName.charAt(0)}${lastName.charAt(0)}`
        : firstName.charAt(0)
}

const saturationRange = [40, 60]
const lightnessRange = [60, 80]

export const pfp = (image: string) => ({
    alignItems: 'center',
    display: 'flex',
    ':before': {
        backgroundImage: `url(${image})`,
        backgroundPosition: 'center',
        backgroundSize: '100%',
        borderRadius: '50%',
        content: '" "',
        display: 'block',
        marginRight: 1.5,
        height: 6,
        width: 6,
    },
})

export const fallbackPfp = (name: string) => ({
    alignItems: 'center',
    display: 'flex',
    ':before': {
        content: `"${initials(name)}"`,
        fontSize: '0.6rem',
        padding: '0.2rem',
        backgroundPosition: 'center',
        backgroundColor: `${generateColorHsl(name, saturationRange, lightnessRange)}`,
        backgroundSize: '100%',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 1.5,
        height: 4,
        width: 4,
    },
})

const defaultStyles: ChakraStylesConfig<MemberOption> = {
    option: (chakraStyles, { isSelected, data }) => ({
        ...chakraStyles, ...((data.image && { ...pfp(data.image) }) || { ...fallbackPfp(data.label) }), fontSize: 'sm', ...(isSelected && {
            backgroundColor: "#E2E8F0",
            color: "black",
        })
    }),
    singleValue: (chakraStyles, { data }) => ({ ...chakraStyles, ...((data.image && { ...pfp(data.image) }) || { ...fallbackPfp(data.label) }) }),
}
