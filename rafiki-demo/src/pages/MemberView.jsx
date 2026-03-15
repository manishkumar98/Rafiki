import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MEMBERS, CHAT_FLOWS } from '../data'

const PILLAR_COLORS = {
  'Nest Activation Agent': 'text-nia-blue bg-nia-surf',
  'Belonging Agent': 'text-purple-600 bg-purple-50',
  'Essentials Agent': 'text-nia-blue bg-nia-surf',
  'Health + Safety Agent': 'text-red-600 bg-red-50',
  'Income Guard Agent': 'text-amber-700 bg-amber-50',
  'Document Readiness Agent': 'text-nia-blue bg-nia-surf',
  'Job Match Agent': 'text-flow-green bg-flow-bg',
  'Upskill Agent': 'text-flow-green bg-flow-bg',
  'Loneliness Agent': 'text-saffron-500 bg-saffron-bg',
  'Milestone Agent': 'text-saffron-500 bg-saffron-bg',
  'Savings Agent': 'text-saffron-500 bg-saffron-bg',
  'Rafiki Orchestrator': 'text-nia-blue bg-nia-surf',
}

export default function MemberView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const member = MEMBERS.find(m => m.id === id)
  const messages = CHAT_FLOWS[id] || []

  const [chatMessages, setChatMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [translatedMsgs, setTranslatedMsgs] = useState(new Set())
  const [awaitingInput, setAwaitingInput] = useState(false)
  const [pendingChoices, setPendingChoices] = useState([])
  const [inputValue, setInputValue] = useState('')

  const bottomRef = useRef(null)
  const revealIdxRef = useRef(0)
  const cancelledRef = useRef(false)
  const timersRef = useRef([])
  const revealRef = useRef(null)

  const toggleTranslate = (msgId) => {
    setTranslatedMsgs(prev => {
      const next = new Set(prev)
      next.has(msgId) ? next.delete(msgId) : next.add(msgId)
      return next
    })
  }

  useEffect(() => {
    // Cancel any running timers
    cancelledRef.current = true
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    // Reset state
    setChatMessages([])
    setTyping(false)
    setTranslatedMsgs(new Set())
    setAwaitingInput(false)
    setPendingChoices([])
    setInputValue('')
    revealIdxRef.current = 0
    cancelledRef.current = false

    const currentMessages = CHAT_FLOWS[id] || []

    const reveal = () => {
      if (cancelledRef.current) return
      const idx = revealIdxRef.current
      if (idx >= currentMessages.length) return
      const msg = currentMessages[idx]

      if (msg.from === 'member') {
        // Pause and present choices
        const choices = msg.choices || [
          { label: msg.text, value: msg.text, primary: true },
          { label: 'HELP', value: 'HELP' },
        ]
        setPendingChoices(choices)
        setAwaitingInput(true)
        return
      }

      setTyping(true)
      const t = setTimeout(() => {
        if (cancelledRef.current) return
        setTyping(false)
        setChatMessages(prev => [...prev, msg])
        revealIdxRef.current++
        const t2 = setTimeout(reveal, 600)
        timersRef.current.push(t2)
      }, 900)
      timersRef.current.push(t)
    }

    revealRef.current = reveal

    const initial = setTimeout(reveal, 400)
    timersRef.current.push(initial)

    return () => {
      cancelledRef.current = true
      timersRef.current.forEach(clearTimeout)
    }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, typing, awaitingInput])

  if (!member) return <div className="p-8 text-center">Member not found</div>

  const docCount = Object.values(member.documents).filter(Boolean).length
  const savingsPct = Math.round((member.savingsGoal.saved / member.savingsGoal.amount) * 100)

  // User picks a choice button
  const handleChoiceSelect = (choice) => {
    const idx = revealIdxRef.current
    const msgs = CHAT_FLOWS[id] || []
    const msg = msgs[idx]
    const sentMsg = { id: msg?.id || Date.now(), from: 'member', time: 'Just now', text: choice.value }
    setChatMessages(prev => [...prev, sentMsg])
    revealIdxRef.current++
    setAwaitingInput(false)
    setPendingChoices([])

    if (choice.response) {
      // Alternative choice — show contextual Rafiki answer, then stop scripted flow
      setTyping(true)
      const t = setTimeout(() => {
        setTyping(false)
        const reply = {
          id: Date.now() + 1,
          from: 'rafiki',
          time: 'Just now',
          text: choice.response,
          agent: choice.responseAgent || 'Rafiki Orchestrator',
        }
        setChatMessages(prev => [...prev, reply])
        // Don't continue scripted flow — member went off-script, standard chips will appear
      }, 1200)
      timersRef.current.push(t)
    } else {
      // Primary choice — continue scripted flow
      if (revealRef.current) {
        const t = setTimeout(revealRef.current, 500)
        timersRef.current.push(t)
      }
    }
  }

  // Free-text send (works during and after flow)
  const handleSend = (text) => {
    if (!text.trim()) return
    const newMsg = { id: Date.now(), from: 'member', time: 'Just now', text }
    setChatMessages(prev => [...prev, newMsg])
    setInputValue('')

    if (awaitingInput) {
      // Free-text during a choice point — treat as primary (continue flow)
      revealIdxRef.current++
      setAwaitingInput(false)
      setPendingChoices([])
      if (revealRef.current) {
        const t = setTimeout(revealRef.current, 500)
        timersRef.current.push(t)
      }
      return
    }

    // Post-flow auto-reply
    const upper = text.trim().toUpperCase()
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      let reply = null
      if (upper === 'HELP') {
        reply = { id: Date.now() + 1, from: 'rafiki', time: 'Just now', text: 'Your EAE has been notified and will reach out to you shortly. If it is urgent, call directly: ' + (member.niadel === 'nd1' ? 'Santosh +91 99001 12233' : 'Deepa +91 88002 23344'), agent: 'Rafiki Orchestrator' }
      } else if (upper === 'YES') {
        reply = { id: Date.now() + 1, from: 'rafiki', time: 'Just now', text: 'Great! Your response has been recorded. Your Flow Lead will follow up within 24 hours.', agent: 'Rafiki Orchestrator' }
      } else if (upper === 'MORE') {
        reply = { id: Date.now() + 1, from: 'rafiki', time: 'Just now', text: 'Fetching more options for you. You will hear back within a few minutes.', agent: 'Rafiki Orchestrator' }
      } else {
        reply = { id: Date.now() + 1, from: 'rafiki', time: 'Just now', text: 'Thank you for your message. For quick actions, reply YES, MORE, or HELP. Your EAE is always available for anything else.', agent: 'Rafiki Orchestrator' }
      }
      setChatMessages(prev => [...prev, reply])
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col max-w-md mx-auto">
      {/* WhatsApp-style header */}
      <div className="bg-nia-blue px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <button onClick={() => navigate('/')} className="text-white/70 hover:text-white mr-1 transition-colors">
          ←
        </button>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg">
          🤖
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold text-sm">Rafiki</div>
          <div className="text-white/60 text-xs">Migration Success Agent · nia.one</div>
        </div>
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="text-white/70 hover:text-white transition-colors text-lg"
        >
          ⓘ
        </button>
      </div>

      {/* Member profile card (collapsible) */}
      {showProfile && (
        <div className="bg-nia-navy px-4 py-4 fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">{member.avatar}</div>
            <div>
              <div className="text-white font-bold">{member.name}</div>
              <div className="text-white/60 text-xs">{member.homeState} · {member.language} · Nest {member.nestId}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 rounded-xl p-2">
              <div className="text-white/40">Tenure</div>
              <div className="text-white font-semibold">Day {member.tenure}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <div className="text-white/40">Documents</div>
              <div className={`font-semibold ${docCount === 4 ? 'text-flow-green' : 'text-amber-400'}`}>{docCount}/4 ready</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2 col-span-2">
              <div className="text-white/40 mb-1">Savings · {member.savingsGoal.purpose}</div>
              <div className="bg-white/10 rounded-full h-1.5 mb-1">
                <div className="bg-saffron-500 h-1.5 rounded-full" style={{ width: `${savingsPct}%` }}></div>
              </div>
              <div className="text-white font-semibold">₹{member.savingsGoal.saved.toLocaleString()} of ₹{member.savingsGoal.amount.toLocaleString()} · {savingsPct}%</div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(member.documents).map(([doc, ok]) => (
              <span key={doc} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ok ? 'bg-flow-bg text-flow-green' : 'bg-red-100 text-red-500'}`}>
                {ok ? '✓' : '✗'} {doc}
              </span>
            ))}
          </div>
          {member.incomeGap && (
            <div className="mt-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2 text-xs">
              <span className="text-amber-600 font-semibold">⚠ Income Gap: </span>
              <span className="text-white/70">{member.incomeGap.amount} overdue by {member.incomeGap.daysLate} days</span>
            </div>
          )}
        </div>
      )}

      {/* Risk banner */}
      {member.risk === 'high' && (
        <div className="bg-red-500/10 border-b border-red-200 px-4 py-2 flex items-center gap-2">
          <span className="text-red-500 text-xs">⚠</span>
          <span className="text-red-600 text-xs font-medium">HIGH RISK — EAE welfare check dispatched</span>
        </div>
      )}
      {member.incomeGap && (
        <div className="bg-amber-500/10 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
          <span className="text-amber-500 text-xs">⚠</span>
          <span className="text-amber-700 text-xs font-medium">Income gap: {member.incomeGap.amount} overdue · EAE notified</span>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-hide" style={{ background: '#E5DDD5', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>

        {/* Date header */}
        <div className="text-center text-[11px] text-gray-500 bg-white/60 rounded-full px-3 py-1 inline-block mx-auto block w-fit">
          Today · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>

        {chatMessages.map((msg, idx) => (
          <div key={`${msg.id}-${idx}`} className={`flex ${msg.from === 'member' ? 'justify-end' : 'justify-start'} fade-in`}>
            {msg.from === 'rafiki' ? (
              <div className="max-w-[85%]">
                {msg.agent && (
                  <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1 w-fit ${PILLAR_COLORS[msg.agent] || 'text-nia-blue bg-nia-surf'}`}>
                    {msg.agent}
                  </div>
                )}
                <div className="chat-bubble-in px-3 py-2 shadow-sm">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {translatedMsgs.has(msg.id) && msg.translatedText ? msg.translatedText : msg.text}
                  </pre>
                  {msg.translatedText && (
                    <button
                      onClick={() => toggleTranslate(msg.id)}
                      className="mt-2 flex items-center gap-1.5 text-[11px] font-medium transition-all hover:opacity-80 border-t border-gray-100 pt-1.5 w-full"
                      style={{ color: translatedMsgs.has(msg.id) ? '#999' : '#2C5880' }}
                    >
                      <span className="text-[13px]">🌐</span>
                      <span>{translatedMsgs.has(msg.id) ? 'Show original' : `Translate to ${member.language}`}</span>
                    </button>
                  )}
                  <div className="text-[10px] text-gray-400 mt-1 text-right">{msg.time}</div>
                </div>
              </div>
            ) : (
              <div className="max-w-[75%]">
                <div className="chat-bubble-out px-3 py-2 shadow-sm">
                  <p className="text-sm text-gray-800">{msg.text}</p>
                  <div className="text-[10px] text-gray-500 mt-1 text-right flex items-center justify-end gap-1">
                    {msg.time} <span className="text-nia-blue">✓✓</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="flex justify-start fade-in">
            <div className="chat-bubble-in px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block"></span>
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block"></span>
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Choice buttons — shown while awaiting member input */}
      {awaitingInput && pendingChoices.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-4 pt-3 pb-2 slide-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Your reply</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>
          <div className="flex flex-col gap-2">
            {pendingChoices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoiceSelect(choice)}
                className={`text-left text-sm px-4 py-2.5 rounded-xl border-2 transition-all font-medium leading-snug ${
                  choice.primary
                    ? 'bg-nia-blue text-white border-nia-blue shadow-sm active:opacity-90'
                    : 'bg-white text-nia-blue border-nia-blue/25 hover:border-nia-blue hover:bg-nia-surf active:bg-nia-surf'
                }`}
              >
                {choice.primary && <span className="mr-1.5 opacity-70">↵</span>}
                {choice.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Standard quick-reply chips — shown when NOT awaiting input */}
      {!awaitingInput && (
        <div className="bg-white border-t border-gray-200 px-4 pt-2 pb-1 flex gap-2 overflow-x-auto scrollbar-hide">
          {['YES', 'MORE', 'HELP'].map(keyword => (
            <button
              key={keyword}
              onClick={() => handleSend(keyword)}
              className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
              style={keyword === 'HELP' ? { borderColor: '#E06D1F', color: '#E06D1F', background: '#FEF5ED' } : { borderColor: '#2C5880', color: '#2C5880', background: '#EEF4F9' }}
            >
              {keyword}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="bg-white px-3 py-3 flex items-center gap-2 border-t border-gray-100">
        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(inputValue)}
            placeholder={awaitingInput ? 'Or type your reply...' : 'Type a message...'}
            className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
          />
        </div>
        <button
          onClick={() => handleSend(inputValue)}
          className="w-10 h-10 bg-nia-blue rounded-full flex items-center justify-center text-white shadow-md hover:bg-nia-navy transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
