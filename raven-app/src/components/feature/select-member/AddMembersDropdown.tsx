import { Select, ChakraStylesConfig, OptionBase, Props, GroupBase } from 'chakra-react-select'
import { Controller, useFormContext } from 'react-hook-form'
import { SWRResponse, useFrappeGetCall } from 'frappe-react-sdk'
import { useMemo } from 'react'
import { generateColorHsl } from './GenerateAvatarColor'

export interface MemberOption extends OptionBase {
    value: string
    label: string
    image: string
    id: string
}

interface Member {
    name: string
    user_image: string
    full_name: string
}

export const AddMembersDropdown = ({ name, chakraStyles, ...props }: Props<MemberOption, false, GroupBase<MemberOption>>) => {

    const { data }: SWRResponse = useFrappeGetCall<{ message: Member[] }>('User', {
        fields: ['name', 'user_image', 'full_name'], filters: { enabled: 1 }
    })

    const memberOptions: MemberOption[] = useMemo(() => {
        if (data) {
            return data.message.map((user: Member) => ({
                value: user.name,
                label: user.full_name,
                image: user.user_image,
                id: user.name
            }))
        } else {
            return []
        }
    }, [data])

    const { control } = useFormContext()

    return (
        <Controller
            control={control}
            name={name ?? 'users'}
            render={({
                field: { onChange, onBlur, value, name, ref }
            }) => {
                const memberValue = memberOptions.find((u) => u.id === value)
                return (
                    <Select<MemberOption, false, GroupBase<MemberOption>>
                        name={name}
                        ref={ref}
                        onChange={(v) => onChange(v?.id)}
                        onBlur={onBlur}
                        value={memberValue}
                        chakraStyles={{ ...defaultStyles, ...chakraStyles }}
                        selectedOptionColor="transparent"
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
        marginRight: 3,
        height: 6,
        width: 6,
    },
})

export const fallbackPfp = (name: string) => ({
    alignItems: 'center',
    display: 'flex',
    ':before': {
        content: `"${initials(name)}"`,
        fontSize: '0.7rem',
        padding: '0.2rem',
        backgroundPosition: 'center',
        backgroundColor: `${generateColorHsl(name, saturationRange, lightnessRange)}`,
        backgroundSize: '100%',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        marginRight: 3,
        height: 6,
        width: 6,
    },
})

const defaultStyles: ChakraStylesConfig<MemberOption> = {
    control: (chakraStyles) => ({ ...chakraStyles, backgroundColor: 'white', width: '12rem', fontSize: 'sm' }),
    menu: (chakraStyles) => ({ ...chakraStyles, borderRadius: 'md', width: '12rem', borderWidth: '1px' }),
    menuList: (chakraStyles) => ({ ...chakraStyles, borderColor: 'transparent' }),
    dropdownIndicator: (chakraStyles) => ({ ...chakraStyles, bg: "transparent", cursor: "inherit", width: '2rem' }),
    clearIndicator: (chakraStyles) => ({ ...chakraStyles, bg: "transparent", cursor: "inherit", width: '2rem' }),
    option: (chakraStyles, { isSelected, data }) => ({
        ...chakraStyles, ...((data.image && { ...pfp(data.image) }) || { ...fallbackPfp(data.label) }), width: '12rem', fontSize: 'sm', ...(isSelected && {
            backgroundColor: "#E2E8F0",
            color: "black",
        })
    }),
    indicatorSeparator: (chakraStyles) => ({ ...chakraStyles, display: "none" }),
    input: (chakraStyles) => ({ ...chakraStyles }),
    singleValue: (chakraStyles, { data }) => ({ ...chakraStyles, ...((data.image && { ...pfp(data.image) }) || { ...fallbackPfp(data.label) }) }),
    noOptionsMessage: (chakraStyles) => ({ ...chakraStyles, width: '12rem', fontSize: 'sm' })
}