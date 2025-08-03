import DateSeparator from "./renderers/DateSeparator"
import TextMessage from "./renderers/TextMessage"
import ThreadMessage from "./renderers/ThreadMessage"
import PollMessage from "./renderers/PollMessage"
import SystemMessage from "./renderers/SystemMessage"
import ReplyMessage from "./renderers/ReplyMessage"
import ImageMessage from "./renderers/ImageMessage"
import FileMessageRenderer from "./renderers/FileMessage"


const dummyUser1 = {
    name: "Desirae Lipshutz",
    full_name: "Desirae Lipshutz",
    user_image: "https://randomuser.me/api/portraits/women/44.jpg",
    type: "User" as const
}

const dummyUser2 = {
    name: "Brandon Franci",
    full_name: "Brandon Franci",
    user_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    type: "User" as const
}

const dummyUser3 = {
    name: "Sarah Chen",
    full_name: "Sarah Chen",
    user_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    type: "User" as const
}

const dummyUser4 = {
    name: "Mike Rodriguez",
    full_name: "Mike Rodriguez",
    user_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    type: "User" as const
}

const dummyUser5 = {
    name: "Alfonso Vaccarol",
    full_name: "Alfonso Vaccarol",
    user_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
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
        <div className="flex flex-col p-4 h-full overflow-y-auto space-y-4">

            <DateSeparator label="10th November 2024" />

            <SystemMessage message="Desirae Lipshutz created this channel" time="05:27" />
            <SystemMessage message="Desirae Lipshutz added Brandon Franci, Alfonso Vaccarol and 3 others to this channel" time="05:29" />
            <SystemMessage message="Sarah Chen joined the channel" time="05:30" />
            <SystemMessage message="Mike Rodriguez joined the channel" time="05:31" />

            <TextMessage
                user={dummyUser1}
                message="Hi, everyone! Welcome to our new project channel!"
                time="08:00 PM"
            />

            <ReplyMessage
                user={dummyUser2}
                message="Hi Desirae, thanks for the warm welcome! Excited to be here"
                time="08:01 PM"
                repliedTo={{ user: dummyUser1, message: "Hi, everyone! Welcome to our new project channel!" }}
            />

            <TextMessage
                user={dummyUser1}
                message="Great! Let's start by discussing our Q4 goals. What are we feeling for this month's book club selection?"
                time="08:05 PM"
            />

            <PollMessage
                user={dummyUser1}
                poll={dummyPoll}
                currentUserVotes={dummyCurrentUserVotes}
                time="08:06 PM"
            />

            <TextMessage
                user={dummyUser2}
                message="I voted for The Overstory! Heard great things about it"
                time="08:10 PM"
            />

            <TextMessage
                user={dummyUser3}
                message="I went with The Nature Fix - love outdoor books!"
                time="08:11 PM"
            />

            <TextMessage
                user={dummyUser1}
                message="Perfect! I think we'll have a great discussion about that one"
                time="08:12 PM"
            />

            <TextMessage
                user={dummyUser2}
                message="Should we schedule the book club meeting for next week?"
                time="08:15 PM"
            />

            <TextMessage
                user={dummyUser1}
                message="Absolutely! How about Thursday at 3 PM?"
                time="08:16 PM"
            />

            <TextMessage
                user={dummyUser2}
                message="Works for me! I'll send out a calendar invite"
                time="08:17 PM"
            />

            <DateSeparator label="11th November 2024" />

            <SystemMessage message="Sarah Chen joined the channel" time="09:15" />
            <SystemMessage message="Mike Rodriguez joined the channel" time="09:16" />

            <TextMessage
                user={dummyUser1}
                message="Good morning team! Welcome Sarah and Mike!"
                time="09:20 AM"
            />

            <TextMessage
                user={dummyUser2}
                message="Morning everyone! Welcome aboard Sarah and Mike!"
                time="09:22 AM"
            />

            <TextMessage
                user={dummyUser3}
                message="Thanks for the welcome! Excited to be part of the team!"
                time="09:23 AM"
            />

            <TextMessage
                user={dummyUser4}
                message="Morning team! Looking forward to working with everyone"
                time="09:24 AM"
            />

            <TextMessage
                user={dummyUser1}
                message="Let's have a quick standup. What's everyone working on today?"
                time="09:25 AM"
            />

            <TextMessage
                user={dummyUser2}
                message="I'm finishing up the design mockups for the new dashboard"
                time="09:26 AM"
            />

            <TextMessage
                user={dummyUser3}
                message="I'm working on the mobile app wireframes"
                time="09:26 AM"
            />

            <TextMessage
                user={dummyUser4}
                message="I'm setting up the database schema for the new features"
                time="09:27 AM"
            />

            <TextMessage
                user={dummyUser5}
                message="I'm reviewing the security protocols for the API"
                time="09:27 AM"
            />

            <TextMessage
                user={dummyUser1}
                message="Great! I'm reviewing the API documentation"
                time="09:28 AM"
            />

            <TextMessage
                user={dummyUser2}
                message="Perfect! Let me know if you need any clarification on the design specs"
                time="09:29 AM"
            />

            <TextMessage
                user={dummyUser3}
                message="I'll share the mobile wireframes once they're ready for review"
                time="09:30 AM"
            />

            <DateSeparator label="Yesterday" />

            <TextMessage
                user={dummyUser1}
                message="Hello, everyone! ⭐ How's everyone doing today? I hope you're all having a fantastic day!"
                time="07:20 PM"
            />

            <TextMessage
                user={dummyUser2}
                message="Doing great! Just finished reviewing the latest design mockups"
                time="07:25 PM"
            />

            <TextMessage
                user={dummyUser1}
                message="That's awesome! Can't wait to see them"
                time="07:27 PM"
            />

            <ImageMessage
                user={dummyUser2}
                images={dummyImages}
                time="07:30 PM"
                message="Check out these design mockups and screenshots I've been working on"
            />

            <TextMessage
                user={dummyUser1}
                message="These look amazing! I especially love the dashboard design"
                time="07:32 PM"
            />

            <TextMessage
                user={dummyUser2}
                message="Thanks! The dashboard was the most challenging part to get right"
                time="07:33 PM"
            />

            <TextMessage
                user={dummyUser1}
                message="You nailed it! The user flow looks really intuitive"
                time="07:35 PM"
            />

            <ThreadMessage
                user={dummyUser2}
                message="Hi, everyone! I'd like to start this thread to discuss social media marketing strategies for our new product launch. We need to plan our approach across different platforms and create a cohesive brand presence. I've been researching our competitors and noticed they're doing really well on LinkedIn with thought leadership content."
                time="07:40 PM"
                threadTitle="Social Media Marketing Strategies"
                threadSummary="8 Messages View threads"
                messageCount={8}
                participants={dummyParticipants}
            />

            <TextMessage
                user={dummyUser1}
                message="Sounds great! Looking forward to the discussion. I think we should focus on LinkedIn and Twitter first since our target audience is primarily B2B professionals. We could share industry insights, product updates, and behind-the-scenes content about our development process."
                time="07:42 PM"
            />

            <TextMessage
                user={dummyUser3}
                message="I love the idea of behind-the-scenes content! We could showcase our design process, user research findings, and even some of the challenges we've overcome. It would make us more relatable and humanize our brand."
                time="07:43 PM"
            />

            <TextMessage
                user={dummyUser2}
                message="Perfect! I'll prepare a strategy document for our next meeting. I'm thinking we should create a content calendar with themes for each day of the week - maybe Monday insights, Wednesday wireframes, Friday features. What do you think?"
                time="07:45 PM"
            />

            <TextMessage
                user={dummyUser1}
                message="Should we also consider Instagram for visual content? I know it's more B2C focused, but we could use it to showcase our UI/UX work and attract design talent to our team."
                time="07:47 PM"
            />

            <TextMessage
                user={dummyUser2}
                message="Definitely! Instagram would be perfect for showcasing our design work. We could post wireframes, prototypes, and even short videos of our design process. Plus, it's a great way to build our employer brand and attract top design talent."
                time="07:48 PM"
            />

            <TextMessage
                user={dummyUser4}
                message="From a technical perspective, we should also consider YouTube for longer-form content. We could create tutorials, product demos, and even share our development process. It would help with SEO and establish us as thought leaders in the space."
                time="07:50 PM"
            />

            <TextMessage
                user={dummyUser5}
                message="Great points everyone! I'd also suggest we create a content approval workflow to ensure all posts align with our brand guidelines and security policies. We should probably set up some automated tools for scheduling and analytics tracking too."
                time="07:52 PM"
            />

            <DateSeparator label="Today" />

            <SystemMessage message="Channel name updated to: Q4 Project Planning & Development" time="09:00" />
            <SystemMessage message="Channel description updated" time="09:01" />

            <TextMessage
                user={dummyUser2}
                message="Welcome, @Alfonso Vaccarol! We're glad to have you join us"
                time="10:09 AM"
            />

            <TextMessage
                user={dummyUser1}
                message="Morning team! Quick question - what's your favorite programming language for building scalable web applications?"
                time="10:15 AM"
            />

            <PollMessage
                user={dummyUser1}
                poll={dummyPoll2}
                currentUserVotes={dummyCurrentUserVotes2}
                time="10:16 AM"
            />

            <TextMessage
                user={dummyUser2}
                message="TypeScript all the way! The type safety is a game changer"
                time="10:20 AM"
            />

            <ReplyMessage
                user={dummyUser3}
                message="I've been using TypeScript for the mobile app too - it's been a lifesaver for catching bugs early!"
                time="10:21 AM"
                repliedTo={{ user: dummyUser2, message: "TypeScript all the way! The type safety is a game changer" }}
            />

            <TextMessage
                user={dummyUser1}
                message="Agreed! The refactoring experience is so much better with TypeScript"
                time="10:22 AM"
            />

            <TextMessage
                user={dummyUser2}
                message="Exactly! And the IDE support is incredible"
                time="10:23 AM"
            />

            <ReplyMessage
                user={dummyUser4}
                message="The autocomplete and refactoring tools are amazing. Saves so much time!"
                time="10:24 AM"
                repliedTo={{ user: dummyUser2, message: "Exactly! And the IDE support is incredible" }}
            />

            <ThreadMessage
                user={dummyUser4}
                message="Hey team! I wanted to start a discussion about our technical architecture for the new features. We're planning to implement real-time collaboration, and I'm thinking we should use WebSockets with a Redis pub/sub system for scalability. The current REST API approach won't handle the concurrent user load we're expecting."
                time="10:25 AM"
                threadTitle="Technical Architecture Discussion"
                threadSummary="6 Messages View threads"
                messageCount={6}
                participants={dummyParticipants}
            />

            <TextMessage
                user={dummyUser5}
                message="Great point Mike! I've been researching this too. WebSockets would definitely be better for real-time features, but we need to consider the security implications. We should implement proper authentication and rate limiting to prevent abuse. Also, what about fallback mechanisms if WebSocket connections fail?"
                time="10:27 AM"
            />

            <TextMessage
                user={dummyUser2}
                message="From a frontend perspective, I'm concerned about browser compatibility and connection stability. We should probably implement a hybrid approach - WebSockets for real-time features but keep REST APIs as fallback. This way we maintain functionality even if WebSocket connections drop."
                time="10:29 AM"
            />

            <TextMessage
                user={dummyUser3}
                message="I agree with Brandon's hybrid approach. For mobile apps, we'll need to handle connection state changes and reconnection logic. We should also consider using a library like Socket.io that handles these edge cases automatically. What do you think about the database design for real-time collaboration?"
                time="10:31 AM"
            />

            <TextMessage
                user={dummyUser4}
                message="Excellent points everyone! For the database, I'm thinking we need to implement operational transformation or conflict-free replicated data types (CRDTs) to handle concurrent edits. We could use PostgreSQL with its JSONB support for storing the document state. Alfonso, what's your take on the security architecture?"
                time="10:33 AM"
            />

            <TextMessage
                user={dummyUser5}
                message="Perfect! For security, I recommend implementing JWT tokens for WebSocket authentication, with automatic token refresh. We should also add connection pooling and implement proper session management. I'll create a security audit checklist and we can review it together next week."
                time="10:35 AM"
            />

            <TextMessage
                user={dummyUser1}
                message="Now, let's talk lunch - what's everyone feeling?"
                time="11:30 AM"
            />

            <PollMessage
                user={dummyUser1}
                poll={dummyPoll3}
                currentUserVotes={dummyCurrentUserVotes3}
                time="11:31 AM"
            />

            <TextMessage
                user={dummyUser2}
                message="I'm craving pizza!"
                time="11:32 AM"
            />

            <ReplyMessage
                user={dummyUser3}
                message="Pizza sounds amazing! I'm in for that"
                time="11:32 AM"
                repliedTo={{ user: dummyUser2, message: "I'm craving pizza!" }}
            />

            <TextMessage
                user={dummyUser1}
                message="Pizza sounds perfect! Should we order from that new place downtown?"
                time="11:33 AM"
            />

            <TextMessage
                user={dummyUser2}
                message="Yes! Their margherita is amazing"
                time="11:34 AM"
            />

            <ReplyMessage
                user={dummyUser5}
                message="I've heard great things about their wood-fired oven too!"
                time="11:35 AM"
                repliedTo={{ user: dummyUser2, message: "Yes! Their margherita is amazing" }}
            />

            <ImageMessage
                user={dummyUser1}
                images={dummySingleImage}
                time="11:35 AM"
                message="Here's the product shot we discussed in the meeting"
            />

            <TextMessage
                user={dummyUser2}
                message="That looks perfect! Can you share the before and after comparison?"
                time="11:37 AM"
            />

            <TextMessage
                user={dummyUser1}
                message="Sure! Let me dig that up for you"
                time="11:38 AM"
            />

            <ImageMessage
                user={dummyUser2}
                images={dummyTwoImages}
                time="11:40 AM"
                message="Here's the before and after comparison you asked for"
            />

            <TextMessage
                user={dummyUser1}
                message="Incredible improvement! The new design is much cleaner"
                time="11:42 AM"
            />

            <ReplyMessage
                user={dummyUser3}
                message="The color scheme is much more modern too!"
                time="11:42 AM"
                repliedTo={{ user: dummyUser1, message: "Incredible improvement! The new design is much cleaner" }}
            />

            <TextMessage
                user={dummyUser2}
                message="Thanks! The user feedback really helped guide the redesign"
                time="11:43 AM"
            />

            <ReplyMessage
                user={dummyUser4}
                message="The user research sessions were really valuable for this"
                time="11:44 AM"
                repliedTo={{ user: dummyUser2, message: "Thanks! The user feedback really helped guide the redesign" }}
            />

            <ThreadMessage
                user={dummyUser3}
                message="Team, I wanted to start a discussion about our user experience strategy for the mobile app. I've been conducting user interviews and there are some interesting patterns emerging. Users are really struggling with the onboarding flow - it's taking them an average of 8 minutes to complete, which is way too long. I think we need to rethink our approach."
                time="11:45 AM"
                threadTitle="Mobile UX Strategy Discussion"
                threadSummary="7 Messages View threads"
                messageCount={7}
                participants={dummyParticipants}
            />

            <TextMessage
                user={dummyUser2}
                message="That's a really important insight Sarah! 8 minutes is definitely too long for onboarding. I've been looking at some successful apps and they typically get users to their first 'aha moment' within 2-3 minutes. We should probably implement a progressive disclosure approach - show only what's essential upfront."
                time="11:47 AM"
            />

            <TextMessage
                user={dummyUser1}
                message="I completely agree! We should also consider implementing a 'skip tutorial' option for power users who might be migrating from other platforms. What about the user feedback on the navigation? Are they finding it intuitive?"
                time="11:49 AM"
            />

            <TextMessage
                user={dummyUser3}
                message="Great question! The navigation feedback is mixed. Users love the bottom tab bar for main sections, but they're getting lost when trying to access secondary features. I think we need to implement a more discoverable menu system, maybe with contextual help or tooltips for new users."
                time="11:51 AM"
            />

            <TextMessage
                user={dummyUser4}
                message="From a technical perspective, we could implement analytics tracking to see exactly where users are dropping off in the onboarding flow. We could use tools like Mixpanel or Amplitude to create funnels and identify the specific pain points. This would give us data-driven insights to guide our redesign."
                time="11:53 AM"
            />

            <TextMessage
                user={dummyUser5}
                message="Good idea Mike! We should also consider accessibility in our redesign. I've been reading about WCAG guidelines for mobile apps, and we need to ensure our onboarding flow works well with screen readers and other assistive technologies. This could actually help us simplify the flow too."
                time="11:55 AM"
            />

            <TextMessage
                user={dummyUser3}
                message="Excellent points everyone! I think we should create a cross-functional working group to tackle this. We need input from design, engineering, and product. Let me schedule a workshop next week where we can map out the user journey and identify opportunities for improvement. Should we also consider A/B testing different onboarding approaches?"
                time="11:57 AM"
            />

            <ImageMessage
                user={dummyUser1}
                images={dummyThreeImages}
                time="11:45 AM"
                message="UI design progress - wireframes and prototype for the mobile app"
            />

            <TextMessage
                user={dummyUser2}
                message="Love the wireframes! The user flow looks intuitive"
                time="11:47 AM"
            />

            <TextMessage
                user={dummyUser1}
                message="Thanks! I spent a lot of time on the user journey mapping"
                time="11:48 AM"
            />

            <ImageMessage
                user={dummyUser2}
                images={dummySixImages}
                time="11:50 AM"
                message="Q4 analytics and reports - we're seeing great growth!"
            />

            <TextMessage
                user={dummyUser1}
                message="Excellent numbers! Let me share the complete project documentation"
                time="11:52 AM"
            />

            <TextMessage
                user={dummyUser2}
                message="The growth metrics are really impressive this quarter"
                time="11:53 AM"
            />

            <ImageMessage
                user={dummyUser1}
                images={dummyTenImages}
                time="11:55 AM"
                message="Complete project documentation and assets for all platforms"
            />

            <TextMessage
                user={dummyUser2}
                message="Perfect! Now let's share the financial reports"
                time="12:00 PM"
            />

            <TextMessage
                user={dummyUser1}
                message="I'll upload the Q4 financial report now"
                time="12:01 PM"
            />

            <ReplyMessage
                user={dummyUser3}
                message="Great! I've been waiting to see the Q4 numbers"
                time="12:01 PM"
                repliedTo={{ user: dummyUser1, message: "I'll upload the Q4 financial report now" }}
            />

            <TextMessage
                user={dummyUser4}
                message="Same here! The Q3 report was really promising"
                time="12:02 PM"
            />

            <ReplyMessage
                user={dummyUser5}
                message="The growth metrics from Q3 were impressive. Looking forward to Q4!"
                time="12:03 PM"
                repliedTo={{ user: dummyUser4, message: "Same here! The Q3 report was really promising" }}
            />

            {/* Single File */}
            <FileMessageRenderer
                user={dummyUser1}
                files={{
                    fileName: "Q4_Financial_Report.pdf",
                    fileType: "pdf",
                    fileSize: "2.4 MB"
                }}
                time="12:02 PM"
                message="Here's the quarterly financial report for review"
            />

            <TextMessage
                user={dummyUser2}
                message="Thanks! I'll also share the updated project proposal and sales data"
                time="12:03 PM"
            />

            <ReplyMessage
                user={dummyUser1}
                message="Perfect! I've been waiting to see the updated proposal"
                time="12:04 PM"
                repliedTo={{ user: dummyUser2, message: "Thanks! I'll also share the updated project proposal and sales data" }}
            />

            {/* Two Files - 2x1 Grid */}
            <FileMessageRenderer
                user={dummyUser2}
                files={[
                    {
                        fileName: "Project_Proposal.docx",
                        fileType: "docx",
                        fileSize: "1.8 MB"
                    },
                    {
                        fileName: "Sales_Data_Q4.xlsx",
                        fileType: "xlsx",
                        fileSize: "3.2 MB"
                    }
                ]}
                time="12:05 PM"
                message="Updated project proposal and sales data"
            />

            <TextMessage
                user={dummyUser1}
                message="Great work! I have the presentation and meeting recording to share"
                time="12:08 PM"
            />

            <TextMessage
                user={dummyUser2}
                message="Looking forward to seeing the presentation!"
                time="12:09 PM"
            />

            <ReplyMessage
                user={dummyUser3}
                message="The demo recording will be really helpful for the client meeting"
                time="12:10 PM"
                repliedTo={{ user: dummyUser2, message: "Looking forward to seeing the presentation!" }}
            />

            {/* Three Files - 3x1 Grid */}
            <FileMessageRenderer
                user={dummyUser1}
                files={[
                    {
                        fileName: "Product_Presentation.pptx",
                        fileType: "pptx",
                        fileSize: "5.1 MB"
                    },
                    {
                        fileName: "Team_Meeting_Recording.mp4",
                        fileType: "mp4",
                        fileSize: "45.7 MB"
                    },
                    {
                        fileName: "Background_Music.mp3",
                        fileType: "mp3",
                        fileSize: "8.9 MB"
                    }
                ]}
                time="12:10 PM"
                message="Presentation, recording, and background music for the demo"
            />

            <TextMessage
                user={dummyUser2}
                message="Perfect! Let me add the technical documentation and project assets"
                time="12:12 PM"
            />

            <TextMessage
                user={dummyUser1}
                message="That will complete our project documentation nicely"
                time="12:13 PM"
            />

            {/* Four Files - 3x2 Grid */}
            <FileMessageRenderer
                user={dummyUser2}
                files={[
                    {
                        fileName: "API_Documentation.txt",
                        fileType: "txt",
                        fileSize: "156 KB"
                    },
                    {
                        fileName: "Project_Assets.zip",
                        fileType: "zip",
                        fileSize: "12.3 MB"
                    },
                    {
                        fileName: "Database_Schema.sql",
                        fileType: "sql",
                        fileSize: "2.1 MB"
                    },
                    {
                        fileName: "Configuration.json",
                        fileType: "json",
                        fileSize: "45 KB"
                    }
                ]}
                time="12:15 PM"
                message="All project files and documentation for the team"
            />

            <TextMessage
                user={dummyUser1}
                message="Excellent! We have everything we need. Great work everyone!"
                time="12:18 PM"
            />

            <TextMessage
                user={dummyUser3}
                message="Absolutely! This has been super productive"
                time="12:19 PM"
            />

            <TextMessage
                user={dummyUser4}
                message="Couldn't agree more! The team is really hitting its stride"
                time="12:19 PM"
            />

            <TextMessage
                user={dummyUser2}
                message="This has been a productive morning! Should we schedule a review meeting?"
                time="12:20 PM"
            />

            <TextMessage
                user={dummyUser1}
                message="Absolutely! How about tomorrow at 2 PM?"
                time="12:21 PM"
            />

            <TextMessage
                user={dummyUser2}
                message="Perfect! I'll send out the calendar invite"
                time="12:22 PM"
            />

            <TextMessage
                user={dummyUser1}
                message="Quick reminder: Don't forget about the client demo tomorrow at 10 AM!"
                time="14:35 PM"
            />

            <TextMessage
                user={dummyUser2}
                message="Thanks for the reminder! I'll make sure everything is ready"
                time="14:36 PM"
            />

            <TextMessage
                user={dummyUser1}
                message="Great! Let's make sure we have all the demo materials prepared"
                time="14:37 PM"
            />
        </div>
    )
}
