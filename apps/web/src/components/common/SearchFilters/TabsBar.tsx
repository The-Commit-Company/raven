import React from 'react'
import _ from '@lib/translate';

export type SearchTab = 'messages' | 'files' | 'polls' | 'links'

const TABS: { key: SearchTab; label: string }[] = [
    { key: 'messages', label: _('Messages') },
    { key: 'files', label: _('Files') },
    { key: 'links', label: _('Links') },
    { key: 'polls', label: _('Polls') },
    // { key: 'threads', label: _('Threads') },
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
                        ? 'bg-ink-gray-8 text-ink-white shadow'
                        : 'bg-surface-gray-2 text-ink-gray-4 hover:bg-surface-gray-3 hover:text-ink-gray-8'}`}
                onClick={() => setActiveTab(tab.key)}>
                {tab.label}
            </button>
        ))}
    </div>
)

export default TabsBar