// Update user display to show badges and achievements
{filteredUsers.map((u) => (
  <button
    key={u.id}
    onClick={() => setSelectedUser(u)}
    className={`w-full p-4 text-left hover:bg-gray-800/50 flex items-center space-x-3 ${
      selectedUser?.id === u.id ? 'bg-gray-800' : ''
    }`}
  >
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
      <User className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1">
      <div className="flex items-center space-x-2">
        <span className="font-medium">{u.full_name}</span>
        {u.agent_stats?.badges?.length > 0 && (
          <div className="flex -space-x-1">
            {u.agent_stats.badges.map((badge: string, i: number) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center"
                title={badge}
              >
                <Star className="w-3 h-3 text-primary" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="text-sm text-gray-400 capitalize">
        {u.role}
        {u.agent_stats?.current_streak > 0 && (
          <span className="ml-2 text-orange-400">
            🔥 {u.agent_stats.current_streak} day streak
          </span>
        )}
      </div>
    </div>
  </button>
))}