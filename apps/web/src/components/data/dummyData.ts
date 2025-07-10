import { UserFields } from "@raven/types/common/UserFields"
import { ReactionObject } from "@raven/types/common/ChatStream"
import { TextMessage, ImageMessage, FileMessage, PollMessage, SystemMessage, Message } from "@raven/types/common/Message"

export interface Thread {
    id: string;
    name: string;
    channelId: string;
    participantIds: string[];
    lastMessage?: string;
    lastMessageTime?: string;
    participantCount: number;
}

export const dummyUsers: Record<string, UserFields> = {
    'john.doe@example.com': {
        name: 'john.doe@example.com',
        full_name: 'John Doe',
        first_name: 'John',
        user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        enabled: 1,
        type: 'User',
        availability_status: 'Available',
        custom_status: 'Working on the new feature 🚀'
    },
    'jane.smith@example.com': {
        name: 'jane.smith@example.com',
        full_name: 'Jane Smith',
        first_name: 'Jane',
        user_image: 'https://randomuser.me/api/portraits/women/44.jpg',
        enabled: 1,
        type: 'User',
        availability_status: 'Away',
        custom_status: 'In a meeting'
    },
    'bot@example.com': {
        name: 'bot@example.com',
        full_name: 'Assistant Bot',
        first_name: 'Assistant',
        user_image: '',
        enabled: 1,
        type: 'Bot',
        availability_status: 'Available',
        custom_status: ''
    },
    'sarah.wilson@example.com': {
        name: 'sarah.wilson@example.com',
        full_name: 'Sarah Wilson',
        first_name: 'Sarah',
        user_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        enabled: 1,
        type: 'User',
        availability_status: 'Do not disturb',
        custom_status: 'Deep work mode'
    },
    'mike.johnson@example.com': {
        name: 'mike.johnson@example.com',
        full_name: 'Mike Johnson',
        first_name: 'Mike',
        user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        enabled: 1,
        type: 'User',
        availability_status: 'Available',
        custom_status: 'Available for collaboration'
    },
    'emma.davis@example.com': {
        name: 'emma.davis@example.com',
        full_name: 'Emma Davis',
        first_name: 'Emma',
        user_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        enabled: 1,
        type: 'User',
        availability_status: 'Invisible',
        custom_status: 'Focus time'
    }
};

export const dummyReactions: ReactionObject[] = [
    {
        reaction: '👍',
        users: ['john.doe@example.com', 'jane.smith@example.com'],
        count: 2,
        is_custom: false,
        emoji_name: 'thumbs_up'
    },
    {
        reaction: '❤️',
        users: ['sarah.wilson@example.com'],
        count: 1,
        is_custom: false,
        emoji_name: 'heart'
    },
    {
        reaction: 'https://example.com/custom-emoji.png',
        users: ['john.doe@example.com'],
        count: 1,
        is_custom: true,
        emoji_name: 'rocket'
    },
    {
        reaction: '😂',
        users: ['mike.johnson@example.com', 'emma.davis@example.com'],
        count: 2,
        is_custom: false,
        emoji_name: 'joy'
    },
    {
        reaction: '👏',
        users: ['john.doe@example.com', 'sarah.wilson@example.com', 'mike.johnson@example.com'],
        count: 3,
        is_custom: false,
        emoji_name: 'clap'
    }
];

export const dummyTextMessage: TextMessage = {
    name: 'msg1',
    owner: 'john.doe@example.com',
    _liked_by: '["john.doe@example.com"]',
    channel_id: 'general',
    creation: '2024-01-15 10:30:00',
    modified: '2024-01-15 10:30:00',
    message_type: 'Text',
    text: '<p>Hey team! 👋 Just wanted to share this <strong>amazing</strong> new feature we\'ve been working on. Check out the <a href="https://example.com">documentation</a> when you get a chance!</p><p>Also, don\'t forget about our standup at 2 PM today. We\'ll be discussing:</p><ul><li>Sprint progress</li><li>Blockers</li><li>Next week\'s goals</li></ul><p>@jane.smith@example.com @sarah.wilson@example.com please make sure to attend!</p>',
    message_reactions: JSON.stringify({
        'thumbs_up': dummyReactions[0],
        'heart': dummyReactions[1],
        'clap': dummyReactions[4]
    }),
    is_continuation: 0,
    is_reply: 0,
    is_edited: 0,
    is_forwarded: 0,
    is_thread: 0,
    is_pinned: 0,
    is_bot_message: 0,
    hide_link_preview: 0,
    might_contain_link_preview: true,
    content: 'Hey team! Just wanted to share this amazing new feature we\'ve been working on. Check out the documentation when you get a chance! Also, don\'t forget about our standup at 2 PM today. We\'ll be discussing: Sprint progress Blockers Next week\'s goals @jane.smith@example.com @sarah.wilson@example.com please make sure to attend!',
    formattedTime: '10:30 AM',
    isOpenInThread: false
};

export const dummyImageMessage: ImageMessage = {
    name: 'msg2',
    owner: 'jane.smith@example.com',
    _liked_by: '["jane.smith@example.com"]',
    channel_id: 'design',
    creation: '2024-01-15 11:45:00',
    modified: '2024-01-15 11:45:00',
    message_type: 'Image',
    text: 'New mockup for the dashboard! What do you think? 🎨',
    file: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    thumbnail_width: 800,
    thumbnail_height: 600,
    image_thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.',
    message_reactions: JSON.stringify({
        'heart': dummyReactions[1],
        'rocket': dummyReactions[2],
        'joy': dummyReactions[3]
    }),
    is_continuation: 0,
    is_reply: 1,
    linked_message: 'msg1',
    is_edited: 0,
    is_forwarded: 0,
    is_thread: 0,
    is_pinned: 1,
    is_bot_message: 0,
    hide_link_preview: 0,
    might_contain_link_preview: false,
    content: 'New mockup for the dashboard! What do you think?',
    formattedTime: '11:45 AM',
    isOpenInThread: false,
    replied_message_details: JSON.stringify({
        name: 'msg1',
        text: 'Hey team! Just wanted to share...',
        owner: 'john.doe@example.com',
        message_type: 'Text',
        content: 'Hey team! Just wanted to share this amazing new feature...',
        creation: '2024-01-15 10:30:00'
    })
};

