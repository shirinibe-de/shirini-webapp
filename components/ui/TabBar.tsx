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
    <div className="border-b border-white/10 bg-white/5">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-4 font-semibold text-lg border-b-2 transition-all duration-300 ${
              activeTabId === tab.id
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-indigo-300/60 hover:text-indigo-300/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
