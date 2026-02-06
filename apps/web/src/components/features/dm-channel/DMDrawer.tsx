import { Button } from "@components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { useAtom } from "jotai"
import { X } from "lucide-react"
import { dmDrawerAtom } from "@utils/channelAtoms"
import { DMFilesDrawer } from "./DMFilesDrawer"
import { DMLinksDrawer } from "./DMLinksDrawer"

interface DMDrawerProps {
    channelId: string
}

export function DMDrawer({ channelId }: DMDrawerProps) {
    const [drawerType, setDrawerType] = useAtom(dmDrawerAtom(channelId))

    if (drawerType === "") {
        return null
    }

    const onTabChange = (value: string) => {
        setDrawerType(value as "files" | "links")
    }

    const handleClose = () => {
        setDrawerType("")
    }

    return (
        <div className="flex w-[380px] max-w-md shrink-0 flex-col border-l bg-background transition-all duration-300 self-stretch max-h-full min-h-0">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
                <Tabs value={drawerType} onValueChange={onTabChange} className="flex min-h-0 flex-1 flex-col">
                    <div className="mb-2 flex shrink-0 items-center justify-between">
                        <TabsList className="grid h-8 flex-1 grid-cols-2 gap-1 px-1">
                            <TabsTrigger value="files" className="h-6 text-xs">
                                Files
                            </TabsTrigger>
                            <TabsTrigger value="links" className="h-6 text-xs">
                                Links
                            </TabsTrigger>
                        </TabsList>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-7 w-7 shrink-0"
                            onClick={handleClose}
                            aria-label="Close drawer"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <TabsContent value="files" className="mt-0 h-full data-[state=inactive]:hidden">
                            <DMFilesDrawer />
                        </TabsContent>
                        <TabsContent value="links" className="mt-0 h-full data-[state=inactive]:hidden">
                            <DMLinksDrawer />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}
