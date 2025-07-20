import React from 'react'

export type SearchTab = 'all' | 'messages' | 'files' | 'polls' | 'people' | 'channels_threads'

const TABS: { key: SearchTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'messages', label: 'Messages' },
    { key: 'files', label: 'Files' },
    { key: 'polls', label: 'Polls' },
    { key: 'people', label: 'People' },
    { key: 'channels_threads', label: 'Channels & Threads' },
]

interface TabsBarProps { activeTab: SearchTab; setActiveTab: (tab: SearchTab) => void }

const TabsBar: React.FC<TabsBarProps> = ({ activeTab, setActiveTab }) => (
    <div className="flex gap-2 mb-2">
        {TABS.map(tab => (
            <button
                key={tab.key}
                type="button"
                className={`px-4 py-1 rounded-md text-xs font-medium transition-colors border border-transparent
                ${activeTab === tab.key
                        ? 'bg-primary text-primary-foreground shadow'
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                onClick={() => setActiveTab(tab.key)}>
                {tab.label}
            </button>
        ))}
    </div>
)

export default TabsBar