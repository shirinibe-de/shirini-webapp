'use client'

interface Tab {
  id: string
  label: string
}

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
}

export function TabBar({ tabs, activeTabId, onTabChange }: TabBarProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTabId === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
