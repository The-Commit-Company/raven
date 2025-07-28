import DateSeparator from "./renderers/DateSeparator"
import TextMessage from "./renderers/TextMessage"
import ThreadMessage from "./renderers/ThreadMessage"
import PollMessage from "./renderers/PollMessage"
import SystemMessage from "./renderers/SystemMessage"
import ReplyMessage from "./renderers/ReplyMessage"
import ImageMessage from "./renderers/ImageMessage"


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

const dummyImages = [
    {
        name: "img-1",
        file_name: "team_photo.jpg",
        file_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
        file_size: "2.4 MB",
        file_type: "jpg",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=225&fit=crop"
    },
    {
        name: "img-2",
        file_name: "design_mockup.png",
        file_url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=600&fit=crop",
        file_size: "1.8 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=300&h=225&fit=crop"
    },
    {
        name: "img-3",
        file_name: "screenshot.png",
        file_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
        file_size: "3.2 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=225&fit=crop"
    },
    {
        name: "img-4",
        file_name: "presentation.jpg",
        file_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop",
        file_size: "4.1 MB",
        file_type: "jpg",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=225&fit=crop"
    }
]

const dummyTwoImages = [
    {
        name: "img-2a",
        file_name: "before.jpg",
        file_url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop",
        file_size: "1.8 MB",
        file_type: "jpg",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=300&h=225&fit=crop"
    },
    {
        name: "img-2b",
        file_name: "after.jpg",
        file_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
        file_size: "2.2 MB",
        file_type: "jpg",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=225&fit=crop"
    }
]

const dummyThreeImages = [
    {
        name: "img-3a",
        file_name: "ui_design.jpg",
        file_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
        file_size: "2.1 MB",
        file_type: "jpg",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=225&fit=crop"
    },
    {
        name: "img-3b",
        file_name: "wireframe.png",
        file_url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop",
        file_size: "1.5 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=300&h=225&fit=crop"
    },
    {
        name: "img-3c",
        file_name: "prototype.jpg",
        file_url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
        file_size: "3.8 MB",
        file_type: "jpg",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=225&fit=crop"
    }
]

const dummySixImages = [
    {
        name: "img-6a",
        file_name: "meeting_notes.jpg",
        file_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
        file_size: "1.9 MB",
        file_type: "jpg",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=225&fit=crop"
    },
    {
        name: "img-6b",
        file_name: "dashboard.png",
        file_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        file_size: "2.3 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=225&fit=crop"
    },
    {
        name: "img-6c",
        file_name: "analytics.jpg",
        file_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        file_size: "2.7 MB",
        file_type: "jpg",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=225&fit=crop"
    },
    {
        name: "img-6d",
        file_name: "report.pdf",
        file_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        file_size: "1.6 MB",
        file_type: "pdf",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=225&fit=crop"
    },
    {
        name: "img-6e",
        file_name: "chart.png",
        file_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        file_size: "1.2 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=225&fit=crop"
    },
    {
        name: "img-6f",
        file_name: "data.jpg",
        file_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        file_size: "2.9 MB",
        file_type: "jpg",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=225&fit=crop"
    }
]

const dummyTenImages = [
    {
        name: "img-10a",
        file_name: "homepage.png",
        file_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
        file_size: "1.8 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=225&fit=crop"
    },
    {
        name: "img-10b",
        file_name: "dashboard.png",
        file_url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=600&fit=crop",
        file_size: "2.1 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=300&h=225&fit=crop"
    },
    {
        name: "img-10c",
        file_name: "profile.png",
        file_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
        file_size: "1.9 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=225&fit=crop"
    },
    {
        name: "img-10d",
        file_name: "settings.png",
        file_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop",
        file_size: "2.4 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=225&fit=crop"
    },
    {
        name: "img-10e",
        file_name: "mobile1.png",
        file_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
        file_size: "2.0 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=225&fit=crop"
    },
    {
        name: "img-10f",
        file_name: "mobile2.png",
        file_url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop",
        file_size: "1.7 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=300&h=225&fit=crop"
    },
    {
        name: "img-10g",
        file_name: "mobile3.png",
        file_url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
        file_size: "2.2 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=225&fit=crop"
    },
    {
        name: "img-10h",
        file_name: "mobile4.png",
        file_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
        file_size: "1.6 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=225&fit=crop"
    },
    {
        name: "img-10i",
        file_name: "tablet1.png",
        file_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        file_size: "2.3 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=225&fit=crop"
    },
    {
        name: "img-10j",
        file_name: "tablet2.png",
        file_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        file_size: "2.5 MB",
        file_type: "png",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=225&fit=crop"
    }
]

const dummySingleImage = [
    {
        name: "img-single",
        file_name: "product_shot.jpg",
        file_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
        file_size: "2.7 MB",
        file_type: "jpg",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=225&fit=crop"
    }
]

export default function ChatStream() {
    return (
        <div className="flex flex-col p-4 h-full overflow-y-auto">

            <DateSeparator label="10th November 2024" />

            <SystemMessage message="Desirae Lipshutz created this channel" time="05:27" />
            <SystemMessage message="Desirae Lipshutz added Brandon Franci, Alfonso Vaccarol and 3 others to this channel" time="05:29" />

            <TextMessage
                user={dummyUser1}
                message="Hi, everyone!"
                time="08:00 PM"
            />

            <ReplyMessage
                user={dummyUser2}
                message="Hi Desirae, thanks for the warm welcome!"
                time="08:01 PM"
                repliedTo={{ user: dummyUser1, message: "Hi, everyone!" }}
            />

            <DateSeparator label="Yesterday" />

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

            <DateSeparator label="Today" />

            <TextMessage
                user={dummyUser2}
                message="Welcome, @Alfonso Vaccarol. We're glad to have you join us"
                time="10:09 AM"
            />

            <PollMessage poll={dummyPoll} currentUserVotes={dummyCurrentUserVotes} />
            <PollMessage poll={dummyPoll2} currentUserVotes={dummyCurrentUserVotes2} />
            <PollMessage poll={dummyPoll3} currentUserVotes={dummyCurrentUserVotes3} />

            <DateSeparator label="Image Messages" />

            <ImageMessage
                user={dummyUser1}
                images={dummySingleImage}
                time="11:30 AM"
                message="Here's the product shot we discussed"
            />

            <ImageMessage
                user={dummyUser2}
                images={dummyTwoImages}
                time="11:32 AM"
                message="Before and after comparison"
            />

            <ImageMessage
                user={dummyUser1}
                images={dummyThreeImages}
                time="11:35 AM"
                message="UI design progress - wireframes and prototype"
            />

            <ImageMessage
                user={dummyUser2}
                images={dummyImages}
                time="11:38 AM"
                message="Check out these design mockups and screenshots"
            />

            <ImageMessage
                user={dummyUser2}
                images={dummySixImages}
                time="11:40 AM"
                message="Q4 analytics and reports"
            />

            <ImageMessage
                user={dummyUser1}
                images={dummyTenImages}
                time="11:42 AM"
                message="Complete project documentation and assets"
            />
        </div>
    )
}
