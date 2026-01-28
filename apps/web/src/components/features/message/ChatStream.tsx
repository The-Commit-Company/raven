import DateSeparator from "./renderers/DateSeparator"
import PollMessage from "./renderers/PollMessage"
import SystemMessage from "./renderers/SystemMessage"
import ImageMessage from "./renderers/ImageMessage"
import FileMessageRenderer from "./renderers/FileMessage"
import { MessageReactions } from "./MessageReactions"
import { ReactionObject } from "@raven/types/common/ChatStream"
import { UserFields } from "@raven/types/common/UserFields"
import { Message } from "@raven/types/common/Message"
import { useMemo, useRef } from "react"
import { formatMessages } from "@hooks/useGetMessages"
import { MessageItem } from "./renderers/MessageItem"
import { PollVotingMessage } from "./renderers/PollVotingMessage"
import { getDateObject } from "@utils/date"
import dayjs from "dayjs"


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
                { id: "1", name: "Alice", full_name: "Alice Smith", image: "https://randomuser.me/api/portraits/women/1.jpg" },
                { id: "2", name: "Bob", full_name: "Bob Johnson", image: "https://randomuser.me/api/portraits/men/2.jpg" },
                { id: "3", name: "Carol", full_name: "Carol Williams", image: "https://randomuser.me/api/portraits/women/3.jpg" },
                { id: "4", name: "Dave", full_name: "Dave Brown", image: "https://randomuser.me/api/portraits/men/4.jpg" },
                { id: "5", name: "Eve", full_name: "Eve Davis", image: "https://randomuser.me/api/portraits/women/5.jpg" },
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
                { id: "6", name: "Frank", full_name: "Frank Miller", image: "https://randomuser.me/api/portraits/men/6.jpg" },
                { id: "7", name: "Grace", full_name: "Grace Wilson", image: "https://randomuser.me/api/portraits/women/7.jpg" },
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
    end_date: "2024-12-31 23:59:59",
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
                { id: "1", name: "Alice", full_name: "Alice Smith", image: "https://randomuser.me/api/portraits/women/1.jpg" },
                { id: "2", name: "Bob", full_name: "Bob Johnson", image: "https://randomuser.me/api/portraits/men/2.jpg" },
                { id: "3", name: "Carol", full_name: "Carol Williams", image: "https://randomuser.me/api/portraits/women/3.jpg" },
                { id: "4", name: "Dave", full_name: "Dave Brown", image: "https://randomuser.me/api/portraits/men/4.jpg" },
                { id: "5", name: "Eve", full_name: "Eve Davis", image: "https://randomuser.me/api/portraits/women/5.jpg" },
                { id: "6", name: "Frank", full_name: "Frank Miller", image: "https://randomuser.me/api/portraits/men/6.jpg" },
                { id: "7", name: "Grace", full_name: "Grace Wilson", image: "https://randomuser.me/api/portraits/women/7.jpg" },
                { id: "8", name: "Henry", full_name: "Henry Moore", image: "https://randomuser.me/api/portraits/men/8.jpg" },
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
                { id: "9", name: "Ivy", full_name: "Ivy Taylor", image: "https://randomuser.me/api/portraits/women/9.jpg" },
                { id: "10", name: "Jack", full_name: "Jack Anderson", image: "https://randomuser.me/api/portraits/men/10.jpg" },
                { id: "11", name: "Kate", full_name: "Kate Thomas", image: "https://randomuser.me/api/portraits/women/11.jpg" },
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
                { id: "12", name: "Liam", full_name: "Liam Jackson", image: "https://randomuser.me/api/portraits/men/12.jpg" },
                { id: "13", name: "Mia", full_name: "Mia White", image: "https://randomuser.me/api/portraits/women/13.jpg" },
            ],
        },
    ],
    is_anonymous: 0 as 0 | 1,
    is_multi_choice: 0 as 0 | 1,
    is_disabled: 0 as 0 | 1,
    end_date: "2025-01-15 18:00:00",
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
                { id: "1", name: "Alice", full_name: "Alice Smith", image: "https://randomuser.me/api/portraits/women/1.jpg" },
                { id: "2", name: "Bob", full_name: "Bob Johnson", image: "https://randomuser.me/api/portraits/men/2.jpg" },
                { id: "3", name: "Carol", full_name: "Carol Williams", image: "https://randomuser.me/api/portraits/women/3.jpg" },
                { id: "4", name: "Dave", full_name: "Dave Brown", image: "https://randomuser.me/api/portraits/men/4.jpg" },
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
                { id: "5", name: "Eve", full_name: "Eve Davis", image: "https://randomuser.me/api/portraits/women/5.jpg" },
                { id: "6", name: "Frank", full_name: "Frank Miller", image: "https://randomuser.me/api/portraits/men/6.jpg" },
                { id: "7", name: "Grace", full_name: "Grace Wilson", image: "https://randomuser.me/api/portraits/women/7.jpg" },
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
                { id: "8", name: "Henry", full_name: "Henry Moore", image: "https://randomuser.me/api/portraits/men/8.jpg" },
            ],
        },
    ],
    is_anonymous: 0 as 0 | 1,
    is_multi_choice: 0 as 0 | 1,
    is_disabled: 1 as 0 | 1,
    end_date: "2024-01-03 12:00:00",
    total_votes: 8,
}

