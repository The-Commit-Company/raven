import { GroupedAvatars } from "@components/ui/grouped-avatars"
import { cn } from "@lib/utils"
import type { PollMessage } from "@raven/types/common/Message"
import type { RavenPollOption } from "@raven/types/RavenMessaging/RavenPollOption"
import { CheckCircle, ArrowUpRight } from "lucide-react"
import { ChannelIcon } from "../ChannelIcon/ChannelIcon"

type PollListItem = {
    name: string
    pollData: {
        poll: {
            creation: string
            name: string
            modified: string
            owner: string
            modified_by: string
            docstatus: 0 | 1 | 2
            question: string
            options: Array<{
                creation: string
                name: string
                modified: string
                owner: string
                modified_by: string
                docstatus: 0 | 1 | 2
                option: string
                votes: number
                voters: Array<{ id: string, name: string, image: string }>
            }>
            is_anonymous: 0 | 1
            is_multi_choice: 0 | 1
            is_disabled: 0 | 1
            total_votes: number
        }
        current_user_votes: Array<{ option: string }>
    }
    message: PollMessage
    channel_name: string
    channel_type: "Public" | "Private" | "Open"
    owner: string
    created_on: string
}

const POLLS: PollListItem[] = [
    {
        name: "Poll 1",
        pollData: {
            poll: {
                creation: "2024-01-01 10:00:00",
                name: "poll-1",
                modified: "2024-01-01 10:00:00",
                owner: "user@example.com",
                modified_by: "user@example.com",
                docstatus: 0 as 0 | 1 | 2,
                question: "What are we feeling for this month's book club selection?",
                options: [
                    {
                        creation: "2024-01-01 10:00:00",
                        name: "opt-1",
                        modified: "2024-01-01 10:00:00",
                        owner: "user@example.com",
                        modified_by: "user@example.com",
                        docstatus: 0 as 0 | 1 | 2,
                        option: "The Overstory",
                        votes: 5,
                        voters: [
                            { id: "1", name: "Alice", image: "https://randomuser.me/api/portraits/women/1.jpg" },
                            { id: "2", name: "Bob", image: "https://randomuser.me/api/portraits/men/2.jpg" },
                            { id: "3", name: "Carol", image: "https://randomuser.me/api/portraits/women/3.jpg" },
                            { id: "4", name: "Dave", image: "https://randomuser.me/api/portraits/men/4.jpg" },
                            { id: "5", name: "Eve", image: "https://randomuser.me/api/portraits/women/5.jpg" },
                        ],
                    },
                    {
                        creation: "2024-01-01 10:00:00",
                        name: "opt-2",
                        modified: "2024-01-01 10:00:00",
                        owner: "user@example.com",
                        modified_by: "user@example.com",
                        docstatus: 0 as 0 | 1 | 2,
                        option: "The Nature Fix",
                        votes: 2,
                        voters: [
                            { id: "6", name: "Frank", image: "https://randomuser.me/api/portraits/men/6.jpg" },
                            { id: "7", name: "Grace", image: "https://randomuser.me/api/portraits/women/7.jpg" },
                        ],
                    },
                    {
                        creation: "2024-01-01 10:00:00",
                        name: "opt-3",
                        modified: "2024-01-01 10:00:00",
                        owner: "user@example.com",
                        modified_by: "user@example.com",
                        docstatus: 0 as 0 | 1 | 2,
                        option: "The Hidden Life of Trees",
                        votes: 0,
                        voters: [],
                    },
                ],
                is_anonymous: 0 as 0 | 1,
                is_multi_choice: 0 as 0 | 1,
                is_disabled: 0 as 0 | 1,
                total_votes: 7,
            },
            current_user_votes: [{ option: "opt-1" }]
        },
        message: {
            name: "msg-1",
            message_type: "Poll",
            poll_id: "poll-1",
            content: "What are we feeling for this month's book club selection?",
        } as PollMessage,
        channel_name: "Book Club",
        channel_type: "Public",
        owner: "John Doe",
        created_on: "01-09-2021",
    },
    {
        name: "Poll 2",
        pollData: {
            poll: {
                creation: "2024-01-02 14:30:00",
                name: "poll-2",
                modified: "2024-01-02 14:30:00",
                owner: "user@example.com",
                modified_by: "user@example.com",
                docstatus: 0 as 0 | 1 | 2,
                question: "What's your favorite programming language for building scalable web applications and why do you think it's the best choice for modern development teams working on complex enterprise projects?",
                options: [
                    {
                        creation: "2024-01-02 14:30:00",
                        name: "opt-4",
                        modified: "2024-01-02 14:30:00",
                        owner: "user@example.com",
                        modified_by: "user@example.com",
                        docstatus: 0 as 0 | 1 | 2,
                        option: "TypeScript",
                        votes: 8,
                        voters: [
                            { id: "1", name: "Alice", image: "https://randomuser.me/api/portraits/women/1.jpg" },
                            { id: "2", name: "Bob", image: "https://randomuser.me/api/portraits/men/2.jpg" },
                            { id: "3", name: "Carol", image: "https://randomuser.me/api/portraits/women/3.jpg" },
                            { id: "4", name: "Dave", image: "https://randomuser.me/api/portraits/men/4.jpg" },
                            { id: "5", name: "Eve", image: "https://randomuser.me/api/portraits/women/5.jpg" },
                            { id: "6", name: "Frank", image: "https://randomuser.me/api/portraits/men/6.jpg" },
                            { id: "7", name: "Grace", image: "https://randomuser.me/api/portraits/women/7.jpg" },
                            { id: "8", name: "Henry", image: "https://randomuser.me/api/portraits/men/8.jpg" },
                        ],
                    },
                    {
                        creation: "2024-01-02 14:30:00",
                        name: "opt-5",
                        modified: "2024-01-02 14:30:00",
                        owner: "user@example.com",
                        modified_by: "user@example.com",
                        docstatus: 0 as 0 | 1 | 2,
                        option: "Python",
                        votes: 3,
                        voters: [
                            { id: "9", name: "Ivy", image: "https://randomuser.me/api/portraits/women/9.jpg" },
                            { id: "10", name: "Jack", image: "https://randomuser.me/api/portraits/men/10.jpg" },
                            { id: "11", name: "Kate", image: "https://randomuser.me/api/portraits/women/11.jpg" },
                        ],
                    },
                    {
                        creation: "2024-01-02 14:30:00",
                        name: "opt-6",
                        modified: "2024-01-02 14:30:00",
                        owner: "user@example.com",
                        modified_by: "user@example.com",
                        docstatus: 0 as 0 | 1 | 2,
                        option: "JavaScript",
                        votes: 2,
                        voters: [
                            { id: "12", name: "Liam", image: "https://randomuser.me/api/portraits/men/12.jpg" },
                            { id: "13", name: "Mia", image: "https://randomuser.me/api/portraits/women/13.jpg" },
                        ],
                    },
                ],
                is_anonymous: 0 as 0 | 1,
                is_multi_choice: 0 as 0 | 1,
                is_disabled: 0 as 0 | 1,
                total_votes: 13,
            },
            current_user_votes: [{ option: "opt-4" }]
        },
        message: {
            name: "msg-2",
            message_type: "Poll",
            poll_id: "poll-2",
            content: "What's your favorite programming language for building scalable web applications and why do you think it's the best choice for modern development teams working on complex enterprise projects?",
        } as PollMessage,
        channel_name: "Tech Team",
        channel_type: "Private",
        owner: "Sarah Wilson",
        created_on: "02-09-2021",
    },
    {
        name: "Poll 3",
        pollData: {
            poll: {
                creation: "2024-01-03 09:15:00",
                name: "poll-3",
                modified: "2024-01-03 09:15:00",
                owner: "user@example.com",
                modified_by: "user@example.com",
                docstatus: 0 as 0 | 1 | 2,
                question: "Lunch preference?",
                options: [
                    {
                        creation: "2024-01-03 09:15:00",
                        name: "opt-7",
                        modified: "2024-01-03 09:15:00",
                        owner: "user@example.com",
                        modified_by: "user@example.com",
                        docstatus: 0 as 0 | 1 | 2,
                        option: "Pizza",
                        votes: 4,
                        voters: [
                            { id: "1", name: "Alice", image: "https://randomuser.me/api/portraits/women/1.jpg" },
                            { id: "2", name: "Bob", image: "https://randomuser.me/api/portraits/men/2.jpg" },
                            { id: "3", name: "Carol", image: "https://randomuser.me/api/portraits/women/3.jpg" },
                            { id: "4", name: "Dave", image: "https://randomuser.me/api/portraits/men/4.jpg" },
                        ],
                    },
                    {
                        creation: "2024-01-03 09:15:00",
                        name: "opt-8",
                        modified: "2024-01-03 09:15:00",
                        owner: "user@example.com",
                        modified_by: "user@example.com",
                        docstatus: 0 as 0 | 1 | 2,
                        option: "Sushi",
                        votes: 3,
                        voters: [
                            { id: "5", name: "Eve", image: "https://randomuser.me/api/portraits/women/5.jpg" },
                            { id: "6", name: "Frank", image: "https://randomuser.me/api/portraits/men/6.jpg" },
                            { id: "7", name: "Grace", image: "https://randomuser.me/api/portraits/women/7.jpg" },
                        ],
                    },
                    {
                        creation: "2024-01-03 09:15:00",
                        name: "opt-9",
                        modified: "2024-01-03 09:15:00",
                        owner: "user@example.com",
                        modified_by: "user@example.com",
                        docstatus: 0 as 0 | 1 | 2,
                        option: "Salad",
                        votes: 1,
                        voters: [
                            { id: "8", name: "Henry", image: "https://randomuser.me/api/portraits/men/8.jpg" },
                        ],
                    },
                ],
                is_anonymous: 0 as 0 | 1,
                is_multi_choice: 0 as 0 | 1,
                is_disabled: 0 as 0 | 1,
                total_votes: 8,
            },
            current_user_votes: []
        },
        message: {
            name: "msg-3",
            message_type: "Poll",
            poll_id: "poll-3",
            content: "Lunch preference?",
        } as PollMessage,
        channel_name: "General",
        channel_type: "Open",
        owner: "Mike Johnson",
        created_on: "03-09-2021",
    },
]

