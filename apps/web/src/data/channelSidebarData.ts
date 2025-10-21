import { ChannelSidebarData } from "../types/ChannelGroup"

export const erpNextData: ChannelSidebarData = {
    groups: [
        {
            id: 'general',
            name: 'General',
            channels: [
                {
                    name: 'general',
                    channel_name: 'general',
                    type: 'Public' as const,
                    member_id: 'general-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 5 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                },
                {
                    name: 'announcements',
                    channel_name: 'announcements',
                    type: 'Public' as const,
                    member_id: 'announcements-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 3 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                },
                {
                    name: 'company-news',
                    channel_name: 'company-news',
                    type: 'Public' as const,
                    member_id: 'company-news-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 8 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                },
                {
                    name: 'watercooler',
                    channel_name: 'watercooler',
                    type: 'Public' as const,
                    member_id: 'watercooler-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 0 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                }
            ],
            order: 0,
            isCollapsed: false
        },
        {
            id: 'development',
            name: 'Development',
            channels: [
                {
                    name: 'bugs',
                    channel_name: 'bugs',
                    type: 'Open' as const,
                    member_id: 'bugs-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 0 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                },
                {
                    name: 'features',
                    channel_name: 'features',
                    type: 'Private' as const,
                    member_id: 'features-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 12 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                },
                {
                    name: 'code-review',
                    channel_name: 'code-review',
                    type: 'Public' as const,
                    member_id: 'code-review-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 7 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                },
                {
                    name: 'frontend',
                    channel_name: 'frontend',
                    type: 'Public' as const,
                    member_id: 'frontend-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 4 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                },
                {
                    name: 'backend',
                    channel_name: 'backend',
                    type: 'Public' as const,
                    member_id: 'backend-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 6 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                },
                {
                    name: 'testing',
                    channel_name: 'testing',
                    type: 'Open' as const,
                    member_id: 'testing-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 2 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                }
            ],
            order: 1,
            isCollapsed: false
        },
        {
            id: 'support',
            name: 'Support',
            channels: [
                {
                    name: 'help',
                    channel_name: 'help',
                    type: 'Public' as const,
                    member_id: 'help-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 2 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                },
                {
                    name: 'documentation',
                    channel_name: 'documentation',
                    type: 'Public' as const,
                    member_id: 'documentation-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 1 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                },
                {
                    name: 'troubleshooting',
                    channel_name: 'troubleshooting',
                    type: 'Open' as const,
                    member_id: 'troubleshooting-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 5 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                }
            ],
            order: 2,
            isCollapsed: true
        },
        {
            id: 'design',
            name: 'Design',
            channels: [
                {
                    name: 'ui-ux',
                    channel_name: 'ui-ux',
                    type: 'Public' as const,
                    member_id: 'ui-ux-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 3 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                },
                {
                    name: 'branding',
                    channel_name: 'branding',
                    type: 'Private' as const,
                    member_id: 'branding-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 0 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                }
            ],
            order: 3,
            isCollapsed: false
        },
        {
            id: 'marketing',
            name: 'Marketing',
            channels: [
                {
                    name: 'social-media',
                    channel_name: 'social-media',
                    type: 'Public' as const,
                    member_id: 'social-media-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 9 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                },
                {
                    name: 'content',
                    channel_name: 'content',
                    type: 'Open' as const,
                    member_id: 'content-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 2 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'ERPNext',
                    pinned_messages_string: ''
                }
            ],
            order: 4,
            isCollapsed: false
        }
    ],
    ungroupedChannels: [
        {
            name: 'releases',
            channel_name: 'releases',
            type: 'Public' as const,
            member_id: 'releases-1',
            is_direct_message: 0 as const,
            is_self_message: 0 as const,
            is_archived: 0 as const,
            creation: new Date().toISOString(),
            owner: '',
            last_message_details: { unread_count: 0 },
            last_message_timestamp: new Date().toISOString(),
            workspace: 'ERPNext',
            pinned_messages_string: ''
        },
        {
            name: 'security',
            channel_name: 'security',
            type: 'Private' as const,
            member_id: 'security-1',
            is_direct_message: 0 as const,
            is_self_message: 0 as const,
            is_archived: 0 as const,
            creation: new Date().toISOString(),
            owner: '',
            last_message_details: { unread_count: 1 },
            last_message_timestamp: new Date().toISOString(),
            workspace: 'ERPNext',
            pinned_messages_string: ''
        },
        {
            name: 'compliance',
            channel_name: 'compliance',
            type: 'Private' as const,
            member_id: 'compliance-1',
            is_direct_message: 0 as const,
            is_self_message: 0 as const,
            is_archived: 0 as const,
            creation: new Date().toISOString(),
            owner: '',
            last_message_details: { unread_count: 0 },
            last_message_timestamp: new Date().toISOString(),
            workspace: 'ERPNext',
            pinned_messages_string: ''
        }
    ]
}

export const helpdeskData: ChannelSidebarData = {
    groups: [
        {
            id: 'academic',
            name: 'Academic',
            channels: [
                {
                    name: 'general',
                    channel_name: 'general',
                    type: 'Public' as const,
                    member_id: 'general-hd-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 0 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'Helpdesk',
                    pinned_messages_string: ''
                }
            ],
            order: 0,
            isCollapsed: false
        }
    ],
    ungroupedChannels: []
}

export const frappeSchoolData: ChannelSidebarData = {
    groups: [
        {
            id: 'learning',
            name: 'Learning',
            channels: [
                {
                    name: 'general',
                    channel_name: 'general',
                    type: 'Open' as const,
                    member_id: 'general-fs-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 0 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'Frappe School',
                    pinned_messages_string: ''
                }
            ],
            order: 0,
            isCollapsed: false
        }
    ],
    ungroupedChannels: [
        {
            name: 'standup',
            channel_name: 'standup',
            type: 'Public' as const,
            member_id: 'standup-1',
            is_direct_message: 0 as const,
            is_self_message: 0 as const,
            is_archived: 0 as const,
            creation: new Date().toISOString(),
            owner: '',
            last_message_details: { unread_count: 7 },
            last_message_timestamp: new Date().toISOString(),
            workspace: 'Frappe School',
            pinned_messages_string: ''
        }
    ]
}

export const frappeHRData: ChannelSidebarData = {
    groups: [
        {
            id: 'hr-general',
            name: 'HR General',
            channels: [
                {
                    name: 'general',
                    channel_name: 'general',
                    type: 'Public' as const,
                    member_id: 'general-hr-1',
                    is_direct_message: 0 as const,
                    is_self_message: 0 as const,
                    is_archived: 0 as const,
                    creation: new Date().toISOString(),
                    owner: '',
                    last_message_details: { unread_count: 0 },
                    last_message_timestamp: new Date().toISOString(),
                    workspace: 'Frappe HR',
                    pinned_messages_string: ''
                }
            ],
            order: 0,
            isCollapsed: false
        }
    ],
    ungroupedChannels: [
        {
            name: 'projects',
            channel_name: 'projects',
            type: 'Open' as const,
            member_id: 'projects-1',
            is_direct_message: 0 as const,
            is_self_message: 0 as const,
            is_archived: 0 as const,
            creation: new Date().toISOString(),
            owner: '',
            last_message_details: { unread_count: 0 },
            last_message_timestamp: new Date().toISOString(),
            workspace: 'Frappe HR',
            pinned_messages_string: ''
        }
    ]
}