export const dummyFileMessage: FileMessage = {
    name: 'msg3',
    owner: 'sarah.wilson@example.com',
    _liked_by: '["sarah.wilson@example.com"]',
    channel_id: 'general',
    creation: '2024-01-15 12:15:00',
    modified: '2024-01-15 12:15:00',
    message_type: 'File',
    text: 'Here\'s the latest project proposal. Please review by EOD! 📄',
    file: '/files/project-proposal-q1-2024.pdf',
    message_reactions: JSON.stringify({
        'thumbs_up': dummyReactions[0]
    }),
    is_continuation: 0,
    is_reply: 0,
    is_edited: 1,
    is_forwarded: 1,
    is_thread: 1,
    is_pinned: 0,
    is_bot_message: 0,
    hide_link_preview: 0,
    might_contain_link_preview: false,
    content: 'Here\'s the latest project proposal. Please review by EOD!',
    formattedTime: '12:15 PM',
    isOpenInThread: true,
    link_doctype: 'Project',
    link_document: 'PROJ-2024-001'
};

export const dummyPollMessage: PollMessage = {
    name: 'msg4',
    owner: 'john.doe@example.com',
    _liked_by: '["john.doe@example.com"]',
    channel_id: 'general',
    creation: '2024-01-15 13:30:00',
    modified: '2024-01-15 13:30:00',
    message_type: 'Poll',
    text: 'Team lunch preference for Friday? 🍕',
    poll_id: 'poll1',
    is_continuation: 0,
    is_reply: 0,
    is_edited: 0,
    is_forwarded: 0,
    is_thread: 0,
    is_pinned: 0,
    is_bot_message: 0,
    hide_link_preview: 0,
    might_contain_link_preview: false,
    content: 'Team lunch preference for Friday?',
    formattedTime: '1:30 PM',
    isOpenInThread: false
};

export const dummySystemMessage: SystemMessage = {
    name: 'msg5',
    owner: 'system',
    _liked_by: '[]',
    channel_id: 'general',
    creation: '2024-01-15 14:00:00',
    modified: '2024-01-15 14:00:00',
    message_type: 'System',
    text: 'Mike Johnson joined the channel',
    is_continuation: 0,
    is_reply: 0,
    is_edited: 0,
    is_forwarded: 0,
    is_thread: 0,
    is_pinned: 0,
    is_bot_message: 0,
    hide_link_preview: 0,
    might_contain_link_preview: false,
    content: 'Mike Johnson joined the channel',
    formattedTime: '2:00 PM',
    isOpenInThread: false
};

export const dummyBotMessage: TextMessage = {
    name: 'msg6',
    owner: 'bot@example.com',
    _liked_by: '["john.doe@example.com"]',
    channel_id: 'general',
    creation: '2024-01-15 14:30:00',
    modified: '2024-01-15 14:30:00',
    message_type: 'Text',
    text: '<p>Hello! I\'m your AI assistant. I can help you with:</p><ul><li>Answering questions</li><li>Summarizing documents</li><li>Generating code</li><li>And much more!</li></ul><p>Just mention me or ask me anything! 🤖</p>',
    message_reactions: JSON.stringify({
        'thumbs_up': dummyReactions[0],
        'heart': dummyReactions[1]
    }),
    is_continuation: 0,
    is_reply: 0,
    is_edited: 0,
    is_forwarded: 0,
    is_thread: 0,
    is_pinned: 0,
    is_bot_message: 1,
    bot: 'bot@example.com',
    hide_link_preview: 0,
    might_contain_link_preview: false,
    content: 'Hello! I\'m your AI assistant. I can help you with: Answering questions Summarizing documents Generating code And much more! Just mention me or ask me anything!',
    formattedTime: '2:30 PM',
    isOpenInThread: false
};

export const dummyContinuationMessage: TextMessage = {
    name: 'msg7',
    owner: 'john.doe@example.com',
    _liked_by: '[]',
    channel_id: 'general',
    creation: '2024-01-15 15:00:00',
    modified: '2024-01-15 15:00:00',
    message_type: 'Text',
    text: '<p>This is a continuation of my previous message. Just adding more thoughts here...</p>',
    message_reactions: JSON.stringify({}),
    is_continuation: 1,
    is_reply: 0,
    is_edited: 0,
    is_forwarded: 0,
    is_thread: 0,
    is_pinned: 0,
    is_bot_message: 0,
    hide_link_preview: 0,
    might_contain_link_preview: false,
    content: 'This is a continuation of my previous message. Just adding more thoughts here...',
    formattedTime: '3:00 PM',
    isOpenInThread: false
};

