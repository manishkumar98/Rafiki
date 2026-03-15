import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EAE_ALERTS, EAES } from '../data'

const PRIORITY_STYLES = {
  HIGH: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-500 text-white', icon: '🔴', timeColor: 'text-red-600' },
  MEDIUM: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-500 text-white', icon: '🟡', timeColor: 'text-amber-700' },
  LOW: { bg: 'bg-nia-surf', border: 'border-nia-blue/20', badge: 'bg-nia-blue text-white', icon: '🟢', timeColor: 'text-nia-blue' },
}

const PILLAR_COLORS = {
  Studio: 'bg-nia-surf text-nia-blue',
  Flow: 'bg-flow-bg text-flow-green',
  Tribe: 'bg-saffron-bg text-saffron-500',
}

export default function EAEDashboard() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState(EAE_ALERTS)
  const [confirmed, setConfirmed] = useState([])
  const [selected, setSelected] = useState(null)
  const [activeTab, setActiveTab] = useState('queue')
  const eae = EAES[0] // Santosh

  const pending = alerts.filter(a => a.status === 'pending')
  const inProgress = alerts.filter(a => a.status === 'in-progress')
  const high = pending.filter(a => a.priority === 'HIGH').length

  const confirmAction = (alertId) => {
    setConfirmed(prev => [...prev, alertId])
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'done' } : a))
    if (selected?.id === alertId) setSelected(null)
  }

  const startAction = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'in-progress' } : a))
  }

  const activeAlerts = alerts.filter(a => a.status !== 'done')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-nia-navy px-4 py-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/')} className="text-white/60 hover:text-white transition-colors">←</button>
          <div className="w-10 h-10 bg-saffron-500/20 rounded-full flex items-center justify-center text-lg">🦺</div>
          <div className="flex-1">
            <div className="text-white font-bold text-base">{eae.name}</div>
            <div className="text-white/50 text-xs">EAE · Rajputana North</div>
          </div>
          <div className="text-right">
            {high > 0 && (
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{high} HIGH</div>
            )}
            <div className="text-white/40 text-xs mt-0.5">{activeAlerts.length} active</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <div className="text-red-400 font-bold text-lg">{pending.length}</div>
            <div className="text-white/40 text-[10px]">Pending</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <div className="text-amber-400 font-bold text-lg">{inProgress.length}</div>
            <div className="text-white/40 text-[10px]">In Progress</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <div className="text-flow-green font-bold text-lg">{confirmed.length}</div>
            <div className="text-white/40 text-[10px]">Done Today</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white sticky top-[140px] z-10">
        {['queue', 'done'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === tab ? 'text-nia-blue border-b-2 border-nia-blue' : 'text-gray-400'}`}
          >
            {tab === 'queue' ? `Action Queue (${activeAlerts.length})` : `Completed (${confirmed.length})`}
          </button>
        ))}
      </div>

      {/* Alert detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[selected.priority].badge}`}>{selected.priority}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PILLAR_COLORS[selected.pillar]}`}>{selected.pillar}</span>
                </div>
                <div className="font-bold text-nia-navy text-base">{selected.agent}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-xl">×</button>
            </div>

            {/* Member info */}
            <div className="bg-nia-surf rounded-2xl p-3">
              <div className="text-xs text-nia-blue font-semibold mb-1">MEMBER</div>
              <div className="font-bold text-nia-navy">{selected.memberName}</div>
              <div className="text-gray-500 text-sm">Nest {selected.nestId} · {selected.niadel}</div>
            </div>

            {/* Flag */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Flag</div>
              <div className="text-gray-700 text-sm bg-red-50 border border-red-100 rounded-xl p-3">{selected.flag}</div>
            </div>

            {/* Script */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Suggested Approach</div>
              <div className="text-gray-800 text-sm bg-amber-50 border border-amber-100 rounded-xl p-3 leading-relaxed">{selected.script}</div>
            </div>

            {/* SLA */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <div>
                <div className="text-xs text-gray-400">SLA</div>
                <div className="font-semibold text-gray-700">{selected.sla}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Time Remaining</div>
                <div className={`font-bold ${PRIORITY_STYLES[selected.priority].timeColor}`}>{selected.timeLeft}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Created</div>
                <div className="text-gray-600 text-sm">{selected.created}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pb-2">
              {selected.status === 'pending' && (
                <button
                  onClick={() => { startAction(selected.id); setSelected({ ...selected, status: 'in-progress' }) }}
                  className="flex-1 bg-nia-surf text-nia-blue font-semibold py-3 rounded-2xl text-sm hover:bg-nia-blue hover:text-white transition-colors"
                >
                  Start Action
                </button>
              )}
              <button
                onClick={() => confirmAction(selected.id)}
                className="flex-1 bg-flow-green text-white font-semibold py-3 rounded-2xl text-sm hover:bg-green-700 transition-colors"
              >
                ✓ Confirm Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {activeTab === 'queue' ? (
          activeAlerts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">✅</div>
              <div className="font-bold text-gray-600">All actions completed!</div>
              <div className="text-gray-400 text-sm mt-1">Great work today, {eae.name.split(' ')[0]}.</div>
            </div>
          ) : (
            activeAlerts.map((alert, i) => {
              const style = PRIORITY_STYLES[alert.priority]
              const done = confirmed.includes(alert.id)
              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl border p-4 cursor-pointer transition-all duration-200 fade-in ${done ? 'opacity-40' : ''} ${style.bg} ${style.border} hover:shadow-md`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                  onClick={() => !done && setSelected(alert)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>{alert.priority}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PILLAR_COLORS[alert.pillar]}`}>{alert.pillar}</span>
                      {alert.status === 'in-progress' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-nia-blue text-white">IN PROGRESS</span>
                      )}
                    </div>
                    <div className={`text-xs font-bold ${style.timeColor} flex-shrink-0`}>{alert.timeLeft} left</div>
                  </div>

                  <div className="font-semibold text-nia-navy text-sm mb-0.5">{alert.agent}</div>
                  <div className="text-gray-600 text-xs mb-3">
                    👤 {alert.memberName} · Nest {alert.nestId}
                  </div>

                  <div className="text-gray-600 text-xs leading-relaxed bg-white/60 rounded-xl p-2 mb-3">
                    {alert.flag}
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="flex-1 text-xs font-semibold text-nia-blue bg-white border border-nia-blue/30 py-2 rounded-xl hover:bg-nia-surf transition-colors"
                      onClick={e => { e.stopPropagation(); setSelected(alert) }}
                    >
                      View Script
                    </button>
                    <button
                      className="flex-1 text-xs font-semibold text-white bg-flow-green py-2 rounded-xl hover:bg-green-700 transition-colors"
                      onClick={e => { e.stopPropagation(); confirmAction(alert.id) }}
                    >
                      ✓ Done
                    </button>
                  </div>
                </div>
              )
            })
          )
        ) : (
          <>
            {confirmed.length === 0 ? (
              <div className="text-center py-16 text-gray-400">No completed actions yet.</div>
            ) : (
              alerts.filter(a => a.status === 'done').map(alert => (
                <div key={alert.id} className="bg-flow-bg border border-flow-green/20 rounded-2xl p-4 opacity-70">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-flow-green">✓ COMPLETED</span>
                    <span className="text-[10px] text-gray-400">{alert.created}</span>
                  </div>
                  <div className="font-semibold text-nia-navy text-sm">{alert.agent}</div>
                  <div className="text-gray-500 text-xs">{alert.memberName} · Nest {alert.nestId}</div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* SLA Warning Footer */}
      {high > 0 && (
        <div className="bg-red-500 px-4 py-3 text-center">
          <span className="text-white text-sm font-semibold">⚠ {high} HIGH priority action{high > 1 ? 's' : ''} require immediate attention</span>
        </div>
      )}
    </div>
  )
}