const search_text = "abc"

const PollOptionBar = ({ option, percentage, isCurrentUserVote }: { option: RavenPollOption & { voters?: { id: string, name: string, image: string }[] }, percentage: number, isCurrentUserVote: boolean }) => {
    // Show a minimal bar (2%) for 0 votes
    const barWidth = percentage > 0 ? percentage : 2
    return (
        <div className="relative flex items-center min-h-[1.25rem] rounded-md overflow-hidden group mb-1">
            <div className={"absolute top-0 left-0 h-full w-full transition-all duration-300 ease-in-out rounded-md"} />

            <div
                className={cn(
                    "absolute top-0 left-0 h-full bg-gray-100",
                    "transition-all duration-300 ease-in-out rounded-md",
                )}
                style={{
                    width: `${barWidth}%`
                }}
            />

            <div className="relative z-10 flex items-center flex-1 px-4 py-1.5 gap-2">
                <span className={cn("truncate text-[13px]", isCurrentUserVote ? "text-gray-900 font-medium" : "text-gray-700")}>
                    {option.option}
                </span>
                {isCurrentUserVote && <CheckCircle className="w-3 h-3" />}
            </div>

            <div className="relative z-10 flex items-center gap-3 pr-4">
                {option.votes !== undefined && (
                    <span className="text-xs text-muted-foreground font-medium">
                        {option.votes} vote{option.votes === 1 ? "" : "s"} • <span className="text-[11px]">{percentage.toFixed(0)}%</span>
                    </span>
                )}
                {option.voters && option.voters.length > 0 && <GroupedAvatars users={option.voters} max={5} size="xs" />}
            </div>
        </div>
    )
}

