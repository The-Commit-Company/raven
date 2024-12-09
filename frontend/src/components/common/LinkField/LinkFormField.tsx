import { Controller, ControllerProps, useFormContext } from 'react-hook-form'
import LinkField, { LinkFieldProps } from './LinkField'

interface LinkFormFieldProps extends Omit<LinkFieldProps, 'value' | 'setValue'> {
    name: string,
    rules?: ControllerProps['rules'],
    disabled?: boolean
}

const LinkFormField = ({ name, rules, ...linkFieldProps }: LinkFormFieldProps) => {

    const { control } = useFormContext()
    return (
        <Controller
            name={name}
            control={control}
            disabled={linkFieldProps.disabled}
            rules={rules}
            render={({ field }) => (
                <LinkField
                    value={field.value}
                    disabled={field.disabled}
                    setValue={field.onChange}
                    {...linkFieldProps}
                />
            )}
        />
    )
}

export default LinkFormField