const dummyCurrentUserVotes3 = [{ option: "opt-7" }]

// Poll 4: Anonymous single choice poll (user hasn't voted)
const dummyPoll4 = {
    creation: "2024-01-04 10:00:00",
    name: "poll-4",
    modified: "2024-01-04 10:00:00",
    owner: "user@example.com",
    modified_by: "user@example.com",
    docstatus: 0 as 0 | 1 | 2,
    question: "What's your preferred work schedule?",
    options: [
        {
            creation: "2024-01-04 10:00:00",
            name: "opt-10",
            modified: "2024-01-04 10:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "9 AM - 5 PM",
            votes: 0,
        },
        {
            creation: "2024-01-04 10:00:00",
            name: "opt-11",
            modified: "2024-01-04 10:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "10 AM - 6 PM",
            votes: 0,
        },
        {
            creation: "2024-01-04 10:00:00",
            name: "opt-12",
            modified: "2024-01-04 10:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "Flexible hours",
            votes: 0,
        },
    ],
    is_anonymous: 1 as 0 | 1,
    is_multi_choice: 0 as 0 | 1,
    is_disabled: 0 as 0 | 1,
    end_date: "2024-12-31 23:59:59",
    total_votes: 0,
}

// Poll 5: Multi choice poll (user hasn't voted)
const dummyPoll5 = {
    creation: "2024-01-05 14:00:00",
    name: "poll-5",
    modified: "2024-01-05 14:00:00",
    owner: "user@example.com",
    modified_by: "user@example.com",
    docstatus: 0 as 0 | 1 | 2,
    question: "Which team building activities interest you? (Select all that apply)",
    options: [
        {
            creation: "2024-01-05 14:00:00",
            name: "opt-13",
            modified: "2024-01-05 14:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "Escape room",
            votes: 12,
            voters: [
                { id: "1", name: "Alice", full_name: "Alice Smith", image: "https://randomuser.me/api/portraits/women/1.jpg" },
                { id: "2", name: "Bob", full_name: "Bob Johnson", image: "https://randomuser.me/api/portraits/men/2.jpg" },
                { id: "3", name: "Carol", full_name: "Carol Williams", image: "https://randomuser.me/api/portraits/women/3.jpg" },
                { id: "4", name: "Dave", full_name: "Dave Brown", image: "https://randomuser.me/api/portraits/men/4.jpg" },
                { id: "5", name: "Eve", full_name: "Eve Davis", image: "https://randomuser.me/api/portraits/women/5.jpg" },
            ],
        },
        {
            creation: "2024-01-05 14:00:00",
            name: "opt-14",
            modified: "2024-01-05 14:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "Cooking class",
            votes: 8,
            voters: [
                { id: "6", name: "Frank", full_name: "Frank Miller", image: "https://randomuser.me/api/portraits/men/6.jpg" },
                { id: "7", name: "Grace", full_name: "Grace Wilson", image: "https://randomuser.me/api/portraits/women/7.jpg" },
                { id: "8", name: "Henry", full_name: "Henry Moore", image: "https://randomuser.me/api/portraits/men/8.jpg" },
            ],
        },
        {
            creation: "2024-01-05 14:00:00",
            name: "opt-15",
            modified: "2024-01-05 14:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "Outdoor hiking",
            votes: 6,
            voters: [
                { id: "9", name: "Ivy", full_name: "Ivy Taylor", image: "https://randomuser.me/api/portraits/women/9.jpg" },
                { id: "10", name: "Jack", full_name: "Jack Anderson", image: "https://randomuser.me/api/portraits/men/10.jpg" },
            ],
        },
        {
            creation: "2024-01-05 14:00:00",
            name: "opt-16",
            modified: "2024-01-05 14:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "Board games night",
            votes: 10,
            voters: [
                { id: "11", name: "Kate", full_name: "Kate Thomas", image: "https://randomuser.me/api/portraits/women/11.jpg" },
                { id: "12", name: "Liam", full_name: "Liam Jackson", image: "https://randomuser.me/api/portraits/men/12.jpg" },
            ],
        },
    ],
    is_anonymous: 0 as 0 | 1,
    is_multi_choice: 1 as 0 | 1,
    is_disabled: 0 as 0 | 1,
    end_date: "2024-12-31 23:59:59",
    total_votes: 36,
}

