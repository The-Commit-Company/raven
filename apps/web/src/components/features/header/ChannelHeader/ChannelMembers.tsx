import { GroupedAvatars } from "@components/ui/grouped-avatars"

const ChannelMembers = () => {

    const users = [
        { id: "1", name: "Alex Johnson", image: "https://github.com/shadcn.png" },
        { id: "2", name: "Sam Smith", image: undefined },
        { id: "3", name: "Taylor Reed", image: undefined },
        { id: "4", name: "John Doe", image: "https://github.com/shadcn.png" },
        { id: "5", name: "Jane Smith", image: "https://github.com/shadcn.png" },
        { id: "6", name: "Michael Brown", image: "https://github.com/shadcn.png" },
        { id: "7", name: "Emily Davis", image: "https://github.com/shadcn.png" },
        { id: "8", name: "Daniel Wilson", image: "https://github.com/shadcn.png" },
        { id: "9", name: "Olivia Moore", image: "https://github.com/shadcn.png" },
    ]

    return (
        <GroupedAvatars size="sm" users={users} />
    )
}

export default ChannelMembers