export const dummyThreadMessage: TextMessage = {
    name: 'msg8',
    owner: 'emma.davis@example.com',
    _liked_by: '["mike.johnson@example.com"]',
    channel_id: 'thread-msg3',
    creation: '2024-01-15 15:30:00',
    modified: '2024-01-15 15:30:00',
    message_type: 'Text',
    text: '<p>Great proposal! I have a few suggestions for the timeline section. Can we discuss this in detail?</p>',
    message_reactions: JSON.stringify({
        'thumbs_up': dummyReactions[0]
    }),
    is_continuation: 0,
    is_reply: 0,
    is_edited: 0,
    is_forwarded: 0,
    is_thread: 1,
    is_pinned: 0,
    is_bot_message: 0,
    hide_link_preview: 0,
    might_contain_link_preview: false,
    content: 'Great proposal! I have a few suggestions for the timeline section. Can we discuss this in detail?',
    formattedTime: '3:30 PM',
    isOpenInThread: true
};

export const dummyPollData = {
    poll: {
        name: 'poll1',
        creation: '2024-01-15 13:30:00',
        modified: '2024-01-15 13:30:00',
        owner: 'john.doe@example.com',
        modified_by: 'john.doe@example.com',
        docstatus: 0 as const,
        question: 'Where should we go for team lunch on Friday?',
        options: [
            {
                name: 'opt1',
                creation: '2024-01-15 13:30:00',
                modified: '2024-01-15 13:30:00',
                owner: 'john.doe@example.com',
                modified_by: 'john.doe@example.com',
                docstatus: 0 as const,
                option: 'Italian Restaurant 🍝',
                votes: 5
            },
            {
                name: 'opt2',
                creation: '2024-01-15 13:30:00',
                modified: '2024-01-15 13:30:00',
                owner: 'john.doe@example.com',
                modified_by: 'john.doe@example.com',
                docstatus: 0 as const,
                option: 'Sushi Place 🍣',
                votes: 3
            },
            {
                name: 'opt3',
                creation: '2024-01-15 13:30:00',
                modified: '2024-01-15 13:30:00',
                owner: 'john.doe@example.com',
                modified_by: 'john.doe@example.com',
                docstatus: 0 as const,
                option: 'Mexican Food 🌮',
                votes: 7
            },
            {
                name: 'opt4',
                creation: '2024-01-15 13:30:00',
                modified: '2024-01-15 13:30:00',
                owner: 'john.doe@example.com',
                modified_by: 'john.doe@example.com',
                docstatus: 0 as const,
                option: 'Pizza Place 🍕',
                votes: 4
            }
        ],
        is_anonymous: 0 as 0 | 1,
        is_multi_choice: 0 as 0 | 1,
        is_disabled: 0 as 0 | 1,
        total_votes: 19
    },
    current_user_votes: [
        { option: 'opt3' }
    ]
};

export const dummySupportPollData = {
    poll: {
        name: 'poll2',
        creation: '2024-01-15 16:45:00',
        modified: '2024-01-15 16:45:00',
        owner: 'sarah.wilson@example.com',
        modified_by: 'sarah.wilson@example.com',
        docstatus: 0 as const,
        question: 'What\'s the most common support issue this week?',
        options: [
            {
                name: 'opt5',
                creation: '2024-01-15 16:45:00',
                modified: '2024-01-15 16:45:00',
                owner: 'sarah.wilson@example.com',
                modified_by: 'sarah.wilson@example.com',
                docstatus: 0 as const,
                option: 'Login Problems 🔐',
                votes: 12
            },
            {
                name: 'opt6',
                creation: '2024-01-15 16:45:00',
                modified: '2024-01-15 16:45:00',
                owner: 'sarah.wilson@example.com',
                modified_by: 'sarah.wilson@example.com',
                docstatus: 0 as const,
                option: 'Payment Issues 💳',
                votes: 8
            },
            {
                name: 'opt7',
                creation: '2024-01-15 16:45:00',
                modified: '2024-01-15 16:45:00',
                owner: 'sarah.wilson@example.com',
                modified_by: 'sarah.wilson@example.com',
                docstatus: 0 as const,
                option: 'Feature Requests 💡',
                votes: 15
            },
            {
                name: 'opt8',
                creation: '2024-01-15 16:45:00',
                modified: '2024-01-15 16:45:00',
                owner: 'sarah.wilson@example.com',
                modified_by: 'sarah.wilson@example.com',
                docstatus: 0 as const,
                option: 'Bug Reports 🐛',
                votes: 6
            }
        ],
        is_anonymous: 0 as 0 | 1,
        is_multi_choice: 0 as 0 | 1,
        is_disabled: 0 as 0 | 1,
        total_votes: 41
    },
    current_user_votes: [
        { option: 'opt7' }
    ]
};