// Poll 6: Single choice poll (user hasn't voted)
const dummyPoll6 = {
    creation: "2024-01-06 09:00:00",
    name: "poll-6",
    modified: "2024-01-06 09:00:00",
    owner: "user@example.com",
    modified_by: "user@example.com",
    docstatus: 0 as 0 | 1 | 2,
    question: "Which framework should we use for the new project?",
    options: [
        {
            creation: "2024-01-06 09:00:00",
            name: "opt-17",
            modified: "2024-01-06 09:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "React",
            votes: 15,
            voters: [
                { id: "1", name: "Alice", full_name: "Alice Smith", image: "https://randomuser.me/api/portraits/women/1.jpg" },
                { id: "2", name: "Bob", full_name: "Bob Johnson", image: "https://randomuser.me/api/portraits/men/2.jpg" },
                { id: "3", name: "Carol", full_name: "Carol Williams", image: "https://randomuser.me/api/portraits/women/3.jpg" },
                { id: "4", name: "Dave", full_name: "Dave Brown", image: "https://randomuser.me/api/portraits/men/4.jpg" },
                { id: "5", name: "Eve", full_name: "Eve Davis", image: "https://randomuser.me/api/portraits/women/5.jpg" },
            ],
        },
        {
            creation: "2024-01-06 09:00:00",
            name: "opt-18",
            modified: "2024-01-06 09:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "Vue",
            votes: 7,
            voters: [
                { id: "6", name: "Frank", full_name: "Frank Miller", image: "https://randomuser.me/api/portraits/men/6.jpg" },
                { id: "7", name: "Grace", full_name: "Grace Wilson", image: "https://randomuser.me/api/portraits/women/7.jpg" },
            ],
        },
        {
            creation: "2024-01-06 09:00:00",
            name: "opt-19",
            modified: "2024-01-06 09:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "Svelte",
            votes: 3,
            voters: [
                { id: "8", name: "Henry", full_name: "Henry Moore", image: "https://randomuser.me/api/portraits/men/8.jpg" },
            ],
        },
    ],
    is_anonymous: 0 as 0 | 1,
    is_multi_choice: 0 as 0 | 1,
    is_disabled: 0 as 0 | 1,
    end_date: "2024-12-31 23:59:59",
    total_votes: 25,
}

