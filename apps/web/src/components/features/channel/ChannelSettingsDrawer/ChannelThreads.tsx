import { Badge } from "@components/ui/badge"
import { Hash } from "lucide-react"

const ChannelThreads = () => {
    return (
        <div className="space-y-4" >
            <h3 className="font-semibold text-sm">Linked threads</h3>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Front-end</span>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        4
                    </Badge>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">UI-kit design standards</span>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default ChannelThreads