export const dummyMessages: Message[] = [
    dummyTextMessage,
    dummyImageMessage,
    dummyFileMessage,
    dummyPollMessage,
    dummySystemMessage,
    dummyBotMessage,
    dummyContinuationMessage,
    dummyThreadMessage,
    // Development channel messages
    {
        name: 'msg9',
        owner: 'mike.johnson@example.com',
        _liked_by: '["mike.johnson@example.com", "john.doe@example.com"]',
        channel_id: 'development',
        creation: '2024-01-15 16:45:00',
        modified: '2024-01-15 16:45:00',
        message_type: 'Text',
        text: '<p>Just deployed the new API endpoint to production! 🚀</p><p>The new user authentication system is now live. @john.doe@example.com can you test the login flow?</p>',
        message_reactions: JSON.stringify({
            'rocket': dummyReactions[2],
            'thumbs_up': dummyReactions[0]
        }),
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'Just deployed the new API endpoint to production! The new user authentication system is now live. @john.doe@example.com can you test the login flow?',
        formattedTime: '4:45 PM',
        isOpenInThread: false
    } as TextMessage,
    {
        name: 'msg18',
        owner: 'john.doe@example.com',
        _liked_by: '["john.doe@example.com"]',
        channel_id: 'development',
        creation: '2024-01-15 17:00:00',
        modified: '2024-01-15 17:00:00',
        message_type: 'Text',
        text: '<p>Testing now... looks good! 👍</p><p>One small issue: the password reset flow is throwing a 500 error. I\'ll create a ticket for it.</p>',
        message_reactions: JSON.stringify({
            'thumbs_up': dummyReactions[0]
        }),
        is_continuation: 0,
        is_reply: 1,
        linked_message: 'msg9',
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'Testing now... looks good! One small issue: the password reset flow is throwing a 500 error. I\'ll create a ticket for it.',
        formattedTime: '5:00 PM',
        isOpenInThread: false,
        replied_message_details: JSON.stringify({
            name: 'msg9',
            text: 'Just deployed the new API endpoint to production!',
            owner: 'mike.johnson@example.com',
            message_type: 'Text',
            content: 'Just deployed the new API endpoint to production!',
            creation: '2024-01-15 16:45:00'
        })
    } as TextMessage,
    // Marketing channel messages
    {
        name: 'msg10',
        owner: 'sarah.wilson@example.com',
        _liked_by: '["sarah.wilson@example.com", "jane.smith@example.com"]',
        channel_id: 'marketing',
        creation: '2024-01-15 14:20:00',
        modified: '2024-01-15 14:20:00',
        message_type: 'Text',
        text: '<p>Q1 campaign results are in! 🎉</p><p>We exceeded our targets by 15%! Key highlights:</p><ul><li>Email campaign: 25% open rate (target: 20%)</li><li>Social media: 150% increase in engagement</li><li>Website traffic: 40% boost</li></ul><p>Great work team! @jane.smith@example.com your design work really made a difference!</p>',
        message_reactions: JSON.stringify({
            'clap': dummyReactions[4],
            'heart': dummyReactions[1],
            'rocket': dummyReactions[2]
        }),
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'Q1 campaign results are in! We exceeded our targets by 15%! Key highlights: Email campaign: 25% open rate (target: 20%) Social media: 150% increase in engagement Website traffic: 40% boost Great work team! @jane.smith@example.com your design work really made a difference!',
        formattedTime: '2:20 PM',
        isOpenInThread: false
    } as TextMessage,
    // Random channel messages
    {
        name: 'msg11',
        owner: 'john.doe@example.com',
        _liked_by: '["john.doe@example.com", "mike.johnson@example.com", "emma.davis@example.com"]',
        channel_id: 'random',
        creation: '2024-01-15 17:15:00',
        modified: '2024-01-15 17:15:00',
        message_type: 'Text',
        text: '<p>Anyone up for lunch tomorrow? 🍕</p><p>I\'m thinking we could try that new Italian place downtown. @mike.johnson@example.com @emma.davis@example.com @jane.smith@example.com</p>',
        message_reactions: JSON.stringify({
            'thumbs_up': dummyReactions[0],
            'heart': dummyReactions[1]
        }),
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'Anyone up for lunch tomorrow? I\'m thinking we could try that new Italian place downtown. @mike.johnson@example.com @emma.davis@example.com @jane.smith@example.com',
        formattedTime: '5:15 PM',
        isOpenInThread: false
    } as TextMessage,
    // Project Alpha (private) messages
    {
        name: 'msg12',
        owner: 'jane.smith@example.com',
        _liked_by: '["jane.smith@example.com", "john.doe@example.com"]',
        channel_id: 'project-alpha',
        creation: '2024-01-15 13:45:00',
        modified: '2024-01-15 13:45:00',
        message_type: 'Text',
        text: '<p>Phase 1 is complete! ✅</p><p>All core features are implemented and tested. Ready for Phase 2 planning meeting tomorrow at 10 AM.</p><p>@john.doe@example.com please review the final deliverables before we move forward.</p>',
        message_reactions: JSON.stringify({
            'clap': dummyReactions[4],
            'thumbs_up': dummyReactions[0]
        }),
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'Phase 1 is complete! All core features are implemented and tested. Ready for Phase 2 planning meeting tomorrow at 10 AM. @john.doe@example.com please review the final deliverables before we move forward.',
        formattedTime: '1:45 PM',
        isOpenInThread: false
    } as TextMessage,
    // Customer Support messages
    {
        name: 'msg13',
        owner: 'emma.davis@example.com',
        _liked_by: '["emma.davis@example.com"]',
        channel_id: 'customer-support',
        creation: '2024-01-15 16:30:00',
        modified: '2024-01-15 16:30:00',
        message_type: 'Text',
        text: '<p>🚨 Escalated ticket #1234 needs attention</p><p>Customer is experiencing critical data loss. Priority: HIGH</p><p>@mike.johnson@example.com can you look into this? The customer is a VIP account.</p>',
        message_reactions: JSON.stringify({
            'thumbs_up': dummyReactions[0]
        }),
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'Escalated ticket #1234 needs attention Customer is experiencing critical data loss. Priority: HIGH @mike.johnson@example.com can you look into this? The customer is a VIP account.',
        formattedTime: '4:30 PM',
        isOpenInThread: false
    } as TextMessage,
    // AI Assistant messages
    {
        name: 'msg22',
        owner: 'john.doe@example.com',
        _liked_by: '["john.doe@example.com"]',
        channel_id: 'ai-assistant',
        creation: '2024-01-15 14:45:00',
        modified: '2024-01-15 14:45:00',
        message_type: 'Text',
        text: '<p>Can you help me create a summary of our Q1 marketing campaign results?</p>',
        message_reactions: JSON.stringify({}),
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'Can you help me create a summary of our Q1 marketing campaign results?',
        formattedTime: '2:45 PM',
        isOpenInThread: false
    } as TextMessage,
    {
        name: 'msg23',
        owner: 'bot@example.com',
        _liked_by: '["john.doe@example.com"]',
        channel_id: 'ai-assistant',
        creation: '2024-01-15 14:46:00',
        modified: '2024-01-15 14:46:00',
        message_type: 'Text',
        text: '<p>I\'d be happy to help you create a summary of your Q1 marketing campaign results! 📊</p><p>Based on the data I can see, here\'s a comprehensive summary:</p><ul><li><strong>Overall Performance:</strong> Exceeded targets by 15%</li><li><strong>Email Campaign:</strong> 25% open rate (5% above target)</li><li><strong>Social Media:</strong> 150% increase in engagement</li><li><strong>Website Traffic:</strong> 40% boost in organic traffic</li></ul><p>Would you like me to create a detailed report or focus on any specific aspect?</p>',
        message_reactions: JSON.stringify({
            'thumbs_up': dummyReactions[0],
            'heart': dummyReactions[1]
        }),
        is_continuation: 0,
        is_reply: 1,
        linked_message: 'msg22',
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 1,
        bot: 'bot@example.com',
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'I\'d be happy to help you create a summary of your Q1 marketing campaign results! Based on the data I can see, here\'s a comprehensive summary: Overall Performance: Exceeded targets by 15% Email Campaign: 25% open rate (5% above target) Social Media: 150% increase in engagement Website Traffic: 40% boost in organic traffic Would you like me to create a detailed report or focus on any specific aspect?',
        formattedTime: '2:46 PM',
        isOpenInThread: false,
        replied_message_details: JSON.stringify({
            name: 'msg22',
            text: 'Can you help me create a summary of our Q1 marketing campaign results?',
            owner: 'john.doe@example.com',
            message_type: 'Text',
            content: 'Can you help me create a summary of our Q1 marketing campaign results?',
            creation: '2024-01-15 14:45:00'
        })
    } as TextMessage,
    // Archived project messages
    {
        name: 'msg14',
        owner: 'john.doe@example.com',
        _liked_by: '["john.doe@example.com", "jane.smith@example.com", "mike.johnson@example.com"]',
        channel_id: 'archived-project',
        creation: '2023-12-15 10:00:00',
        modified: '2023-12-15 10:00:00',
        message_type: 'Text',
        text: '<p>🎉 Project completed successfully!</p><p>All milestones achieved on time and under budget. Great work everyone! This project has been a huge success.</p><p>I\'ll be archiving this channel now. Thanks for all the hard work! @jane.smith@example.com @mike.johnson@example.com</p>',
        message_reactions: JSON.stringify({
            'clap': dummyReactions[4],
            'heart': dummyReactions[1],
            'rocket': dummyReactions[2]
        }),
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 1,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'Project completed successfully! All milestones achieved on time and under budget. Great work everyone! This project has been a huge success. I\'ll be archiving this channel now. Thanks for all the hard work! @jane.smith@example.com @mike.johnson@example.com',
        formattedTime: '10:00 AM',
        isOpenInThread: false
    } as TextMessage,
    // Workspace 2 messages
    {
        name: 'msg15',
        owner: 'emma.davis@example.com',
        _liked_by: '["emma.davis@example.com"]',
        channel_id: 'workspace-2-general',
        creation: '2024-01-15 16:00:00',
        modified: '2024-01-15 16:00:00',
        message_type: 'Text',
        text: '<p>Welcome to Workspace 2! 👋</p><p>This is our new workspace for the European expansion project. Let\'s make it great!</p>',
        message_reactions: JSON.stringify({
            'thumbs_up': dummyReactions[0],
            'clap': dummyReactions[4]
        }),
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'Welcome to Workspace 2! This is our new workspace for the European expansion project. Let\'s make it great!',
        formattedTime: '4:00 PM',
        isOpenInThread: false
    } as TextMessage,
    {
        name: 'msg16',
        owner: 'mike.johnson@example.com',
        _liked_by: '["mike.johnson@example.com"]',
        channel_id: 'workspace-2-dev',
        creation: '2024-01-15 15:45:00',
        modified: '2024-01-15 15:45:00',
        message_type: 'Text',
        text: '<p>Setting up the new environment for the European servers 🌍</p><p>Should be ready for testing by tomorrow morning. @emma.davis@example.com will coordinate with the local team.</p>',
        message_reactions: JSON.stringify({
            'thumbs_up': dummyReactions[0]
        }),
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'Setting up the new environment for the European servers Should be ready for testing by tomorrow morning. @emma.davis@example.com will coordinate with the local team.',
        formattedTime: '3:45 PM',
        isOpenInThread: false
    } as TextMessage,
    // Synced channel messages
    {
        name: 'msg17',
        owner: 'system',
        _liked_by: '[]',
        channel_id: 'synced-channel',
        creation: '2024-01-15 14:15:00',
        modified: '2024-01-15 14:15:00',
        message_type: 'System',
        text: 'External message synced from CRM system',
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'External message synced from CRM system',
        formattedTime: '2:15 PM',
        isOpenInThread: false
    } as SystemMessage,
    // DM messages
    {
        name: 'msg24',
        owner: 'john.doe@example.com',
        _liked_by: '["john.doe@example.com"]',
        channel_id: 'dm-john-sarah',
        creation: '2024-01-15 12:00:00',
        modified: '2024-01-15 12:00:00',
        message_type: 'Text',
        text: '<p>Hey Sarah! Quick question about the Q1 budget review - do you have the final numbers ready?</p>',
        message_reactions: JSON.stringify({}),
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'Hey Sarah! Quick question about the Q1 budget review - do you have the final numbers ready?',
        formattedTime: '12:00 PM',
        isOpenInThread: false
    } as TextMessage,
    {
        name: 'msg25',
        owner: 'sarah.wilson@example.com',
        _liked_by: '["sarah.wilson@example.com"]',
        channel_id: 'dm-john-sarah',
        creation: '2024-01-15 12:05:00',
        modified: '2024-01-15 12:05:00',
        message_type: 'Text',
        text: '<p>Hi John! Yes, I just finished compiling them. I\'ll send you the report in a few minutes.</p>',
        message_reactions: JSON.stringify({
            'thumbs_up': dummyReactions[0]
        }),
        is_continuation: 0,
        is_reply: 1,
        linked_message: 'msg24',
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'Hi John! Yes, I just finished compiling them. I\'ll send you the report in a few minutes.',
        formattedTime: '12:05 PM',
        isOpenInThread: false,
        replied_message_details: JSON.stringify({
            name: 'msg24',
            text: 'Hey Sarah! Quick question about the Q1 budget review...',
            owner: 'john.doe@example.com',
            message_type: 'Text',
            content: 'Hey Sarah! Quick question about the Q1 budget review - do you have the final numbers ready?',
            creation: '2024-01-15 12:00:00'
        })
    } as TextMessage,
    {
        name: 'msg26',
        owner: 'jane.smith@example.com',
        _liked_by: '["jane.smith@example.com"]',
        channel_id: 'dm-jane-mike',
        creation: '2024-01-15 14:50:00',
        modified: '2024-01-15 14:50:00',
        message_type: 'Text',
        text: '<p>Mike, can you help me with the API integration for the new feature? I\'m getting a CORS error.</p>',
        message_reactions: JSON.stringify({}),
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'Mike, can you help me with the API integration for the new feature? I\'m getting a CORS error.',
        formattedTime: '2:50 PM',
        isOpenInThread: false
    } as TextMessage,
    // Additional realistic messages
    {
        name: 'msg27',
        owner: 'emma.davis@example.com',
        _liked_by: '["emma.davis@example.com"]',
        channel_id: 'development',
        creation: '2024-01-15 17:15:00',
        modified: '2024-01-15 17:15:00',
        message_type: 'File',
        text: 'Here\'s the updated API documentation with the new endpoints 📚',
        file: '/files/api-documentation-v2.1.pdf',
        message_reactions: JSON.stringify({
            'clap': dummyReactions[4]
        }),
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 1,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'Here\'s the updated API documentation with the new endpoints',
        formattedTime: '5:15 PM',
        isOpenInThread: false
    } as FileMessage,
    {
        name: 'msg28',
        owner: 'jane.smith@example.com',
        _liked_by: '["jane.smith@example.com"]',
        channel_id: 'marketing',
        creation: '2024-01-15 14:35:00',
        modified: '2024-01-15 14:35:00',
        message_type: 'Image',
        text: 'New social media banner designs for Q2 campaign! What do you think? 🎨',
        file: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
        thumbnail_width: 800,
        thumbnail_height: 400,
        image_thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop',
        blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.',
        message_reactions: JSON.stringify({
            'heart': dummyReactions[1],
            'thumbs_up': dummyReactions[0]
        }),
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'New social media banner designs for Q2 campaign! What do you think?',
        formattedTime: '2:35 PM',
        isOpenInThread: false
    } as ImageMessage,
    {
        name: 'msg29',
        owner: 'mike.johnson@example.com',
        _liked_by: '["mike.johnson@example.com"]',
        channel_id: 'random',
        creation: '2024-01-15 17:20:00',
        modified: '2024-01-15 17:20:00',
        message_type: 'Text',
        text: '<p>I\'m in! 🍝</p><p>Heard they have amazing pasta. What time works for everyone?</p>',
        message_reactions: JSON.stringify({
            'thumbs_up': dummyReactions[0]
        }),
        is_continuation: 0,
        is_reply: 1,
        linked_message: 'msg11',
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'I\'m in! Heard they have amazing pasta. What time works for everyone?',
        formattedTime: '5:20 PM',
        isOpenInThread: false,
        replied_message_details: JSON.stringify({
            name: 'msg11',
            text: 'Anyone up for lunch tomorrow?',
            owner: 'john.doe@example.com',
            message_type: 'Text',
            content: 'Anyone up for lunch tomorrow?',
            creation: '2024-01-15 17:15:00'
        })
    } as TextMessage,
    {
        name: 'msg30',
        owner: 'sarah.wilson@example.com',
        _liked_by: '["sarah.wilson@example.com"]',
        channel_id: 'customer-support',
        creation: '2024-01-15 16:45:00',
        modified: '2024-01-15 16:45:00',
        message_type: 'Poll',
        text: 'What\'s the most common support issue this week? 📊',
        poll_id: 'poll2',
        is_continuation: 0,
        is_reply: 0,
        is_edited: 0,
        is_forwarded: 0,
        is_thread: 0,
        is_pinned: 0,
        is_bot_message: 0,
        hide_link_preview: 0,
        might_contain_link_preview: false,
        content: 'What\'s the most common support issue this week?',
        formattedTime: '4:45 PM',
        isOpenInThread: false
    } as PollMessage
];

