import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AGENTS, KPI_DATA, MEMBERS, SIGNAL_LOG, NIADELS, THEATRES, EAE_ALERTS } from '../data'

const PILLAR_COLORS = {
  Studio: { bg: 'bg-nia-surf', text: 'text-nia-blue', border: 'border-nia-blue/20', dot: 'bg-nia-blue' },
  Flow: { bg: 'bg-flow-bg', text: 'text-flow-green', border: 'border-flow-green/20', dot: 'bg-flow-green' },
  Tribe: { bg: 'bg-saffron-bg', text: 'text-saffron-500', border: 'border-saffron-500/20', dot: 'bg-saffron-500' },
}

function KpiCard({ label, value, target, unit = '', suffix = '', good = true, color = 'nia-blue' }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold ${good ? 'text-nia-navy' : 'text-red-500'}`}>{value}{suffix}</div>
      <div className="text-xs text-gray-400 mt-1">Target: {target}{suffix}</div>
      <div className={`mt-2 h-1 rounded-full bg-gray-100`}>
        <div className={`h-1 rounded-full ${good ? 'bg-flow-green' : 'bg-red-400'}`} style={{ width: `${Math.min(100, (parseFloat(value) / parseFloat(target)) * 100)}%` }}></div>
      </div>
    </div>
  )
}

function AgentCard({ agent }) {
  const c = PILLAR_COLORS[agent.pillar]
  return (
    <div className={`rounded-2xl border p-3 ${c.bg} ${c.border}`}>
      <div className="flex items-start justify-between gap-1 mb-2">
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>{agent.pillar}</div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-flow-green' : 'bg-gray-300'}`}></div>
          <span className="text-[10px] text-gray-400">{agent.status === 'active' ? 'Active' : 'Idle'}</span>
        </div>
      </div>
      <div className={`font-semibold text-nia-navy text-xs leading-tight mb-2`}>{agent.name}</div>
      <div className="grid grid-cols-2 gap-1 text-[10px]">
        <div className="bg-white/60 rounded-lg p-1.5 text-center">
          <div className={`font-bold text-sm ${c.text}`}>{agent.firedToday}</div>
          <div className="text-gray-400">Today</div>
        </div>
        <div className="bg-white/60 rounded-lg p-1.5 text-center">
          <div className="font-bold text-sm text-gray-600">{agent.avgDelivery}</div>
          <div className="text-gray-400">Avg</div>
        </div>
      </div>
      <div className="text-[10px] text-gray-400 mt-2">Last: {agent.lastFired}</div>
    </div>
  )
}