// Poll 7: Multi choice poll (user hasn't voted) - Anonymous
const dummyPoll7 = {
    creation: "2024-01-07 15:00:00",
    name: "poll-7",
    modified: "2024-01-07 15:00:00",
    owner: "user@example.com",
    modified_by: "user@example.com",
    docstatus: 0 as 0 | 1 | 2,
    question: "What skills would you like to develop? (Select all that apply)",
    options: [
        {
            creation: "2024-01-07 15:00:00",
            name: "opt-20",
            modified: "2024-01-07 15:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "Leadership",
            votes: 0,
        },
        {
            creation: "2024-01-07 15:00:00",
            name: "opt-21",
            modified: "2024-01-07 15:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "Public speaking",
            votes: 0,
        },
        {
            creation: "2024-01-07 15:00:00",
            name: "opt-22",
            modified: "2024-01-07 15:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "Technical writing",
            votes: 0,
        },
        {
            creation: "2024-01-07 15:00:00",
            name: "opt-23",
            modified: "2024-01-07 15:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "Data analysis",
            votes: 0,
        },
    ],
    is_anonymous: 1 as 0 | 1,
    is_multi_choice: 1 as 0 | 1,
    is_disabled: 0 as 0 | 1,
    end_date: "2024-12-31 23:59:59",
    total_votes: 0,
}

// Poll 8: Closed single choice poll (user hasn't voted)
const dummyPoll8 = {
    creation: "2024-01-08 11:00:00",
    name: "poll-8",
    modified: "2024-01-08 11:00:00",
    owner: "user@example.com",
    modified_by: "user@example.com",
    docstatus: 0 as 0 | 1 | 2,
    question: "Which location should we choose for the team offsite?",
    options: [
        {
            creation: "2024-01-08 11:00:00",
            name: "opt-24",
            modified: "2024-01-08 11:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "Mountain resort",
            votes: 8,
            voters: [
                { id: "1", name: "Alice", full_name: "Alice Smith", image: "https://randomuser.me/api/portraits/women/1.jpg" },
                { id: "2", name: "Bob", full_name: "Bob Johnson", image: "https://randomuser.me/api/portraits/men/2.jpg" },
                { id: "3", name: "Carol", full_name: "Carol Williams", image: "https://randomuser.me/api/portraits/women/3.jpg" },
                { id: "4", name: "Dave", full_name: "Dave Brown", image: "https://randomuser.me/api/portraits/men/4.jpg" },
                { id: "5", name: "Eve", full_name: "Eve Davis", image: "https://randomuser.me/api/portraits/women/5.jpg" },
                { id: "6", name: "Frank", full_name: "Frank Miller", image: "https://randomuser.me/api/portraits/men/6.jpg" },
                { id: "7", name: "Grace", full_name: "Grace Wilson", image: "https://randomuser.me/api/portraits/women/7.jpg" },
                { id: "8", name: "Henry", full_name: "Henry Moore", image: "https://randomuser.me/api/portraits/men/8.jpg" },
            ],
        },
        {
            creation: "2024-01-08 11:00:00",
            name: "opt-25",
            modified: "2024-01-08 11:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "Beach destination",
            votes: 5,
            voters: [
                { id: "9", name: "Ivy", full_name: "Ivy Taylor", image: "https://randomuser.me/api/portraits/women/9.jpg" },
                { id: "10", name: "Jack", full_name: "Jack Anderson", image: "https://randomuser.me/api/portraits/men/10.jpg" },
                { id: "11", name: "Kate", full_name: "Kate Thomas", image: "https://randomuser.me/api/portraits/women/11.jpg" },
                { id: "12", name: "Liam", full_name: "Liam Jackson", image: "https://randomuser.me/api/portraits/men/12.jpg" },
                { id: "13", name: "Mia", full_name: "Mia White", image: "https://randomuser.me/api/portraits/women/13.jpg" },
            ],
        },
        {
            creation: "2024-01-08 11:00:00",
            name: "opt-26",
            modified: "2024-01-08 11:00:00",
            owner: "user@example.com",
            modified_by: "user@example.com",
            docstatus: 0 as 0 | 1 | 2,
            option: "City hotel",
            votes: 2,
            voters: [
                { id: "14", name: "Noah", full_name: "Noah Harris", image: "https://randomuser.me/api/portraits/men/14.jpg" },
                { id: "15", name: "Olivia", full_name: "Olivia Martin", image: "https://randomuser.me/api/portraits/women/15.jpg" },
            ],
        },
    ],
    is_anonymous: 0 as 0 | 1,
    is_multi_choice: 0 as 0 | 1,
    is_disabled: 1 as 0 | 1,
    end_date: "2024-01-08 12:00:00",
    total_votes: 15,
}

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
        file_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
        file_size: "2.7 MB",
        file_type: "jpg",
        thumbnail_width: 800,
        thumbnail_height: 600,
        file_thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=225&fit=crop"
    }
]