export const dummyChannels = {
    'general': {
        name: 'general',
        channel_name: 'General Discussion',
        channel_description: 'General team discussions and announcements',
        is_direct_message: 0,
        type: 'Public',
        workspace: 'Default Workspace',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 0,
        last_message_timestamp: '2024-01-15 15:30:00',
        last_message_details: JSON.stringify({
            name: 'msg8',
            owner: 'emma.davis@example.com',
            text: 'Great proposal! I have a few suggestions...',
            message_type: 'Text'
        })
    },
    'design': {
        name: 'design',
        channel_name: 'Design Team',
        channel_description: 'Design-related discussions and feedback',
        is_direct_message: 0,
        type: 'Public',
        workspace: 'Default Workspace',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 0,
        last_message_timestamp: '2024-01-15 11:45:00',
        last_message_details: JSON.stringify({
            name: 'msg2',
            owner: 'jane.smith@example.com',
            text: 'New mockup for the dashboard!',
            message_type: 'Image'
        })
    },
    'development': {
        name: 'development',
        channel_name: 'Development Team',
        channel_description: 'Development discussions, code reviews, and technical planning',
        is_direct_message: 0,
        type: 'Public',
        workspace: 'Default Workspace',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 0,
        last_message_timestamp: '2024-01-15 16:45:00',
        last_message_details: JSON.stringify({
            name: 'msg9',
            owner: 'mike.johnson@example.com',
            text: 'Just deployed the new API endpoint',
            message_type: 'Text'
        })
    },
    'marketing': {
        name: 'marketing',
        channel_name: 'Marketing & Growth',
        channel_description: 'Marketing campaigns, content strategy, and growth initiatives',
        is_direct_message: 0,
        type: 'Public',
        workspace: 'Default Workspace',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 0,
        last_message_timestamp: '2024-01-15 14:20:00',
        last_message_details: JSON.stringify({
            name: 'msg10',
            owner: 'sarah.wilson@example.com',
            text: 'Q1 campaign results are in!',
            message_type: 'Text'
        })
    },
    'random': {
        name: 'random',
        channel_name: 'Random',
        channel_description: 'Non-work related discussions and fun stuff',
        is_direct_message: 0,
        type: 'Public',
        workspace: 'Default Workspace',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 0,
        last_message_timestamp: '2024-01-15 17:15:00',
        last_message_details: JSON.stringify({
            name: 'msg11',
            owner: 'john.doe@example.com',
            text: 'Anyone up for lunch tomorrow?',
            message_type: 'Text'
        })
    },
    'project-alpha': {
        name: 'project-alpha',
        channel_name: 'Project Alpha',
        channel_description: 'Secret project discussions - confidential',
        is_direct_message: 0,
        type: 'Private',
        workspace: 'Default Workspace',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 0,
        last_message_timestamp: '2024-01-15 13:45:00',
        last_message_details: JSON.stringify({
            name: 'msg12',
            owner: 'jane.smith@example.com',
            text: 'Phase 1 is complete',
            message_type: 'Text'
        })
    },
    'customer-support': {
        name: 'customer-support',
        channel_name: 'Customer Support',
        channel_description: 'Customer support team discussions and ticket escalations',
        is_direct_message: 0,
        type: 'Private',
        workspace: 'Default Workspace',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 0,
        last_message_timestamp: '2024-01-15 16:30:00',
        last_message_details: JSON.stringify({
            name: 'msg13',
            owner: 'emma.davis@example.com',
            text: 'Escalated ticket #1234 needs attention',
            message_type: 'Text'
        })
    },
    'ai-assistant': {
        name: 'ai-assistant',
        channel_name: 'AI Assistant',
        channel_description: 'AI-powered assistant for team productivity',
        is_direct_message: 0,
        type: 'Open',
        workspace: 'Default Workspace',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 1,
        openai_thread_id: 'thread_abc123',
        thread_bot: 'bot@example.com',
        last_message_timestamp: '2024-01-15 14:30:00',
        last_message_details: JSON.stringify({
            name: 'msg6',
            owner: 'bot@example.com',
            text: 'Hello! I\'m your AI assistant...',
            message_type: 'Text'
        })
    },
    'archived-project': {
        name: 'archived-project',
        channel_name: 'Archived Project Beta',
        channel_description: 'Old project that has been completed and archived',
        is_direct_message: 0,
        type: 'Private',
        workspace: 'Default Workspace',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 1,
        is_ai_thread: 0,
        last_message_timestamp: '2023-12-15 10:00:00',
        last_message_details: JSON.stringify({
            name: 'msg14',
            owner: 'john.doe@example.com',
            text: 'Project completed successfully!',
            message_type: 'Text'
        })
    },
    'dm-john-jane': {
        name: 'dm-john-jane',
        channel_name: 'DM with Jane Smith',
        channel_description: '',
        is_direct_message: 1,
        peer_user_id: 'jane.smith@example.com',
        type: 'Private',
        workspace: 'Default Workspace',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 0,
        last_message_timestamp: '2024-01-15 10:30:00',
        last_message_details: JSON.stringify({
            name: 'msg1',
            owner: 'john.doe@example.com',
            text: 'Hey team! Just wanted to share...',
            message_type: 'Text'
        })
    },
    'dm-john-sarah': {
        name: 'dm-john-sarah',
        channel_name: 'DM with Sarah Wilson',
        channel_description: '',
        is_direct_message: 1,
        peer_user_id: 'sarah.wilson@example.com',
        type: 'Private',
        workspace: 'Default Workspace',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 0,
        last_message_timestamp: '2024-01-15 12:15:00',
        last_message_details: JSON.stringify({
            name: 'msg3',
            owner: 'sarah.wilson@example.com',
            text: 'Here\'s the latest project proposal...',
            message_type: 'File'
        })
    },
    'dm-jane-mike': {
        name: 'dm-jane-mike',
        channel_name: 'DM with Mike Johnson',
        channel_description: '',
        is_direct_message: 1,
        peer_user_id: 'mike.johnson@example.com',
        type: 'Private',
        workspace: 'Default Workspace',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 0,
        last_message_timestamp: '2024-01-15 15:00:00',
        last_message_details: JSON.stringify({
            name: 'msg7',
            owner: 'john.doe@example.com',
            text: 'This is a continuation of my previous message...',
            message_type: 'Text'
        })
    },
    'thread-msg3': {
        name: 'thread-msg3',
        channel_name: 'Thread: Project Proposal Discussion',
        channel_description: 'Thread for discussing the project proposal',
        is_direct_message: 0,
        type: 'Private',
        workspace: 'Default Workspace',
        is_thread: 1,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 0,
        last_message_timestamp: '2024-01-15 15:30:00',
        last_message_details: JSON.stringify({
            name: 'msg8',
            owner: 'emma.davis@example.com',
            text: 'Great proposal! I have a few suggestions...',
            message_type: 'Text'
        })
    },
    'workspace-2-general': {
        name: 'workspace-2-general',
        channel_name: 'General',
        channel_description: 'General discussions for Workspace 2',
        is_direct_message: 0,
        type: 'Public',
        workspace: 'Workspace 2',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 0,
        last_message_timestamp: '2024-01-15 16:00:00',
        last_message_details: JSON.stringify({
            name: 'msg15',
            owner: 'emma.davis@example.com',
            text: 'Welcome to Workspace 2!',
            message_type: 'Text'
        })
    },
    'workspace-2-dev': {
        name: 'workspace-2-dev',
        channel_name: 'Development',
        channel_description: 'Development team for Workspace 2',
        is_direct_message: 0,
        type: 'Private',
        workspace: 'Workspace 2',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 0,
        last_message_timestamp: '2024-01-15 15:45:00',
        last_message_details: JSON.stringify({
            name: 'msg16',
            owner: 'mike.johnson@example.com',
            text: 'Setting up the new environment',
            message_type: 'Text'
        })
    },
    'synced-channel': {
        name: 'synced-channel',
        channel_name: 'Synced External Channel',
        channel_description: 'Channel synced with external system',
        is_direct_message: 0,
        type: 'Public',
        workspace: 'Default Workspace',
        is_thread: 0,
        is_dm_thread: 0,
        is_self_message: 0,
        is_archived: 0,
        is_ai_thread: 0,
        is_synced: 1,
        linked_doctype: 'External System',
        linked_document: 'EXT-001',
        last_message_timestamp: '2024-01-15 14:15:00',
        last_message_details: JSON.stringify({
            name: 'msg17',
            owner: 'system',
            text: 'External message synced',
            message_type: 'System'
        })
    }
};

