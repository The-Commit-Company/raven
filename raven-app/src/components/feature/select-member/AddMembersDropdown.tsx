import { Select, ChakraStylesConfig, OptionBase, Props, GroupBase } from 'chakra-react-select'
import { Controller, useFormContext } from 'react-hook-form'
import { useFrappeGetDocList } from 'frappe-react-sdk'
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

export const AddMembersDropdown = ({ name, chakraStyles, ...props }: Props<MemberOption, true, GroupBase<MemberOption>>) => {

    const { data } = useFrappeGetDocList<{ name: string, user_image: string, full_name: string }>('User', {
        fields: ["name", "user_image", "full_name"]
    })

    const memberOptions: MemberOption[] = useMemo(() => {
        if (data) {
            return data.map((m: Member) => ({
                value: m.name,
                label: m.full_name,
                image: m.user_image,
                id: m.name
            }))
        } else {
            return []
        }
    }, [data])

    const { control } = useFormContext()

    return (
        <Controller
            control={control}
            name={name ?? 'members'}
            render={({
                field: { onChange, onBlur, value, name, ref }
            }) => {
                const memberValue = memberOptions.find((u) => u.id === value)
                return (
                    <Select<MemberOption, true, GroupBase<MemberOption>>
                        name={name}
                        ref={ref}
                        isMulti
                        onChange={(value) => { onChange(value?.map((v) => v.id)) }}
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
        fontSize: '0.6rem',
        padding: '0.2rem',
        backgroundPosition: 'center',
        backgroundColor: `${generateColorHsl(name, saturationRange, lightnessRange)}`,
        backgroundSize: '100%',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 3,
        height: 4,
        width: 4,
    },
})

const defaultStyles: ChakraStylesConfig<MemberOption> = {
    control: (chakraStyles) => ({ ...chakraStyles, backgroundColor: 'transparent', width: '12rem', fontSize: 'sm' }),
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