// Dummy users for reactions
const dummyUsers: Record<string, UserFields> = {
    "user1": {
        name: "Desirae Lipshutz",
        full_name: "Desirae Lipshutz",
        user_image: "https://randomuser.me/api/portraits/women/44.jpg",
        first_name: "Desirae",
        enabled: 1,
        type: "User",
        availability_status: "Available",
        custom_status: undefined
    },
    "user2": {
        name: "Brandon Franci",
        full_name: "Brandon Franci",
        user_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        first_name: "Brandon",
        enabled: 1,
        type: "User",
        availability_status: "Available",
        custom_status: undefined
    },
    "user3": {
        name: "Sarah Chen",
        full_name: "Sarah Chen",
        user_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        first_name: "Sarah",
        enabled: 1,
        type: "User",
        availability_status: "Available",
        custom_status: undefined
    },
    "user4": {
        name: "Mike Rodriguez",
        full_name: "Mike Rodriguez",
        user_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        first_name: "Mike",
        enabled: 1,
        type: "User",
        availability_status: "Available",
        custom_status: undefined
    },
    "user5": {
        name: "Alfonso Vaccarol",
        full_name: "Alfonso Vaccarol",
        user_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        first_name: "Alfonso",
        enabled: 1,
        type: "User",
        availability_status: "Available",
        custom_status: undefined
    }
}

// Dummy reactions
const dummyReactions1: ReactionObject[] = [
    {
        reaction: "🎉",
        users: ["user1", "user2", "user3"],
        count: 3,
        is_custom: false,
        emoji_name: "party_popper"
    },
    {
        reaction: "🔥",
        users: ["user2", "user4"],
        count: 2,
        is_custom: false,
        emoji_name: "fire"
    },
    {
        reaction: "😎",
        users: ["user5"],
        count: 1,
        is_custom: false,
        emoji_name: "smiling_face_with_sunglasses"
    },
    {
        reaction: "❤️",
        users: ["user1"],
        count: 1,
        is_custom: false,
        emoji_name: "heart"
    }
]

const dummyReactions2: ReactionObject[] = [
    {
        reaction: "👏",
        users: ["user1", "user2", "user3", "user4"],
        count: 4,
        is_custom: false,
        emoji_name: "clapping_hands"
    },
    {
        reaction: "🔥",
        users: ["user2", "user5"],
        count: 2,
        is_custom: false,
        emoji_name: "fire"
    }
]

