import { Stack } from '@/components/layout/Stack'
import InstructionField from './InstructionField'
import { useFormContext } from 'react-hook-form'
import { RavenBotInstructionTemplate } from '@/types/RavenAI/RavenBotInstructionTemplate'
import { Box, TextField } from '@radix-ui/themes'
import { ErrorText, Label } from '@/components/common/Form'
import AINotEnabledCallout from './AINotEnabledCallout'

type Props = {
    isEdit?: boolean
}

const InstructionTemplateForm = ({ isEdit }: Props) => {

    const { register, formState: { errors } } = useFormContext<RavenBotInstructionTemplate>()
    return (
        <Stack gap='4'>
            <AINotEnabledCallout />
            <Stack maxWidth={'480px'}>
                <Box>
                    <Label htmlFor='template_name' isRequired>Template Name</Label>
                    <TextField.Root
                        readOnly={isEdit}
                        autoFocus={!isEdit}
                        id='template_name'
                        {...register('template_name', {
                            required: 'Name is required',
                        })}
                        placeholder="Create Document Template"
                        aria-invalid={errors.template_name ? 'true' : 'false'}
                    />
                </Box>
                {errors.template_name && <ErrorText>{errors.template_name?.message}</ErrorText>}
            </Stack>

            <InstructionField autoFocus={isEdit} />
        </Stack>
    )
}

export default InstructionTemplateForm