export default function OpsDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [ticker, setTicker] = useState(0)

  // Simulate live agent fires
  useEffect(() => {
    const interval = setInterval(() => setTicker(t => t + 1), 8000)
    return () => clearInterval(interval)
  }, [])

  const kd = KPI_DATA
  const studioAgents = AGENTS.filter(a => a.pillar === 'Studio')
  const flowAgents = AGENTS.filter(a => a.pillar === 'Flow')
  const tribeAgents = AGENTS.filter(a => a.pillar === 'Tribe')
  const highAlerts = EAE_ALERTS.filter(a => a.priority === 'HIGH').length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-nia-navy px-4 py-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/')} className="text-white/60 hover:text-white transition-colors">←</button>
          <div className="flex-1">
            <div className="text-white font-bold text-base">Rafiki — Ops Dashboard</div>
            <div className="text-white/40 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-flow-green rounded-full inline-block"></span>
              Live · All Theatres · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          {highAlerts > 0 && (
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">{highAlerts} HIGH</div>
          )}
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <div className="text-white font-bold text-lg">{kd.totalMembers.toLocaleString()}</div>
            <div className="text-white/40 text-[10px]">Nians</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <div className="text-flow-green font-bold text-lg">{kd.agentFiresToday}</div>
            <div className="text-white/40 text-[10px]">Fires Today</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <div className={`font-bold text-lg ${highAlerts > 0 ? 'text-red-400' : 'text-amber-400'}`}>{kd.activeAlerts}</div>
            <div className="text-white/40 text-[10px]">Alerts</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <div className="text-saffron-500 font-bold text-lg">{kd.messagesLast24h.toLocaleString()}</div>
            <div className="text-white/40 text-[10px]">Messages/24h</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white sticky top-[148px] z-10 overflow-x-auto scrollbar-hide">
        {['overview', 'agents', 'members', 'signals'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-3 text-xs font-semibold capitalize transition-colors ${activeTab === tab ? 'text-nia-blue border-b-2 border-nia-blue' : 'text-gray-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-4">

        {/* ── OVERVIEW ─────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            {/* Uptime banner */}
            <div className="bg-flow-bg border border-flow-green/20 rounded-2xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-flow-green rounded-full"></div>
                <span className="text-flow-green font-semibold text-sm">All systems operational</span>
              </div>
              <span className="text-flow-green font-bold">{kd.uptime}% uptime</span>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-3">
              <KpiCard label="90-Day Retention" value={kd.retention90Day} target={kd.retentionTarget} suffix="%" good={kd.retention90Day >= kd.retentionTarget} />
              <KpiCard label="Doc Readiness" value={kd.docReadiness} target={kd.docTarget} suffix="%" good={kd.docReadiness >= kd.docTarget} />
              <KpiCard label="WA Response Rate" value={kd.messageResponseRate} target={kd.responseTarget} suffix="%" good={kd.messageResponseRate >= kd.responseTarget} />
              <KpiCard label="EAE SLA Compliance" value={kd.eaeSlaCompliance} target={kd.eaeTarget} suffix="%" good={kd.eaeSlaCompliance >= kd.eaeTarget} />
            </div>

            {/* Income resolution */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Income Gap Avg Resolution</div>
                  <div className="text-2xl font-bold text-nia-navy">{kd.incomeResolutionAvg}</div>
                  <div className="text-xs text-gray-400">Target: {kd.incomeTarget}</div>
                </div>
                <div className="text-5xl">⚡</div>
              </div>
            </div>

            {/* Theatre cards */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Theatres</div>
              <div className="space-y-2">
                {THEATRES.map(th => (
                  <div key={th.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
                    <div>
                      <div className="font-semibold text-nia-navy text-sm">{th.name}</div>
                      <div className="text-gray-400 text-xs">{th.studios} Studios · {th.eaeCount} EAEs</div>
                    </div>
                    <div className="text-right">
                      <div className="text-nia-blue font-bold">{th.memberCount.toLocaleString()}</div>
                      <div className="text-gray-400 text-xs">Nians</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active alerts summary */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Active EAE Alerts</div>
              <div className="space-y-2">
                {EAE_ALERTS.map(a => (
                  <div key={a.id} className={`rounded-xl border px-3 py-2 flex items-center gap-3 ${a.priority === 'HIGH' ? 'bg-red-50 border-red-200' : a.priority === 'MEDIUM' ? 'bg-amber-50 border-amber-200' : 'bg-nia-surf border-nia-blue/20'}`}>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${a.priority === 'HIGH' ? 'bg-red-500' : a.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-nia-blue'}`}>{a.priority}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-nia-navy text-xs font-semibold truncate">{a.agent}</div>
                      <div className="text-gray-500 text-[10px]">{a.memberName} · {a.timeLeft} remaining</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── AGENTS ───────────────────────────────────── */}
        {activeTab === 'agents' && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 font-medium">12 agents · {AGENTS.filter(a => a.status === 'active').length} active</div>
              <div className="flex items-center gap-2 text-xs text-flow-green bg-flow-bg px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-flow-green rounded-full animate-pulse"></div>
                Live
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-nia-blue"></div>
                <span className="font-bold text-nia-navy text-sm">Studio</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {studioAgents.map(a => <AgentCard key={a.id} agent={a} />)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-flow-green"></div>
                <span className="font-bold text-nia-navy text-sm">Flow</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {flowAgents.map(a => <AgentCard key={a.id} agent={a} />)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-saffron-500"></div>
                <span className="font-bold text-nia-navy text-sm">Tribe</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tribeAgents.map(a => <AgentCard key={a.id} agent={a} />)}
              </div>
            </div>

            {/* Total fires today */}
            <div className="bg-nia-navy rounded-2xl p-4 text-center">
              <div className="text-white/60 text-xs mb-1">TOTAL AGENT FIRES TODAY</div>
              <div className="text-saffron-500 font-bold text-4xl">{AGENTS.reduce((s, a) => s + a.firedToday, 0)}</div>
              <div className="text-white/40 text-xs mt-1">across 12 sub-agents · {kd.messagesLast24h.toLocaleString()} messages in 24h</div>
            </div>
          </>
        )}

        {/* ── MEMBERS ──────────────────────────────────── */}
        {activeTab === 'members' && (
          <>
            <div className="text-xs text-gray-500">{KPI_DATA.totalMembers} Nians across {THEATRES.length} Theatres</div>
            {MEMBERS.map((m, i) => {
              const savingsPct = Math.round((m.savingsGoal.saved / m.savingsGoal.amount) * 100)
              const riskColor = m.risk === 'high' ? 'border-red-200 bg-red-50' : m.risk === 'medium' ? 'border-amber-100 bg-amber-50' : 'border-gray-100 bg-white'
              const docCount = Object.values(m.documents).filter(Boolean).length
              return (
                <div key={m.id} className={`rounded-2xl border p-4 shadow-sm fade-in ${riskColor}`} style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{m.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-nia-navy text-sm">{m.name}</span>
                        <StatusBadge status={m.status} />
                        {m.risk === 'high' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">HIGH RISK</span>}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5">{m.homeState} · {m.language} · Day {m.tenure} · Room {m.nestId}</div>
                      {m.employer && <div className="text-gray-400 text-xs">{m.skills} @ {m.employer}</div>}

                      {/* Savings bar */}
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                          <span>Savings: {m.savingsGoal.purpose}</span>
                          <span className="font-semibold text-nia-navy">{savingsPct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full">
                          <div className={`h-1.5 rounded-full ${savingsPct >= 70 ? 'bg-flow-green' : savingsPct >= 30 ? 'bg-saffron-500' : 'bg-nia-blue'}`} style={{ width: `${savingsPct}%` }}></div>
                        </div>
                      </div>

                      {/* Docs + last active */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-[10px] font-semibold ${docCount === 4 ? 'text-flow-green' : 'text-amber-600'}`}>{docCount}/4 docs</span>
                        <span className="text-[10px] text-gray-400">Active: {m.lastActive}</span>
                      </div>

                      {m.incomeGap && (
                        <div className="mt-2 text-[10px] font-semibold text-amber-700 bg-amber-100 rounded-lg px-2 py-1">
                          ⚠ Income gap: {m.incomeGap.amount} overdue {m.incomeGap.daysLate} days
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* ── SIGNALS ──────────────────────────────────── */}
        {activeTab === 'signals' && (
          <>
            <div className="text-xs text-gray-500 mb-1">Cross-agent signal log — last 24 hours</div>

            {/* Signal map legend */}
            <div className="bg-nia-navy rounded-2xl p-4 mb-2">
              <div className="text-white/60 text-xs font-semibold uppercase mb-3">Signal Map</div>
              <div className="space-y-2 text-xs">
                {[
                  ['Income Guard', 'Disengagement Detector', 'Income gap flag', 'text-amber-400'],
                  ['Loneliness Agent', 'Disengagement Detector', 'Sub-group silence flag', 'text-saffron-500'],
                  ['Health + Safety', 'Document Readiness', 'Missing document flag', 'text-red-400'],
                  ['Savings Agent', 'Milestone Agent', 'Goal milestone hit', 'text-flow-green'],
                  ['Belonging Agent', 'Loneliness + Milestone', 'Sub-group assigned', 'text-nia-blue2'],
                ].map(([from, to, label, color], i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-white/60 w-28 text-right text-[10px]">{from}</span>
                    <div className="flex items-center gap-1 flex-1">
                      <div className="flex-1 h-px bg-white/10 relative">
                        <div className={`absolute right-0 top-1/2 -translate-y-1/2 text-white/40 text-[8px]`}>→</div>
                      </div>
                    </div>
                    <span className="text-white/60 w-32 text-[10px]">{to}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {SIGNAL_LOG.map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 fade-in shadow-sm" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-400">{s.time}</span>
                    <span className="text-[10px] text-gray-500 font-medium">{s.member}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-nia-blue font-semibold text-xs bg-nia-surf px-2 py-0.5 rounded-full">{s.from}</span>
                    <span className="text-gray-400 text-xs">→</span>
                    <span className="text-flow-green font-semibold text-xs bg-flow-bg px-2 py-0.5 rounded-full">{s.to}</span>
                  </div>
                  <div className="text-gray-600 text-xs mt-1">{s.signal}</div>
                </div>
              ))}
            </div>

            {/* Cooldown info */}
            <div className="bg-nia-surf border border-nia-blue/20 rounded-2xl p-4 text-xs text-nia-blue">
              <div className="font-semibold mb-1">Orchestrator Cooldown</div>
              <div className="text-nia-navy/60">No duplicate alerts sent to the same member within 4 hours (configurable per Studio). Emergency and health alerts bypass the cooldown queue.</div>
            </div>
          </>
        )}
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