const dummyReactions3: ReactionObject[] = [
    {
        reaction: "😍",
        users: ["user1", "user3"],
        count: 2,
        is_custom: false,
        emoji_name: "heart_eyes"
    },
    {
        reaction: "💯",
        users: ["user2"],
        count: 1,
        is_custom: false,
        emoji_name: "hundred_points"
    }
]

const dummyReactions4: ReactionObject[] = [
    {
        reaction: "🚀",
        users: ["user1", "user2", "user3", "user4", "user5"],
        count: 5,
        is_custom: false,
        emoji_name: "rocket"
    }
]

const dummyReactions5: ReactionObject[] = [
    {
        reaction: "✅",
        users: ["user1", "user2"],
        count: 2,
        is_custom: false,
        emoji_name: "check_mark"
    },
    {
        reaction: "📈",
        users: ["user3", "user4"],
        count: 2,
        is_custom: false,
        emoji_name: "chart_increasing"
    }
]



const dummyReactionsImage: ReactionObject[] = [
    {
        reaction: "😍",
        users: ["user1", "user2", "user3"],
        count: 3,
        is_custom: false,
        emoji_name: "heart_eyes"
    },
    {
        reaction: "🔥",
        users: ["user4"],
        count: 1,
        is_custom: false,
        emoji_name: "fire"
    },
    {
        reaction: "👏",
        users: ["user5"],
        count: 1,
        is_custom: false,
        emoji_name: "clapping_hands"
    }
]