// Messages that are saved/bookmarked by the current user (john.doe@example.com)
export const dummySavedMessages: Message[] = [
    // API documentation (important for reference)
    dummyMessages.find(m => m.name === 'msg27')!,
    // Q1 campaign results (important metrics)
    dummyMessages.find(m => m.name === 'msg10')!,
    // Project completion announcement (milestone)
    dummyMessages.find(m => m.name === 'msg14')!,
    // AI assistant help (useful reference)
    dummyMessages.find(m => m.name === 'msg23')!,
    // Team lunch poll (to remember the decision)
    dummyMessages.find(m => m.name === 'msg4')!,
    // Design mockup (for inspiration)
    dummyMessages.find(m => m.name === 'msg2')!
].filter(Boolean); // Remove any undefined entries

// File and image messages for search results
export const dummyFileMessages: Message[] = [
    // Project proposal (PDF)
    dummyMessages.find(m => m.name === 'msg3')!,
    // API documentation (PDF)
    dummyMessages.find(m => m.name === 'msg27')!,
    // Design mockup (Image)
    dummyMessages.find(m => m.name === 'msg2')!,
    // Social media banner (Image)
    dummyMessages.find(m => m.name === 'msg28')!
].filter(Boolean); // Remove any undefined entries

// All messages for search results (excluding files/images and system messages)
export const dummyAllMessages: Message[] = dummyMessages.filter(
    message => message.message_type !== 'File' &&
        message.message_type !== 'Image' &&
        message.message_type !== 'System'
);

