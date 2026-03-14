import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MEMBERS } from '../data'

export default function RoleSelect() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-nia-navy flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="text-center mb-10 slide-up">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-saffron-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">R</div>
          <div>
            <div className="text-white font-bold text-2xl tracking-tight">Rafiki</div>
            <div className="text-nia-blue2 text-sm">Migration Success Agent · nia.one</div>
          </div>
        </div>
        <p className="text-white/60 text-sm max-w-xs mx-auto">
          Building the third place for migrant workers, where life costs less and progress costs nothing.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3 slide-up">
        {/* Member cards */}
        <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2 px-1">Member View</div>
        {MEMBERS.map((m, i) => (
          <button
            key={m.id}
            onClick={() => navigate(`/member/${m.id}`)}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-nia-blue2 rounded-2xl p-4 text-left transition-all duration-200 group"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{m.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">{m.name}</span>
                  <StatusBadge status={m.status} />
                </div>
                <div className="text-white/50 text-xs mt-0.5">
                  {m.homeState} · {m.language} · Day {m.tenure} · Nest {m.nestId}
                </div>
              </div>
              <div className="text-white/30 group-hover:text-white/60 transition-colors">→</div>
            </div>
          </button>
        ))}

        {/* Divider */}
        <div className="pt-2">
          <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2 px-1">Operations</div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/eae')}
              className="w-full bg-saffron-500/10 hover:bg-saffron-500/20 border border-saffron-500/30 hover:border-saffron-500 rounded-2xl p-4 text-left transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-saffron-500/20 rounded-xl flex items-center justify-center text-lg">🦺</div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">EAE Dashboard</div>
                  <div className="text-saffron-500/80 text-xs">Action queue · SLA timers · 5 pending alerts</div>
                </div>
                <div className="text-saffron-500/60 group-hover:text-saffron-500 transition-colors">→</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/ops')}
              className="w-full bg-nia-blue/10 hover:bg-nia-blue/20 border border-nia-blue/30 hover:border-nia-blue2 rounded-2xl p-4 text-left transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-nia-blue/20 rounded-xl flex items-center justify-center text-lg">📊</div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">Ops Dashboard</div>
                  <div className="text-nia-blue2 text-xs">12 agents · KPIs · Signal map · All Niadels</div>
                </div>
                <div className="text-nia-blue2/60 group-hover:text-nia-blue2 transition-colors">→</div>
              </div>
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    'new': ['bg-flow-bg text-flow-green', 'NEW'],
    'at-risk': ['bg-red-100 text-red-600', 'AT RISK'],
    'income-gap': ['bg-amber-100 text-amber-700', 'INCOME GAP'],
    'thriving': ['bg-flow-bg text-flow-green', 'THRIVING'],
    'placement-pending': ['bg-nia-surf text-nia-blue', 'PLACEMENT'],
  }
  const [cls, label] = map[status] || ['bg-gray-100 text-gray-500', status]
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cls}`}>{label}</span>
}