export default function ChatStream({ messages = [] }: { messages?: Message[] }) {
    const currentUserId = "user1" // Current user ID for reactions

    const handleReactionClick = (emoji: string, isCustom?: boolean, emojiName?: string) => {
        console.log("Reaction clicked:", { emoji, isCustom, emojiName })
    }

    const handleAddReaction = () => {
        console.log("Add reaction clicked")
    }

    const latestMessageTimestamp = useRef<dayjs.Dayjs | null>(null)

    const formattedMessages = useMemo(() => {
        return formatMessages(messages)
    }, [messages])

    // We need to track when a message comes in view - this is to track the "Last Seen" timestamp for the user
    const onMessageInView = (message: Message) => {
        const creation = getDateObject(message.creation)
        // Compare the timestamp of the message to the latest message timestamp
        if (!latestMessageTimestamp.current) {
            latestMessageTimestamp.current = creation
        }
        if (creation.isAfter(latestMessageTimestamp.current)) {
            latestMessageTimestamp.current = creation

            // TODO: Message entered viewport — use for last-seen, read receipts, analytics, etc.
            console.log("Message in view", message.content)
        }
    }

    return (
        <div className="flex flex-col px-3 pb-8 w-full">

            {formattedMessages.map((message) => (
                message.message_type === 'date' ?
                    <DateSeparator label={message.creation} key={message.name} />
                    : message.message_type === "System" ?
                        <SystemMessage message={message.text ?? ''} key={message.name} time={message.creation} />
                        : <MessageItem message={message} key={message.name} onInView={onMessageInView} />
            )
            )}

            <PollMessage
                user={dummyUser1}
                poll={dummyPoll}
                currentUserVotes={dummyCurrentUserVotes}
                time="08:06 PM"
                name="msg-69"
            />

            <div>

                <MessageReactions
                    reactions={dummyReactions1}
                    allUsers={dummyUsers}
                    currentUserId={currentUserId}
                    onReactionClick={handleReactionClick}
                    onAddReaction={handleAddReaction}
                />
            </div>



            <DateSeparator label="Yesterday" />

            <div>
                <MessageReactions
                    reactions={dummyReactions2}
                    allUsers={dummyUsers}
                    currentUserId={currentUserId}
                    onReactionClick={handleReactionClick}
                    onAddReaction={handleAddReaction}
                />
            </div>

            <div>
                <ImageMessage
                    user={dummyUser2}
                    images={dummyImages}
                    time="07:30 PM"
                    message="Check out these design mockups and screenshots I've been working on"
                    name="msg-24"
                />
                <MessageReactions
                    reactions={dummyReactionsImage}
                    allUsers={dummyUsers}
                    currentUserId={currentUserId}
                    onReactionClick={handleReactionClick}
                    onAddReaction={handleAddReaction}
                />
            </div>




            <div>
                <MessageReactions
                    reactions={dummyReactions5}
                    allUsers={dummyUsers}
                    currentUserId={currentUserId}
                    onReactionClick={handleReactionClick}
                    onAddReaction={handleAddReaction}
                />
            </div>



            <DateSeparator label="Today" />





            <PollMessage
                user={dummyUser1}
                poll={dummyPoll2}
                currentUserVotes={dummyCurrentUserVotes2}
                time="10:16 AM"
                name="msg-37"
            />

            <PollMessage
                user={dummyUser1}
                poll={dummyPoll3}
                currentUserVotes={dummyCurrentUserVotes3}
                time="11:31 AM"
                name="msg-50"
            />

            {/* Example 1: Anonymous single choice poll (user hasn't voted) */}
            <PollVotingMessage
                user={dummyUser2}
                poll={dummyPoll4}
                options={dummyPoll4.options}
                time="12:00 PM"
                name="msg-poll-1"
                onOptionSelect={(option) => {
                    console.log("Selected option:", option)
                }}
            />

            {/* Example 2: Multi choice poll (user hasn't voted) */}
            <PollVotingMessage
                user={dummyUser3}
                poll={dummyPoll5}
                options={dummyPoll5.options}
                time="12:05 PM"
                name="msg-poll-2"
                onOptionToggle={(optionId, checked) => {
                    console.log("Toggled option:", optionId, checked)
                }}
                onSubmit={(selectedIds) => {
                    console.log("Submitted options:", selectedIds)
                }}
            />

            {/* Example 3: Single choice poll (user hasn't voted) */}
            <PollVotingMessage
                user={dummyUser4}
                poll={dummyPoll6}
                options={dummyPoll6.options}
                time="12:10 PM"
                name="msg-poll-3"
                onOptionSelect={(option) => {
                    console.log("Selected option:", option)
                }}
            />

            {/* Example 4: Multi choice poll (user hasn't voted) - Anonymous */}
            <PollVotingMessage
                user={dummyUser5}
                poll={dummyPoll7}
                options={dummyPoll7.options}
                time="12:15 PM"
                name="msg-poll-4"
                onOptionToggle={(optionId, checked) => {
                    console.log("Toggled option:", optionId, checked)
                }}
                onSubmit={(selectedIds) => {
                    console.log("Submitted options:", selectedIds)
                }}
            />

            {/* Example 5: Closed single choice poll (user hasn't voted) - Shows results */}
            <PollMessage
                user={dummyUser1}
                poll={dummyPoll8}
                currentUserVotes={[]}
                time="12:20 PM"
                name="msg-poll-5"
            />

            <ImageMessage
                user={dummyUser1}
                images={dummySingleImage}
                time="11:35 AM"
                message="Here's the product shot we discussed in the meeting"
                name="msg-56"
            />

            <ImageMessage
                user={dummyUser2}
                images={dummyTwoImages}
                time="11:40 AM"
                message="Here's the before and after comparison you asked for"
                name="msg-59"
            />


            <ImageMessage
                user={dummyUser1}
                images={dummyThreeImages}
                time="11:45 AM"
                message="UI design progress - wireframes and prototype for the mobile app"
                name="msg-71"
            />

            <ImageMessage
                user={dummyUser2}
                images={dummySixImages}
                time="11:50 AM"
                message="Q4 analytics and reports - we're seeing great growth!"
                name="msg-74"
            />

            <ImageMessage
                user={dummyUser1}
                images={dummyTenImages}
                time="11:55 AM"
                message="Complete project documentation and assets for all platforms"
                name="msg-77"
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
        </div>
    )
}