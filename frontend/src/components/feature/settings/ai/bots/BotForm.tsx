import { Box, Tabs } from '@radix-ui/themes'
import { LuSquareFunction, LuSparkles } from 'react-icons/lu'
import InstructionField from '../InstructionField'
import { BiBot, BiCode, BiFile } from 'react-icons/bi'
import GeneralBotForm from './GeneralBotForm'
import BotFunctionsForm from './BotFunctionsForm'
import { useFormContext } from 'react-hook-form'
import { RavenBot } from '@/types/RavenBot/RavenBot'
import BotDocs from './BotDocs'
import BotFileSources from './BotFileSources'
import AIFeaturesBotForm from './AIFeaturesBotForm'
import { BotDocumentProcessorsForm } from './BotDocumentProcessorsForm'

const ICON_PROPS = {
    size: 18,
    className: 'mr-1.5'
}

const BotForm = ({ isEdit }: { isEdit: boolean }) => {

    const { watch } = useFormContext<RavenBot>()
    const isAiBot = watch('is_ai_bot') ? true : false
    return (
        <Tabs.Root defaultValue='general'>
            <Tabs.List>
                <Tabs.Trigger value='general'><BiBot {...ICON_PROPS} /> General</Tabs.Trigger>
                {isAiBot ? <Tabs.Trigger value='ai'><LuSparkles {...ICON_PROPS} /> AI</Tabs.Trigger> : null}
                {isAiBot ? <Tabs.Trigger value='instructions'><BiFile {...ICON_PROPS} /> Instructions</Tabs.Trigger> : null}
                {isAiBot ? <Tabs.Trigger value='functions'><LuSquareFunction {...ICON_PROPS} /> Functions</Tabs.Trigger> : null}
                {isAiBot ? <Tabs.Trigger value='document-processors'><BiFile {...ICON_PROPS} /> Document Processors</Tabs.Trigger> : null}
                {isAiBot ? <Tabs.Trigger value='file-sources'><BiFile {...ICON_PROPS} /> Files</Tabs.Trigger> : null}
                {isEdit ? <Tabs.Trigger value='api-docs'><BiCode {...ICON_PROPS} /> API Docs</Tabs.Trigger> : null}
            </Tabs.List>
            <Box pt='4'>
                <Tabs.Content value='general'>
                    <GeneralBotForm />
                </Tabs.Content>
                <Tabs.Content value='ai'>
                    <AIFeaturesBotForm />
                </Tabs.Content>
                <Tabs.Content value='instructions'>
                    <InstructionField allowUsingTemplate instructionRequired={isAiBot ? true : false} />
                </Tabs.Content>
                <Tabs.Content value='functions'>
                    <BotFunctionsForm />
                </Tabs.Content>
                <Tabs.Content value='document-processors'>
                    <BotDocumentProcessorsForm />
                </Tabs.Content>
                <Tabs.Content value='file-sources'>
                    <BotFileSources />
                </Tabs.Content>
                <Tabs.Content value='api-docs'>
                    <BotDocs />
                </Tabs.Content>

            </Box>
        </Tabs.Root>
    )
}

export default BotForm