const SearchResultsPolls = () => {
    return (
        <div className="w-full">
            {POLLS.length === 0 ? (
                <div className="text-muted-foreground text-sm p-4 text-center">
                    No polls found with a name containing <strong>{search_text}</strong>
                </div>
            ) : (
                <div className="space-y-3 max-w-xl">
                    {POLLS.map((pollItem) => (
                        <div
                            key={pollItem.name}
                            className={cn(
                                "group flex flex-col items-start gap-1 p-4 rounded-lg border border-border/60 transition-all duration-200",
                                "hover:bg-muted/30 hover:border-foreground/20",
                                "focus-within:bg-muted/30 focus-within:border-foreground/20",
                                "cursor-pointer"
                            )}
                            tabIndex={0}
                            role="button"
                            aria-label={`View ${pollItem.name}'s poll`}>
                            {/* Channel Info */}
                            <div className="flex mb-1 text-muted-foreground/90 items-center gap-1">
                                <ChannelIcon type={pollItem.channel_type as "Public" | "Private" | "Open"} />
                                <span className="text-xs font-medium">{pollItem.channel_name}</span>
                                <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                            </div>
                            {/* Question */}
                            <div className="font-medium mb-2 text-sm w-full">{pollItem.pollData.poll.question}</div>
                            {/* Options */}
                            <div className="flex flex-col gap-1 mb-2 w-full">
                                {pollItem.pollData.poll.options.map((option) => {
                                    const totalVotes = pollItem.pollData.poll.total_votes
                                    const percentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0
                                    const isCurrentUserVote = pollItem.pollData.current_user_votes.some((vote) => vote.option === option.name)
                                    return (
                                        <PollOptionBar
                                            key={option.name}
                                            option={option}
                                            percentage={percentage}
                                            isCurrentUserVote={isCurrentUserVote}
                                        />
                                    )
                                })}
                            </div>
                            {/* Total votes */}
                            <div className="flex items-center justify-start w-full">
                                <span className="text-xs text-muted-foreground/80">Total votes: {pollItem.pollData.poll.total_votes}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SearchResultsPolls