// Dummy thread data for search results
export const dummyThreads: Thread[] = [
    {
        id: 'thread-msg3',
        name: 'Project Proposal Discussion',
        channelId: 'general',
        participantIds: ['john.doe@example.com', 'jane.smith@example.com', 'sarah.wilson@example.com'],
        lastMessage: 'Great proposal! I have a few suggestions...',
        lastMessageTime: '2024-01-15 15:30:00',
        participantCount: 3
    },
    {
        id: 'thread-design-review',
        name: 'Design Review',
        channelId: 'design',
        participantIds: ['jane.smith@example.com', 'emma.davis@example.com', 'mike.johnson@example.com'],
        lastMessage: 'The new color scheme looks much better!',
        lastMessageTime: '2024-01-15 16:45:00',
        participantCount: 3
    },
    {
        id: 'thread-bug-bash',
        name: 'Bug Bash',
        channelId: 'dev',
        participantIds: ['john.doe@example.com', 'mike.johnson@example.com'],
        lastMessage: 'Found another edge case in the login flow',
        lastMessageTime: '2024-01-15 17:20:00',
        participantCount: 2
    },
    {
        id: 'thread-q1-planning',
        name: 'Q1 Planning',
        channelId: 'general',
        participantIds: ['john.doe@example.com', 'jane.smith@example.com', 'sarah.wilson@example.com', 'emma.davis@example.com'],
        lastMessage: 'Let\'s schedule the planning meeting for next week',
        lastMessageTime: '2024-01-15 18:00:00',
        participantCount: 4
    },
    {
        id: 'thread-api-integration',
        name: 'API Integration Discussion',
        channelId: 'dev',
        participantIds: ['mike.johnson@example.com', 'emma.davis@example.com'],
        lastMessage: 'The new endpoints are working perfectly',
        lastMessageTime: '2024-01-15 19:15:00',
        participantCount: 2
    }
];