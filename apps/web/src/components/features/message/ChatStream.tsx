import DateSeparator from "./renderers/DateSeparator"
import TextMessage from "./renderers/TextMessage"
import ThreadMessage from "./renderers/ThreadMessage"
import PollMessage from "./renderers/PollMessage"
import SystemMessage from "./renderers/SystemMessage"


const dummyUser1 = {
    name: "Desirae Lipshutz",
    full_name: "Desirae Lipshutz",
    user_image: "/placeholder.svg?height=32&width=32",
    type: "User" as const
}

const dummyUser2 = {
    name: "Brandon Franci",
    full_name: "Brandon Franci",
    user_image: "/placeholder.svg?height=32&width=32",
    type: "User" as const
}

const dummyParticipants = [
    {
        name: "Desirae Lipshutz",
        full_name: "Desirae Lipshutz",
        user_image: "https://randomuser.me/api/portraits/women/65.jpg",
        type: "User" as const
    },
    {
        name: "Brandon Franci",
        full_name: "Brandon Franci",
        user_image: "https://randomuser.me/api/portraits/men/32.jpg",
        type: "User" as const
    },
    {
        name: "Alfonso Vaccarol",
        full_name: "Alfonso Vaccarol",
        user_image: "https://randomuser.me/api/portraits/men/85.jpg",
        type: "User" as const
    }
]

const dummyPoll = {
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
}

const dummyCurrentUserVotes = [{ option: "opt-1" }]

const dummyPoll2 = {
    creation: "2024-01-02 14:30:00",
    name: "poll-2",
    modified: "2024-01-02 14:30:00",
    owner: "user@example.com",
    modified_by: "user@example.com",
    docstatus: 0 as 0 | 1 | 2,
    question: "What's your favorite programming language for building scalable web applications?",
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
}

const dummyCurrentUserVotes2 = [{ option: "opt-4" }]

const dummyPoll3 = {
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
}

const dummyCurrentUserVotes3: Array<{ option: string }> = []

export default function ChatStream() {
    return (
        <div className="flex flex-col p-4 h-full overflow-y-auto">

            <DateSeparator label="10th November 2023" />

            <SystemMessage message="Desirae Lipshutz created this channel" time="05:27" />
            <SystemMessage message="Desirae Lipshutz added Brandon Franci, Alfonso Vaccarol and 3 others to this channel" time="05:29" />

            <TextMessage
                user={dummyUser1}
                message="Hi, everyone!"
                time="08:00 PM"
            />

            <DateSeparator label="Today" />

            <TextMessage
                user={dummyUser1}
                message="Hello, everyone! ⭐ How's everyone doing today? I hope you're all having a fantastic day!"
                time="07:20 PM"
            />

            <ThreadMessage
                user={dummyUser2}
                message="Hi, everyone! I'd like to start this thread to discuss social media marketing."
                time="07:40 PM"
                threadTitle="Social Media Marketing Strategies"
                threadSummary="3 Messages View threads"
                messageCount={3}
                participants={dummyParticipants}
            />

            <TextMessage user={dummyUser1} message="Sounds great! Looking forward to the discussion." time="07:42 PM" />

            <DateSeparator label="Yesterday" />

            <TextMessage
                user={dummyUser2}
                message="Welcome, @Alfonso Vaccarol. We're glad to have you join us"
                time="10:09 AM"
            />

            <PollMessage poll={dummyPoll} currentUserVotes={dummyCurrentUserVotes} />
            <PollMessage poll={dummyPoll2} currentUserVotes={dummyCurrentUserVotes2} />
            <PollMessage poll={dummyPoll3} currentUserVotes={dummyCurrentUserVotes3} />
        </div>
    )
}
