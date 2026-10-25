import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity, AlertTriangle, ArrowLeft, Bell, BookOpen, Building2, Check,
  ChevronRight, ClipboardList, Clock3, Compass, FilePlus2, Filter, LayoutDashboard,
  LogOut, Menu, RefreshCw, Search, Settings2, ShieldCheck, SlidersHorizontal, UserPlus, Users,
  X
} from 'lucide-react'
import './styles.css'

type Page = 'overview' | 'triage' | 'cases' | 'experts' | 'facilities' | 'activity' | 'guide' | 'intake' | 'case' | 'specialist' | 'join' | 'onboarding-review'
type ActingRole = 'Coordinator' | 'Facility operator' | 'Specialist'
type EntryScreen = 'home' | 'chooser' | 'account'
type Urgency = 'Urgent' | 'Elevated' | 'Routine' | 'Pending assessment'
type CaseStatus = 'Awaiting review' | 'Ready for matching' | 'Assigned' | 'Verification needed' | 'Escalated' | 'Monitoring' | 'Resolved' | 'Externally referred'
type Availability = 'Available' | 'Assigned' | 'Unavailable' | 'Rest required' | 'Verification pending'

type Facility = {
  id: string; name: string; sector: string; region: string; status: string;
  contact: string; coverage: string; constraints: string; dependencies: string; verified: string
}

function AccountEntry({ role, enter, back }: { role: 'Facility operator' | 'Specialist'; enter: (name: string) => void; back: () => void }) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [name, setName] = useState(role === 'Facility operator' ? 'Dev Malhotra' : 'Isha Bhandari')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const isFacility = role === 'Facility operator'
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (name.trim() && (mode === 'existing' || (email.trim() && password.trim()))) enter(name.trim())
  }
  return <div className="persona-backdrop"><section className="account-entry" role="dialog" aria-modal="true" aria-labelledby="account-title">
    <button className="back-link" onClick={back}><ArrowLeft size={15} /> Back to role selection</button>
    <div className="brand mini-brand"><div className="brand-mark"><Compass size={18} /></div><div><strong>keel</strong><span>response coordination</span></div></div>
    <div className="eyebrow">{isFacility ? 'FACILITY ACCESS' : 'SPECIALIST ACCESS'}</div>
    <h1 id="account-title">{isFacility ? 'Enter your facility account' : 'Enter your specialist account'}</h1>
    <p className="persona-intro">Use an existing account to continue, or create a new local account for this prototype.</p>
    <div className="account-tabs"><button className={mode === 'existing' ? 'active' : ''} onClick={() => setMode('existing')}>Already an account</button><button className={mode === 'new' ? 'active' : ''} onClick={() => setMode('new')}>New user</button></div>
    <form className="account-form" onSubmit={submit}>
      <label>{isFacility ? 'Your name' : 'Your name'}<input required value={name} onChange={event => setName(event.target.value)} placeholder={isFacility ? 'e.g. Dev Malhotra' : 'e.g. Isha Bhandari'} /></label>
      {mode === 'new' && <><label>Email or phone<input required value={email} onChange={event => setEmail(event.target.value)} placeholder="e.g. name@example.com" /></label><label>Create password<input required type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Create a local prototype password" /></label><p className="form-hint">This creates a local prototype account only. It is not connected to a real identity system.</p></>}
      <button className="primary" type="submit">{mode === 'existing' ? `Enter as ${isFacility ? 'facility operator' : 'specialist'}` : 'Create account and continue'} <ChevronRight size={16} /></button>
    </form>
  </section></div>
}
type CaseRecord = {
  id: string; facilityId: string; issue: string; expertise: string; operating: string;
  urgency: Urgency; rationale: string; verification: string; confidence: string;
  dependencies: string; missing: string; nextAction: string; status: CaseStatus;
  created: string; updated: string; followUp: string; expertId?: string; physical: boolean
}
type Expert = {
  id: string; name: string; primary: string; qualifications: string[]; verified: boolean;
  scope: string; availability: Availability; fatigue: string; checkIn: string; region: string;
  verification: { databaseLookup: boolean; employerConfirmed: boolean; checkInRecent: boolean }
}
type Assignment = { id: string; caseId: string; expertId: string; status: 'Active' | 'Released'; assignedAt: string }
type CapacityOffer = { id: string; facilityId: string; expertId: string; status: 'Offered' | 'Accepted'; createdAt: string }
type Event = { id: string; time: string; actor: string; entity: string; type: string; description: string }
type State = { facilities: Facility[]; cases: CaseRecord[]; experts: Expert[]; assignments: Assignment[]; offers: CapacityOffer[]; events: Event[] }

const seed: State = {
  facilities: [
    { id: 'FAC-01', name: 'Narmada Water Works', sector: 'Water treatment', region: 'Central India', status: 'Operating with constraints', contact: 'Duty operator · wireless relay', coverage: '1 of 3 critical roles covered', constraints: 'Senior controls engineer unavailable; manual dosing underway.', dependencies: 'Grid supply, chemical delivery', verified: 'Today, 08:42' },
    { id: 'FAC-02', name: 'Maharashtra Grid Station', sector: 'Electricity distribution', region: 'Central India', status: 'Reduced capacity', contact: 'Shift supervisor · callback relay', coverage: '2 of 4 critical roles covered', constraints: 'Protection systems specialist required for safe reconfiguration.', dependencies: 'Narmada feeder, regional dispatch', verified: 'Today, 08:18' },
    { id: 'FAC-03', name: 'Sahyadri Medical Centre', sector: 'Hospital infrastructure', region: 'Western India', status: 'Operating', contact: 'Facilities lead · wireless relay', coverage: 'Full coverage reported', constraints: 'Backup generator inspection pending.', dependencies: 'Fuel reserve, municipal water', verified: 'Yesterday, 19:10' },
    { id: 'FAC-04', name: 'Bhilai Industrial Works', sector: 'Industrial chemical operations', region: 'Central India', status: 'Monitoring', contact: 'Site controller · callback relay', coverage: '2 of 3 critical roles covered', constraints: 'Process instrumentation alarm; local team investigating.', dependencies: 'Grid supply, cooling water', verified: 'Today, 07:56' },
    { id: 'FAC-05', name: 'Konkan Transit Operations', sector: 'Transport infrastructure', region: 'Western India', status: 'Reduced service', contact: 'Operations desk · wireless relay', coverage: '3 of 5 critical roles covered', constraints: 'Signal maintenance roster is incomplete.', dependencies: 'Grid supply, communications', verified: 'Today, 08:02' },
    { id: 'FAC-06', name: 'Ganga Communications Hub', sector: 'Telecommunications', region: 'Northern India', status: 'Operating with constraints', contact: 'Network lead · callback relay', coverage: '1 of 2 critical roles covered', constraints: 'Battery reserve is being monitored; no field technician confirmed.', dependencies: 'Grid supply, fuel reserve', verified: 'Today, 08:34' }
  ],
  cases: [
    { id: 'K-1042', facilityId: 'FAC-01', issue: 'Automated dosing controls are unavailable after a staffing loss.', expertise: 'Industrial controls', operating: 'Operating with constraints', urgency: 'Urgent', rationale: 'Urgency confirmed by the regional duty coordinator based on reported loss of automated dosing control.', verification: 'Verified by facility duty operator', confidence: 'High', dependencies: 'Grid supply, chemical delivery', missing: 'None reported', nextAction: 'Find qualified controls specialist', status: 'Ready for matching', created: 'Today, 07:42', updated: '18 min ago', followUp: 'Today, 10:30', physical: false },
    { id: 'K-1043', facilityId: 'FAC-02', issue: 'Protection relay configuration requires a controls specialist review before reconfiguration.', expertise: 'Industrial controls', operating: 'Reduced capacity', urgency: 'Urgent', rationale: 'Urgency confirmed because the facility cannot safely complete planned reconfiguration without specialist review.', verification: 'Verified by shift supervisor', confidence: 'High', dependencies: 'Regional dispatch, Narmada feeder', missing: 'Access window confirmation', nextAction: 'Find qualified controls specialist', status: 'Ready for matching', created: 'Today, 07:49', updated: '26 min ago', followUp: 'Today, 10:15', physical: false },
    { id: 'K-1044', facilityId: 'FAC-04', issue: 'Cooling loop instrumentation alarm with conflicting readings.', expertise: 'Process instrumentation', operating: 'Monitoring', urgency: 'Pending assessment', rationale: 'Assessment pending: the reported readings conflict and operating status needs verification.', verification: 'Conflicting reports; callback requested', confidence: 'Low', dependencies: 'Cooling water, local process team', missing: 'Independent reading and alarm history', nextAction: 'Request verification', status: 'Verification needed', created: 'Today, 07:21', updated: '42 min ago', followUp: 'Today, 09:45', physical: false },
    { id: 'K-1045', facilityId: 'FAC-03', issue: 'Backup generator fuel delivery has not arrived.', expertise: 'No specialist requested', operating: 'Operating', urgency: 'Elevated', rationale: 'Elevated because the facility reports a time-sensitive physical resource gap, not a confirmed loss of control.', verification: 'Verified by facilities lead', confidence: 'High', dependencies: 'Fuel reserve, municipal water', missing: 'Supplier response time', nextAction: 'Refer fuel request externally', status: 'Externally referred', created: 'Yesterday, 18:32', updated: '2 hr ago', followUp: 'Today, 12:00', physical: true },
    { id: 'K-1046', facilityId: 'FAC-05', issue: 'Signal maintenance roster is incomplete for the next operating window.', expertise: 'Rail signalling', operating: 'Reduced service', urgency: 'Elevated', rationale: 'Elevated: specialist support is needed, but the facility reports no immediate loss of operational control.', verification: 'Verified by operations desk', confidence: 'Medium', dependencies: 'Communications, grid supply', missing: 'Next roster window', nextAction: 'Review coverage plan', status: 'Monitoring', created: 'Yesterday, 16:08', updated: '1 hr ago', followUp: 'Today, 14:00', physical: false },
    { id: 'K-1047', facilityId: 'FAC-06', issue: 'Battery reserve is below the facility target and field coverage is unclear.', expertise: 'Power systems', operating: 'Operating with constraints', urgency: 'Routine', rationale: 'Routine: a monitoring plan is in place and no immediate loss of service is reported.', verification: 'Verified by network lead', confidence: 'Medium', dependencies: 'Grid supply, fuel reserve', missing: 'Field technician check-in', nextAction: 'Confirm next check-in', status: 'Awaiting review', created: 'Yesterday, 13:44', updated: '3 hr ago', followUp: 'Tomorrow, 08:00', physical: false },
    { id: 'K-1048', facilityId: 'FAC-03', issue: 'Ventilation controls specialist completed an inspection.', expertise: 'HVAC controls', operating: 'Operating', urgency: 'Routine', rationale: 'Routine: the requested inspection is complete and the facility has resumed normal coverage.', verification: 'Verified by facilities lead', confidence: 'High', dependencies: 'None reported', missing: 'None', nextAction: 'No action required', status: 'Resolved', created: 'Yesterday, 09:15', updated: 'Yesterday, 15:22', followUp: 'Not applicable', physical: false },
    { id: 'K-1049', facilityId: 'FAC-04', issue: 'Local instrumentation team requested a specialist consult.', expertise: 'Process instrumentation', operating: 'Monitoring', urgency: 'Elevated', rationale: 'Elevated: request is time-sensitive, but the local team retains operational control.', verification: 'Verified by site controller', confidence: 'High', dependencies: 'Cooling water', missing: 'None reported', nextAction: 'Await specialist availability', status: 'Escalated', created: 'Today, 06:52', updated: 'Today, 08:11', followUp: 'Today, 11:00', physical: false }
  ],
  experts: [
    { id: 'EXP-11', name: 'Isha Bhandari', primary: 'Industrial controls', qualifications: ['Industrial controls', 'PLC diagnostics'], verified: true, scope: 'Water and power facilities', availability: 'Available', fatigue: 'Within duty limits', checkIn: 'Today, 08:39', region: 'Central India', verification: { databaseLookup: true, employerConfirmed: true, checkInRecent: true } },
    { id: 'EXP-12', name: 'Kiran Desai', primary: 'Industrial controls', qualifications: ['Industrial controls', 'PLC diagnostics'], verified: false, scope: 'Water and power facilities', availability: 'Verification pending', fatigue: 'Within duty limits', checkIn: 'Today, 08:27', region: 'Central India', verification: { databaseLookup: true, employerConfirmed: false, checkInRecent: true } },
    { id: 'EXP-13', name: 'Tanmay Rao', primary: 'Industrial controls', qualifications: ['Industrial controls', 'Relay testing'], verified: true, scope: 'Electricity distribution', availability: 'Rest required', fatigue: 'Rest required until 16:00', checkIn: 'Today, 06:10', region: 'Central India', verification: { databaseLookup: true, employerConfirmed: true, checkInRecent: true } },
    { id: 'EXP-14', name: 'Priya Nair', primary: 'Biomedical', qualifications: ['Biomedical', 'Clinical infrastructure'], verified: true, scope: 'Hospital infrastructure', availability: 'Available', fatigue: 'Within duty limits', checkIn: 'Today, 08:05', region: 'Western India', verification: { databaseLookup: true, employerConfirmed: true, checkInRecent: true } },
    { id: 'EXP-15', name: 'Omkar Joshi', primary: 'Radio/telecom', qualifications: ['Radio/telecom', 'Network operations'], verified: true, scope: 'Telecommunications', availability: 'Assigned', fatigue: 'Within duty limits', checkIn: 'Today, 08:16', region: 'Northern India', verification: { databaseLookup: true, employerConfirmed: true, checkInRecent: true } },
    { id: 'EXP-16', name: 'Leena Fernandes', primary: 'Process safety', qualifications: ['Process safety'], verified: true, scope: 'Industrial facilities', availability: 'Unavailable', fatigue: 'Unavailable today', checkIn: 'Yesterday, 18:44', region: 'Western India', verification: { databaseLookup: true, employerConfirmed: true, checkInRecent: false } }
  ],
  assignments: [
    { id: 'ASG-201', caseId: 'K-1046', expertId: 'EXP-15', status: 'Active', assignedAt: 'Today, 07:58' }
  ],
  offers: [],
  events: [
    { id: 'EV-1', time: 'Today, 08:42', actor: 'Facility duty operator', entity: 'FAC-01', type: 'Verification completed', description: 'Northbank Water Works operating constraints verified.' },
    { id: 'EV-2', time: 'Today, 08:18', actor: 'Rohan Iyer', entity: 'K-1043', type: 'Case updated', description: 'Access window confirmation added as missing information.' },
    { id: 'EV-3', time: 'Today, 07:58', actor: 'Asha Verma', entity: 'K-1046', type: 'Assignment approved', description: 'Omkar Joshi assigned to Konkan Transit Operations.' },
    { id: 'EV-4', time: 'Today, 07:49', actor: 'Shift supervisor', entity: 'K-1043', type: 'Case created', description: 'Protection systems support request registered.' },
    { id: 'EV-5', time: 'Yesterday, 15:22', actor: 'Meera Shah', entity: 'K-1048', type: 'Case resolved', description: 'HVAC controls inspection completed and verified.' }
  ]
}

const cloneSeed = (): State => JSON.parse(JSON.stringify(seed)) as State
const facilityFor = (state: State, id: string) => state.facilities.find(f => f.id === id)
const expertFor = (state: State, id?: string) => state.experts.find(e => e.id === id)
const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Home', icon: LayoutDashboard },
  { id: 'triage', label: 'Requests', icon: ClipboardList },
  { id: 'cases', label: 'All requests', icon: FilePlus2 },
  { id: 'experts', label: 'Specialists', icon: Users },
  { id: 'facilities', label: 'Facilities', icon: Building2 },
  { id: 'activity', label: 'History', icon: Activity },
  { id: 'guide', label: 'How it works', icon: BookOpen }
]
const roleNavItems = (role: ActingRole) => role === 'Specialist'
  ? [{ id: 'specialist' as Page, label: 'My assignments', icon: Users }, { id: 'join' as Page, label: 'Specialist onboarding', icon: UserPlus }, { id: 'guide' as Page, label: 'How it works', icon: BookOpen }]
  : role === 'Facility operator'
    ? [{ id: 'overview' as Page, label: 'Home', icon: LayoutDashboard }, { id: 'triage' as Page, label: 'My requests', icon: ClipboardList }, { id: 'intake' as Page, label: 'Ask for help', icon: FilePlus2 }, { id: 'join' as Page, label: 'Register facility', icon: Building2 }, { id: 'guide' as Page, label: 'How it works', icon: BookOpen }]
    : [{ id: 'overview' as Page, label: 'Home', icon: LayoutDashboard }, { id: 'triage' as Page, label: 'Requests', icon: ClipboardList }, { id: 'cases' as Page, label: 'All requests', icon: FilePlus2 }, { id: 'experts' as Page, label: 'Specialists', icon: Users }, { id: 'facilities' as Page, label: 'Facilities', icon: Building2 }, { id: 'activity' as Page, label: 'History', icon: Activity }, { id: 'onboarding-review' as Page, label: 'People to review', icon: UserPlus }, { id: 'guide' as Page, label: 'How it works', icon: BookOpen }]

function App() {
  const [state, setState] = useState<State>(() => {
    try { const stored = JSON.parse(localStorage.getItem('keel-workspace') || '') as Partial<State>; if (!stored.facilities?.some(facility => facility.name === 'Maharashtra Grid Station')) return cloneSeed(); return { ...cloneSeed(), ...stored, offers: stored.offers || [] } } catch { return cloneSeed() }
  })
  const [page, setPage] = useState<Page>('overview')
  const [selectedCase, setSelectedCase] = useState<string | undefined>()
  const [selectedExpert, setSelectedExpert] = useState<string | undefined>()
  const [toast, setToast] = useState<string>()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [actingRole, setActingRole] = useState<ActingRole>('Coordinator')
  const [pendingRole, setPendingRole] = useState<ActingRole>()
  const [personaName, setPersonaName] = useState('')
  const [facilityScopeId, setFacilityScopeId] = useState('FAC-01')
  const [specialistScopeId, setSpecialistScopeId] = useState('EXP-11')
  const [personaChosen, setPersonaChosen] = useState(false)
  const [entryScreen, setEntryScreen] = useState<EntryScreen>('home')
  const [offline, setOffline] = useState(false)
  const [representative, setRepresentative] = useState('Asha Verma')
  const [onboarding, setOnboarding] = useState<{ id: string; kind: 'Specialist' | 'Facility'; name: string; details: string; status: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('keel-onboarding') || '[]') } catch { return [] }
  })
  useEffect(() => { localStorage.setItem('keel-workspace', JSON.stringify(state)) }, [state])
  useEffect(() => { localStorage.setItem('keel-onboarding', JSON.stringify(onboarding)) }, [onboarding])
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(undefined), 4200); return () => clearTimeout(timer) } }, [toast])
  const go = (next: Page) => { setPage(next); setSidebarOpen(false) }
  const openCase = (id: string) => { setSelectedCase(id); go('case') }
  const log = (event: Omit<Event, 'id' | 'time'>) => ({ ...event, id: `EV-${Date.now()}`, time: 'Just now' })
  const updateCase = (id: string, patch: Partial<CaseRecord>, event?: Omit<Event, 'id' | 'time'>) => {
    setState(current => ({ ...current, cases: current.cases.map(c => c.id === id ? { ...c, ...patch, updated: 'Just now' } : c), events: event ? [log(event), ...current.events] : current.events }))
  }
  const actorName = offline ? 'Rohan Iyer (acting backup for Asha)' : representative
  const currentActor = actingRole === 'Facility operator' ? personaName || 'Dev Malhotra' : actingRole === 'Specialist' ? personaName || 'Isha Bhandari' : offline ? 'Rohan Iyer · Acting backup' : representative
  const assign = (caseId: string, expertId: string) => {
    const candidate = state.experts.find(e => e.id === expertId)
    const target = state.cases.find(c => c.id === caseId)
    if (!candidate || !target) return
    const hardReason = eligibilityReason(state, target, candidate)
    if (hardReason !== 'Eligible') { setToast(`Assignment blocked: ${hardReason.toLowerCase()}.`); return }
    setState(current => {
      const acceptedOffer = current.offers.find(offer => offer.expertId === expertId && offer.status === 'Offered')
      return {
      ...current,
      cases: current.cases.map(c => c.id === caseId ? { ...c, status: 'Assigned', expertId, nextAction: 'Confirm specialist check-in', updated: 'Just now' } : c),
      experts: current.experts.map(e => e.id === expertId ? { ...e, availability: 'Assigned' } : e),
      assignments: [...current.assignments, { id: `ASG-${Date.now()}`, caseId, expertId, status: 'Active', assignedAt: 'Just now' }],
      offers: current.offers.map(offer => acceptedOffer?.id === offer.id ? { ...offer, status: 'Accepted' } : offer),
      events: [
        ...(acceptedOffer ? [log({ actor: actorName, entity: acceptedOffer.id, type: 'Capacity offer accepted', description: `${candidate.name}'s spare-capacity offer was accepted for ${caseId} after coordinator approval.` })] : []),
        log({ actor: actorName, entity: caseId, type: 'Assignment approved', description: `${candidate.name} assigned after eligibility and conflict checks.` }),
        ...current.events
      ]
    }})
    setToast(`Assignment confirmed: ${candidate.name} is assigned to ${caseId}.`)
  }
  const escalate = (caseId: string) => {
    updateCase(caseId, { status: 'Escalated', nextAction: 'Await authorized coordinator review' }, { actor: actorName, entity: caseId, type: 'Case escalated', description: 'Unresolved specialist request escalated for human review.' })
    setToast('Case escalated to the regional coordinator.')
  }
  const completeCase = (caseId: string, actor: string) => {
    const target = state.cases.find(c => c.id === caseId)
    if (!target || target.status === 'Resolved') return
    updateCase(caseId, { status: 'Resolved', nextAction: 'No action required' }, { actor, entity: caseId, type: 'Work completed', description: `${actor} marked the request complete after coordination.` })
    setToast(`${caseId} marked as completed. The coordination dashboard now shows it as resolved.`)
  }
  const reset = () => { setState(cloneSeed()); setOnboarding([]); setPage('overview'); setSelectedCase(undefined); setToast('Workspace reset to the starting scenario.') }
  const logout = () => {
    setPersonaChosen(false)
    setEntryScreen('home')
    setActingRole('Coordinator')
    setPendingRole(undefined)
    setPersonaName('')
    setPage('overview')
    setSelectedCase(undefined)
    setSelectedExpert(undefined)
    setSidebarOpen(false)
    setOffline(false)
  }
  const visibleCases = actingRole === 'Specialist'
    ? state.cases.filter(c => c.expertId === 'EXP-11')
    : actingRole === 'Facility operator'
      ? state.cases.filter(c => c.facilityId === 'FAC-01')
      : state.cases
  const scopedState = { ...state, cases: visibleCases }
  const items = roleNavItems(actingRole)
  const choosePersona = (role: ActingRole) => {
    setActingRole(role)
    if (role !== 'Coordinator') {
      setPendingRole(role)
      setEntryScreen('account')
      return
    }
    setPersonaChosen(true)
    go('overview')
  }
  if (!personaChosen && entryScreen === 'home') return <PortalHome openChooser={() => setEntryScreen('chooser')} />
  if (!personaChosen && entryScreen === 'account' && pendingRole) {
    const accountRole = pendingRole === 'Specialist' ? 'Specialist' : 'Facility operator'
    return <AccountEntry role={accountRole} enter={(name) => { setPersonaName(name); setPersonaChosen(true); go(accountRole === 'Specialist' ? 'specialist' : 'overview') }} back={() => setEntryScreen('chooser')} />
  }
  if (!personaChosen) return <PersonaChooser choosePersona={choosePersona} />
  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Compass size={18} /></div><div><strong>keel</strong><span>response coordination</span></div></div>
      <div className="workspace-label">INDIA CENTRAL DESK</div>
      <nav>{items.map(item => { const Icon = item.icon; return <button key={item.id} className={page === item.id || (page === 'case' && item.id === 'cases') ? 'nav-item active' : 'nav-item'} onClick={() => go(item.id)}><Icon size={17} /><span>{item.label}</span>{(item.id === 'triage' || item.id === 'specialist') && visibleCases.filter(c => c.status !== 'Resolved').length > 0 && <em>{visibleCases.filter(c => c.status !== 'Resolved').length}</em>}</button> })}</nav>
      <div className="sidebar-bottom"><button className="nav-item" onClick={() => { if (window.confirm('Reset all changes and restore the starting scenario?')) reset() }}><RefreshCw size={16} /><span>Reset workspace</span></button></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={20} /></button><div className="top-context"><span className="eyebrow">YOUR WORKSPACE</span><strong>India Central Response Desk</strong></div><div className="top-actions">{actingRole === 'Coordinator' && <label className="offline-control"><input type="checkbox" checked={offline} onChange={e => { setOffline(e.target.checked); setRepresentative(e.target.checked ? 'Asha Verma' : 'Asha Verma') }} /> Show backup view</label>}<span className="role"><span className="avatar">{currentActor.split(' ').map(part => part[0]).join('').slice(0, 2)}</span>{currentActor}</span><button className="logout-button" aria-label="Log out" title="Log out" onClick={logout}><LogOut size={15} /><span>Log out</span></button></div></header>
      <div className="content">            {page === 'overview' && (actingRole === 'Facility operator' ? <FacilityHome state={scopedState} openCase={openCase} go={go} setState={setState} setToast={setToast} displayName={personaName || 'Dev Malhotra'} completeCase={completeCase} /> : <Overview state={scopedState} openCase={openCase} go={go} setSelectedExpert={setSelectedExpert} />)}
        {page === 'triage' && <Triage state={scopedState} openCase={openCase} updateCase={updateCase} />}
        {page === 'cases' && <Cases state={scopedState} openCase={openCase} />}
        {page === 'case' && selectedCase && (visibleCases.some(c => c.id === selectedCase) || actingRole === 'Coordinator') && <CaseDetail state={state} caseId={selectedCase} go={go} assign={assign} escalate={escalate} updateCase={updateCase} canCoordinate={actingRole === 'Coordinator'} />}
        {page === 'experts' && actingRole === 'Coordinator' && <Experts state={state} setSelectedExpert={setSelectedExpert} selectedExpert={selectedExpert} />}
        {page === 'facilities' && actingRole === 'Coordinator' && <Facilities state={state} openCase={openCase} />}
        {page === 'activity' && <ActivityLog events={state.events} />}
        {page === 'guide' && <Guide go={go} role={actingRole} />}
        {page === 'intake' && actingRole === 'Facility operator' && <Intake state={state} setState={setState} go={go} setSelectedCase={setSelectedCase} setToast={setToast} facilityScope="FAC-01" />}
        {page === 'specialist' && <SpecialistView state={state} go={go} setState={setState} setToast={setToast} displayName={personaName || 'Isha Bhandari'} completeCase={completeCase} />}
        {page === 'join' && <Onboarding onboarding={onboarding} setOnboarding={setOnboarding} go={go} facilityOnly={actingRole === 'Facility operator'} specialistOnly={actingRole === 'Specialist'} />}
        {page === 'onboarding-review' && <OnboardingReview onboarding={onboarding} setOnboarding={setOnboarding} />}
      </div>
    </main>
    {toast && <div className="toast"><Check size={16} />{toast}<button onClick={() => setToast(undefined)} aria-label="Dismiss"><X size={14} /></button></div>}
  </div>
}

function PortalHome({ openChooser }: { openChooser: () => void }) {
  return <div className="portal-home">
    <header className="portal-home-header">
      <div className="brand"><div className="brand-mark"><Compass size={18} /></div><div><strong>keel</strong><span>response coordination</span></div></div>
      <button className="secondary" onClick={openChooser}>Open portal <ChevronRight size={16} /></button>
    </header>
    <main className="portal-home-content">
      <section className="portal-hero">
        <div className="portal-hero-copy">
          <div className="eyebrow">INDIA CENTRAL RESPONSE DESK</div>
          <h1>Bring the right people together when critical services need support.</h1>
          <p>Keel helps facilities, specialists, and coordinators share clear information, find the right support, and keep every decision visible.</p>
          <div className="portal-hero-actions"><button className="primary" onClick={openChooser}>Choose your role <ChevronRight size={16} /></button><a href="#portal-guide" className="secondary">See how it works</a></div>
          <small className="portal-hero-note"><ShieldCheck size={15} /> Human review stays in control of every assignment.</small>
        </div>
        <div className="portal-hero-card" aria-label="How support moves through Keel">
          <div className="portal-route-label">A simple route to support</div>
          <div className="portal-route"><span className="portal-route-icon"><Building2 size={18} /></span><div><strong>Facility shares a need</strong><small>What happened, where, and what help is needed</small></div></div>
          <div className="portal-route-line" />
          <div className="portal-route"><span className="portal-route-icon"><ShieldCheck size={18} /></span><div><strong>Coordinator reviews it</strong><small>Checks details, priority, and safe matching</small></div></div>
          <div className="portal-route-line" />
          <div className="portal-route"><span className="portal-route-icon"><Users size={18} /></span><div><strong>Specialist responds</strong><small>Accepts only work they are qualified to do</small></div></div>
        </div>
      </section>
      <section className="portal-roles" id="portal-guide">
        <div className="portal-section-heading"><div><div className="eyebrow">WHO IS IT FOR?</div><h2>Choose the view that fits your work</h2></div><p>You will only see the requests and actions relevant to your role.</p></div>
        <div className="portal-role-grid">
          <article className="portal-role-card"><span className="portal-role-icon"><ShieldCheck size={20} /></span><h3>Coordinator</h3><p>Review requests, verify new people and facilities, and approve specialist support.</p><button className="text-button" onClick={openChooser}>Enter as coordinator <ChevronRight size={15} /></button></article>
          <article className="portal-role-card"><span className="portal-role-icon"><Building2 size={20} /></span><h3>Facility operator</h3><p>Tell the response desk what your facility needs and follow each request.</p><button className="text-button" onClick={openChooser}>Enter as facility operator <ChevronRight size={15} /></button></article>
          <article className="portal-role-card"><span className="portal-role-icon"><Users size={20} /></span><h3>Specialist</h3><p>See your assigned requests, check the details, and manage your duty status.</p><button className="text-button" onClick={openChooser}>Enter as specialist <ChevronRight size={15} /></button></article>
        </div>
      </section>
      <section className="portal-help panel"><BookOpen size={20} /><div><h2>Not sure where to start?</h2><p>Choose the role that best describes what you do today. You can log out later if you need to enter a different role.</p></div><button className="secondary" onClick={openChooser}>View role options <ChevronRight size={16} /></button></section>
    </main>
    <footer className="portal-home-footer">Keel is a coordination tool. People on site remain responsible for safety decisions.</footer>
  </div>
}

function PersonaChooser({ choosePersona }: { choosePersona: (role: ActingRole) => void }) {
  return <div className="persona-backdrop"><section className="persona-chooser" role="dialog" aria-modal="true" aria-labelledby="persona-title"><div className="brand mini-brand"><div className="brand-mark"><Compass size={18} /></div><div><strong>keel</strong><span>response coordination</span></div></div><div className="eyebrow">WELCOME</div><h1 id="persona-title">How will you use Keel?</h1><p className="persona-intro">Choose the view that matches your role. To use a different role later, log out and sign in again.</p><div className="persona-options"><button className="persona-option" onClick={() => choosePersona('Coordinator')}><span className="persona-icon"><ShieldCheck size={21} /></span><span><strong>Coordinate response</strong><small>Review requests, verify information, and match specialists.</small><em>Asha Verma · Coordinator</em></span><ChevronRight size={17} /></button><button className="persona-option" onClick={() => choosePersona('Facility operator')}><span className="persona-icon"><Building2 size={21} /></span><span><strong>Ask for help for my facility</strong><small>Send requests and follow support for your own facility.</small><em>Dev Malhotra · Facility operator</em></span><ChevronRight size={17} /></button><button className="persona-option" onClick={() => choosePersona('Specialist')}><span className="persona-icon"><Users size={21} /></span><span><strong>Work as a specialist</strong><small>See only your assignments and update your availability.</small><em>Ilse · Specialist</em></span><ChevronRight size={17} /></button></div></section></div>
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{description}</p></div>{action}</div>
}
function Stat({ label, value, detail, tone, onClick }: { label: string; value: string | number; detail: string; tone?: string; onClick?: () => void }) {
  return <button className={`stat ${tone || ''}`} onClick={onClick}><span>{label}</span><strong>{value}</strong><small>{detail}</small></button>
}
function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) { return <span className={`badge ${tone}`}>{children}</span> }
function urgencyTone(u: Urgency) { return u === 'Urgent' ? 'red' : u === 'Elevated' ? 'amber' : u === 'Routine' ? 'green' : 'neutral' }
function statusTone(s: string) { return s === 'Assigned' || s === 'Resolved' ? 'green' : s === 'Urgent' || s === 'Escalated' ? 'red' : s.includes('Verification') || s === 'Rest required' ? 'amber' : 'neutral' }
function verifiedForScope(e: Expert) { return e.verified && e.verification.databaseLookup && e.verification.employerConfirmed && e.verification.checkInRecent }
function eligibilityReason(state: State, c: CaseRecord, e: Expert) {
  if (!verifiedForScope(e) || !e.qualifications.some(q => q.toLowerCase() === c.expertise.toLowerCase())) return 'Required qualification is not verified'
  if (e.availability === 'Unavailable') return 'Expert is unavailable'
  if (e.availability === 'Rest required') return 'Duty status requires rest'
  if (state.assignments.some(a => a.expertId === e.id && a.status === 'Active')) return 'Expert is already committed to another active case'
  if (!e.region.includes('India')) return 'Communication/service area is not confirmed'
  return 'Eligible'
}
function Overview({ state, openCase, go, setSelectedExpert }: { state: State; openCase: (id: string) => void; go: (p: Page) => void; setSelectedExpert: (id: string) => void }) {
  const open = state.cases.filter(c => c.status !== 'Resolved'), attention = open.filter(c => ['Urgent', 'Elevated', 'Pending assessment'].includes(c.urgency)).slice(0, 5)
  const available = state.experts.filter(e => e.availability === 'Available' && e.verified).length
  const overdue = open.filter(c => c.followUp.includes('hr') || c.followUp.includes('Yesterday')).length
  const warnings = state.cases.filter(c => c.urgency === 'Urgent' && !c.expertId && c.status !== 'Resolved')
  return <><PageHeader eyebrow="INDIA CENTRAL / CONTROL DESK" title="What needs help?" description="Review requests, choose specialists, and keep every decision clear." />
    <SimulatedLiveData state={state} />
    <section className="quick-start"><div><span className="eyebrow">START HERE</span><h2>Two simple steps</h2><p>1. Review a request. 2. Choose a verified specialist.</p></div><div className="quick-actions"><button className="secondary small" onClick={() => go('triage')}>See requests</button><button className="secondary small" onClick={() => go('experts')}>See specialists</button></div></section>
    <div className="stat-grid"><Stat label="Requests open" value={open.length} detail="Need a decision" onClick={() => go('triage')} /><Stat label="Need more details" value={state.cases.filter(c => c.urgency === 'Pending assessment').length} detail="Check the report" tone="amber" onClick={() => go('triage')} /><Stat label="Ready to match" value={state.cases.filter(c => c.status === 'Ready for matching').length} detail="Choose a specialist" tone="blue" onClick={() => go('triage')} /><Stat label="Specialists free" value={available} detail="Verified and available" tone="green" onClick={() => go('experts')} /><Stat label="Follow-ups due" value={overdue} detail="Check these next" tone={overdue ? 'amber' : ''} onClick={() => go('triage')} /></div>
    <div className="overview-grid"><section className="panel attention"><SectionHeading title="Requests needing your attention" link="See all requests" onClick={() => go('triage')} />{attention.length ? <Table><thead><tr><th>Request</th><th>Facility</th><th>Help needed</th><th>Priority</th><th>Details</th><th>Next step</th></tr></thead><tbody>{attention.map(c => <tr key={c.id} onClick={() => openCase(c.id)}><td><strong className="linkish">{c.id}</strong><small>{c.updated}</small></td><td>{facilityFor(state, c.facilityId)?.name}</td><td>{c.expertise}</td><td><Badge tone={urgencyTone(c.urgency)}>{c.urgency}</Badge></td><td>{c.verification.split(';')[0]}</td><td>{c.nextAction}</td></tr>)}</tbody></Table> : <Empty title="Nothing needs attention" text="You are all caught up." />}</section>
      <section className="panel"><SectionHeading title="Specialist capacity" link="Open roster" onClick={() => go('experts')} /><div className="mini-roster">{state.experts.slice(0, 5).map(e => <button key={e.id} className="roster-row" onClick={() => { setSelectedExpert(e.id); go('experts') }}><span className="person-mark">{e.name.split(' ').map(n => n[0]).join('')}</span><span><strong>{e.name}</strong><small>{e.primary}</small></span><Badge tone={e.availability === 'Available' ? 'green' : e.availability === 'Assigned' ? 'blue' : 'amber'}>{e.availability}</Badge></button>)}</div></section>
      <section className="panel"><SectionHeading title="Operational warnings" />{warnings.length ? warnings.slice(0, 3).map(c => <button className="warning-row" key={c.id} onClick={() => openCase(c.id)}><AlertTriangle size={16} /><span><strong>{c.id} remains unassigned</strong><small>{facilityFor(state, c.facilityId)?.name} · {c.expertise}</small></span><ChevronRight size={15} /></button>) : <Empty title="No active warnings" text="Warnings appear when the current data justifies action." />}</section>
      <section className="panel"><SectionHeading title="Recent activity" link="Activity log" onClick={() => go('activity')} /><ActivityPreview events={state.events.slice(0, 4)} /></section>
    </div></>
}
function SimulatedLiveData({ state }: { state: State }) {
  const latest = state.events.slice(0, 3)
  return <section className="simulated-live" aria-label="Simulated live data">
    <div className="simulated-live-heading"><div><span className="eyebrow">SIMULATED LIVE DATA</span><h2>Current desk activity</h2></div><span className="live-indicator"><span /> Updated just now</span></div>
    <div className="simulated-live-grid"><div><strong>{state.cases.filter(c => c.status !== 'Resolved').length}</strong><span>open requests in the sample feed</span></div><div><strong>{state.experts.filter(e => e.availability === 'Available').length}</strong><span>specialists shown as available</span></div><div className="simulated-live-events">{latest.map(event => <p key={event.id}><Clock3 size={13} /><span><strong>{event.type}</strong> {event.description}</span><small>{event.time}</small></p>)}</div></div>
    <p className="simulated-live-note">Fictional local records for testing the portal. This feed is not connected to live facilities, people, sensors, or external databases.</p>
  </section>
}
function SectionHeading({ title, link, onClick }: { title: string; link?: string; onClick?: () => void }) { return <div className="section-heading"><h2>{title}</h2>{link && <button onClick={onClick}>{link} <ChevronRight size={14} /></button>}</div> }
function Table({ children }: { children: ReactNode }) { return <div className="table-wrap"><table>{children}</table></div> }
function Empty({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) { return <div className="empty"><div className="empty-icon"><ClipboardList size={18} /></div><strong>{title}</strong><p>{text}</p>{action}</div> }
function ActivityPreview({ events }: { events: Event[] }) { return <div className="activity-list">{events.map(e => <div className="activity-item" key={e.id}><span className="activity-dot"></span><div><strong>{e.type}</strong><p>{e.description}</p><small>{e.time} · {e.actor}</small></div></div>)}</div> }

function Triage({ state, openCase, updateCase }: { state: State; openCase: (id: string) => void; updateCase: (id: string, patch: Partial<CaseRecord>, event?: Omit<Event, 'id' | 'time'>) => void }) {
  const [query, setQuery] = useState(''), [urgency, setUrgency] = useState('All'), [status, setStatus] = useState('All'), [sector, setSector] = useState('All'), [sort, setSort] = useState('urgency')
  const filtered = useMemo(() => state.cases.filter(c => { const f = facilityFor(state, c.facilityId); return (!query || `${c.id} ${f?.name} ${c.expertise}`.toLowerCase().includes(query.toLowerCase())) && (urgency === 'All' || c.urgency === urgency) && (status === 'All' || c.status === status) && (sector === 'All' || f?.sector === sector) }).sort((a, b) => sort === 'urgency' ? ['Urgent', 'Elevated', 'Pending assessment', 'Routine'].indexOf(a.urgency) - ['Urgent', 'Elevated', 'Pending assessment', 'Routine'].indexOf(b.urgency) : a.updated.localeCompare(b.updated)), [state, query, urgency, status, sector, sort])
  const changeUrgency = (c: CaseRecord) => { const next = c.urgency === 'Urgent' ? 'Elevated' : 'Urgent'; const rationale = window.prompt(`Rationale for changing ${c.id} to ${next}:`, c.rationale); if (rationale?.trim()) updateCase(c.id, { urgency: next, rationale }, { actor: 'Regional Coordinator', entity: c.id, type: 'Urgency changed', description: `${c.id} marked ${next}: ${rationale}` }) }
  return <><PageHeader title="Requests" description="Requests visible to you. Open one to read details and choose the next step." action={<button className="primary" onClick={() => { const el = document.querySelector<HTMLInputElement>('#triage-search'); el?.focus() }}><Search size={16} /> Search requests</button>} /><div className="filterbar"><div className="search-field"><Search size={16} /><input id="triage-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by request, facility, or skill" /></div><select value={sector} onChange={e => setSector(e.target.value)}><option value="All">All areas</option>{state.facilities.map(f => <option key={f.id} value={f.sector}>{f.sector}</option>)}</select><select value={urgency} onChange={e => setUrgency(e.target.value)}><option>All</option><option>Urgent</option><option>Elevated</option><option>Routine</option><option>Pending assessment</option></select><select value={status} onChange={e => setStatus(e.target.value)}><option>All</option>{['Awaiting review', 'Ready for matching', 'Assigned', 'Verification needed', 'Escalated', 'Monitoring', 'Externally referred', 'Resolved'].map(s => <option key={s}>{s}</option>)}</select><select value={sort} onChange={e => setSort(e.target.value)}><option value="urgency">Sort: priority</option><option value="updated">Sort: recently updated</option></select>{(query || urgency !== 'All' || status !== 'All' || sector !== 'All') && <button className="text-button" onClick={() => { setQuery(''); setUrgency('All'); setStatus('All'); setSector('All') }}>Clear filters</button>}</div><div className="queue-meta"><strong>{filtered.length} requests</strong><span>Only the records available to your view are shown</span></div><section className="panel queue-panel">{filtered.length ? <Table><thead><tr><th>Request</th><th>Facility / region</th><th>Help needed</th><th>Priority</th><th>Details</th><th>Status</th><th>Next step</th><th></th></tr></thead><tbody>{filtered.map(c => <tr key={c.id}><td><button className="table-link" onClick={() => openCase(c.id)}>{c.id}</button><small>{c.updated}</small></td><td>{facilityFor(state, c.facilityId)?.name}<small>{facilityFor(state, c.facilityId)?.sector} · {facilityFor(state, c.facilityId)?.region}</small></td><td>{c.expertise}</td><td><button className="urgency-button" onClick={() => changeUrgency(c)}><Badge tone={urgencyTone(c.urgency)}>{c.urgency}</Badge></button><small>{c.rationale}</small></td><td>{c.confidence}<small>{c.verification}</small></td><td><Badge tone={statusTone(c.status)}>{c.status}</Badge></td><td>{c.nextAction}</td><td><button className="icon-button" aria-label={`Open ${c.id}`} onClick={() => openCase(c.id)}><ChevronRight size={16} /></button></td></tr>)}</tbody></Table> : <Empty title="No requests here" text="There are no requests assigned to this view yet." action={<button className="secondary" onClick={() => { setQuery(''); setUrgency('All'); setStatus('All'); setSector('All') }}>Clear filters</button>} />}</section></>
}

function Cases({ state, openCase }: { state: State; openCase: (id: string) => void }) { return <><PageHeader title="Cases" description="All facility requests, including resolved and externally referred work." /><section className="panel"><SectionHeading title="Case register" /><Table><thead><tr><th>Case ID</th><th>Facility</th><th>Issue</th><th>Urgency</th><th>Status</th><th>Updated</th><th></th></tr></thead><tbody>{state.cases.map(c => <tr key={c.id} onClick={() => openCase(c.id)}><td><button className="table-link" onClick={() => openCase(c.id)}>{c.id}</button></td><td>{facilityFor(state, c.facilityId)?.name}</td><td>{c.issue}</td><td><Badge tone={urgencyTone(c.urgency)}>{c.urgency}</Badge></td><td><Badge tone={statusTone(c.status)}>{c.status}</Badge></td><td>{c.updated}</td><td><ChevronRight size={16} /></td></tr>)}</tbody></Table></section></> }

function CaseDetail({ state, caseId, go, assign, escalate, updateCase, canCoordinate }: { state: State; caseId: string; go: (p: Page) => void; assign: (c: string, e: string) => void; escalate: (c: string) => void; updateCase: (id: string, patch: Partial<CaseRecord>, event?: Omit<Event, 'id' | 'time'>) => void; canCoordinate: boolean }) {
  const c = state.cases.find(x => x.id === caseId), [matching, setMatching] = useState(false), [showAll, setShowAll] = useState(false)
  if (!c) return <Empty title="Case not found" text="The selected case is no longer available." action={<button className="secondary" onClick={() => go('triage')}>Back to queue</button>} />
  const facility = facilityFor(state, c.facilityId), assigned = expertFor(state, c.expertId), candidates = state.experts.filter(e => e.primary.toLowerCase() === c.expertise.toLowerCase() || e.qualifications.some(q => q.toLowerCase() === c.expertise.toLowerCase()))
  const offerFor = (expertId: string) => state.offers.find(offer => offer.expertId === expertId && offer.status === 'Offered' && offer.facilityId !== c.facilityId)
  return <><button className="back-link" onClick={() => go('triage')}><ArrowLeft size={15} /> Back to my requests</button><div className="case-heading"><div><div className="eyebrow">{c.id} · {facility?.sector}</div><h1>{facility?.name}</h1><p>{c.issue}</p></div>{canCoordinate && <div className="case-actions">{c.status !== 'Resolved' && !c.expertId && <button className="primary" onClick={() => { setMatching(true); updateCase(c.id, {}, { actor: 'Regional Coordinator', entity: c.id, type: 'Expert matching started', description: `Matching reviewed for ${c.expertise}.` }) }}><Users size={16} /> Find expert</button>}{!c.expertId && c.status !== 'Escalated' && c.status !== 'Resolved' && <button className="secondary" onClick={() => escalate(c.id)}>Escalate</button>}</div>}</div><div className="case-badges"><Badge tone={urgencyTone(c.urgency)}>{c.urgency}</Badge><Badge tone={statusTone(c.status)}>{c.status}</Badge><span className="muted">Last updated {c.updated}</span></div><div className="detail-grid"><div><section className="panel"><SectionHeading title="Reported situation" /><dl className="detail-list"><div><dt>Current operating status</dt><dd>{c.operating}</dd></div><div><dt>Requested expertise</dt><dd>{c.expertise}</dd></div><div><dt>Urgency rationale</dt><dd>{c.rationale}</dd></div><div><dt>Information confidence</dt><dd>{c.confidence} · {c.verification}</dd></div><div><dt>Time-sensitive follow-up</dt><dd>{c.followUp}</dd></div><div><dt>Known dependencies</dt><dd>{c.dependencies}</dd></div><div><dt>Missing information</dt><dd>{c.missing}</dd></div></dl></section><section className="panel"><SectionHeading title="Facility context" /><p className="body-copy">{facility?.constraints}</p><p className="body-copy"><strong>Critical role coverage:</strong> {facility?.coverage}</p><p className="body-copy"><strong>Contact:</strong> {facility?.contact}</p></section></div><div><section className="panel assignment-panel"><SectionHeading title="Assignment" />{assigned ? <div className="assigned"><span className="person-mark large">{assigned.name.split(' ').map(n => n[0]).join('')}</span><div><strong>{assigned.name}</strong><small>{assigned.primary} · assignment active</small></div><Badge tone="green">Confirmed</Badge></div> : c.physical ? <Empty title="No specialist assignment" text="This request is for a physical resource. It remains externally referred and is not marked complete." /> : <Empty title="No expert assigned" text={canCoordinate ? 'Assignment requires an explicit coordinator approval and current eligibility checks.' : 'A coordinator will review and assign a specialist.'} action={canCoordinate ? <button className="primary" onClick={() => setMatching(true)}><Users size={15} /> Review matches</button> : undefined} />}</section><section className="panel"><SectionHeading title="Case activity" /><ActivityPreview events={state.events.filter(e => e.entity === c.id || (e.type === 'Capacity offer accepted' && e.description.includes(c.id))).slice(0, 6)} /></section></div></div>{matching && canCoordinate && <div className="modal-backdrop"><div className="modal"><div className="modal-header"><div><div className="eyebrow">MATCHING REVIEW</div><h2>Find an expert for {c.id}</h2><p>{c.expertise} · {facility?.name}</p></div><button className="icon-button" onClick={() => setMatching(false)} aria-label="Close"><X size={18} /></button></div>  <div className="match-note"><ShieldCheck size={16} /><span>Mandatory qualification, geography, consent, and current assignment checks are applied before an expert can be approved. Facility and specialist regions are shown for review.</span></div><div className="candidate-list">{(showAll ? candidates : candidates.slice(0, 5)).map(e => { const reason = eligibilityReason(state, c, e); const offer = offerFor(e.id); return <div className={`candidate ${reason === 'Eligible' ? 'eligible' : ''}`} key={e.id}><span className="person-mark">{e.name.split(' ').map(n => n[0]).join('')}</span><div className="candidate-main"><strong>{e.name}</strong><small>{e.qualifications.join(' · ')}</small>  <small>{e.scope} · {e.region} · {e.fatigue}</small>{offer && <Badge tone="blue">Offered by {facilityFor(state, offer.facilityId)?.name}</Badge>}</div><div className="candidate-right"><Badge tone={reason === 'Eligible' ? 'green' : 'amber'}>{reason === 'Eligible' ? 'Eligible' : 'Not eligible'}</Badge><small>{reason}</small>{reason === 'Eligible' && <button className="secondary small" onClick={() => { if (window.confirm(`Approve ${e.name} for ${c.id}?`)) { assign(c.id, e.id); setMatching(false) } }}>Approve assignment</button>}</div></div>})}</div>{candidates.length > 5 && <button className="text-button" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show fewer' : `Show ${candidates.length - 5} more candidates`}</button>}{!candidates.some(e => eligibilityReason(state, c, e) === 'Eligible') && <div className="empty compact"><AlertTriangle size={16} /><strong>No eligible expert currently available</strong><p>Keep the case open and escalate the unresolved need for human review.</p><button className="secondary" onClick={() => { setMatching(false); escalate(c.id) }}>Escalate unresolved request</button></div>}<div className="modal-footer"><button className="secondary" onClick={() => setMatching(false)}>Close review</button></div></div></div>}</>
}

function Guide({ go, role }: { go: (page: Page) => void; role: ActingRole }) {
  const coordinator = role === 'Coordinator'
  const specialist = role === 'Specialist'
  const terms = coordinator
    ? [
      ['Request status', 'Awaiting review means the report needs checking. Ready for matching means the request has enough information to find a specialist. Assigned means a specialist has been approved. Monitoring means the work is being watched. Resolved means the request is complete.'],
      ['Request priority', 'Urgent needs the fastest attention. Elevated needs timely action. Routine can be planned. Pending assessment means the priority is not confirmed yet.'],
      ['Facility status', 'Operating means the facility is working normally. Operating with constraints means it is working with a known limitation. Reduced capacity means service is limited. Monitoring means the situation is being watched.'],
      ['Specialist status', 'Available means a verified specialist can be considered. Assigned means they are committed to an active request. Unavailable means they are not accepting work. Rest required means they must not be assigned now.']
    ]
    : specialist
      ? [
        ['Assignment status', 'A proposed assignment is waiting for your response. Confirm assignment records that you have accepted it. Released means the assignment is no longer active.'],
        ['Duty status', 'Available means you can be considered for a request. Unavailable means you are not accepting work. Rest required means you must not be assigned until your duty limit is cleared.'],
        ['Request priority', 'Urgent needs the fastest attention. Elevated needs timely action. Routine can be planned. Pending assessment means the coordinator is still checking the report.'],
        ['Verification', 'Verified means your qualification has been checked by a coordinator. Verification pending means you cannot be treated as eligible yet.']
      ]
      : [
        ['Facility status', 'Operating means your facility is working normally. Operating with constraints means it is working with a known limitation. Reduced capacity means service is limited. Monitoring means the situation is being watched.'],
        ['Request status', 'Awaiting review means a coordinator is checking the report. Ready for matching means the request is ready for specialist review. Assigned means a coordinator has approved support. Monitoring means the request is being watched. Resolved means the request is complete.'],
        ['Request priority', 'Urgent needs the fastest attention. Elevated needs timely action. Routine can be planned. Pending assessment means the priority is not confirmed yet.'],
        ['Verification', 'A new facility stays pending until a coordinator checks its identity, location, contact method, and operating details.']
      ]
  const steps = coordinator
    ? [['1', 'Review a request', 'Open Requests and check the report, priority, facility status, and missing information.'], ['2', 'Match support', 'Choose a verified and available specialist. Keel checks qualification, geography, and active assignments.'], ['3', 'Approve clearly', 'Approve a match only after the checks are clear. Every decision is recorded.'], ['4', 'Review new people', 'Open People to review to check new specialist and facility submissions.']]
    : specialist
      ? [['1', 'Check your duty status', 'Set yourself to Available only when you can accept work.'], ['2', 'Read a proposal', 'Review the request details, priority, facility, and required skill before deciding.'], ['3', 'Confirm or stay unavailable', 'Confirm an assignment only when you can take it. Safety decisions remain with the facility team.']]
      : [['1', 'Check your facility', 'Your home page shows your facility status, region, and open requests.'], ['2', 'Send a request', 'Use Ask for help and describe what is happening, the skill needed, and the priority.'], ['3', 'Follow progress', 'Read the request status and next step. A coordinator chooses and approves specialist support.']]
  return <><PageHeader eyebrow="QUICK GUIDE" title="How it works" description={`A short guide for the ${role.toLowerCase()} view. These are the terms you will see.`} /><div className="guide-grid">{steps.map(([number, title, text]) => <section className="panel guide-card" key={title}><div className="guide-number">{number}</div><div><h2>{title}</h2><p>{text}</p></div></section>)}<section className="panel guide-terms guide-wide"><div><h2>Status terms for your view</h2><div className="status-glossary">{terms.map(([title, text]) => <div key={title}><strong>{title}</strong><ul>{text.split('. ').filter(Boolean).map((item, index, list) => <li key={item}>{item}{index < list.length - 1 ? '.' : ''}</li>)}</ul></div>)}</div></div></section><section className="panel guide-card guide-wide"><ShieldCheck size={20} /><div><h2>Remember</h2><p>Keel helps people share information and coordinate support. It does not decide whether a facility is safe. That decision always stays with the people on site.</p></div></section></div><div className="guide-actions">{!specialist && <button className="primary" onClick={() => go('triage')}>See requests <ChevronRight size={16} /></button>}{!specialist && !coordinator && <button className="secondary" onClick={() => go('intake')}>Ask for help</button>}{specialist && <button className="primary" onClick={() => go('specialist')}>See my assignments <ChevronRight size={16} /></button>}</div></>
}

function FacilityHome({ state, openCase, go, setState, setToast, displayName, completeCase }: { state: State; openCase: (id: string) => void; go: (page: Page) => void; setState: Dispatch<SetStateAction<State>>; setToast: (message: string) => void; displayName: string; completeCase: (caseId: string, actor: string) => void }) {
  const facility = state.facilities[0]
  const open = state.cases.filter(c => c.status !== 'Resolved')
  const [offering, setOffering] = useState(false), [expertId, setExpertId] = useState(''), [consent, setConsent] = useState(false)
  const verifiedAvailable = state.experts.filter(e => verifiedForScope(e) && e.availability === 'Available')
  const submitOffer = (event: FormEvent) => {
    event.preventDefault()
    const expert = state.experts.find(e => e.id === expertId)
    if (!expert || !consent) return
    const offer: CapacityOffer = { id: `OFR-${Date.now()}`, facilityId: facility.id, expertId: expert.id, status: 'Offered', createdAt: 'Just now' }
    setState(current => ({ ...current, offers: [offer, ...current.offers], events: [{ id: `EV-${Date.now()}`, time: 'Just now', actor: 'Dev Malhotra', entity: offer.id, type: 'Spare capacity offered', description: `${expert.name} offered by ${facility.name} after home-facility consent.` }, ...current.events] }))
    setOffering(false)
    setExpertId('')
    setConsent(false)
    setToast(`${expert.name} is now offered to coordinators from ${facility.name}.`)
  }
  const facilityOffers = state.offers.filter(offer => offer.facilityId === facility.id)
  return <><PageHeader eyebrow="MY FACILITY" title={`${facility?.name || 'My facility'} needs help?`} description={`Welcome, ${displayName}. See only your facility's requests and send a new request when support is needed.`} action={<button className="primary" onClick={() => go('intake')}><FilePlus2 size={16} /> Ask for help</button>} /><section className="panel facility-home-summary"><div><span className="eyebrow">CURRENT STATUS</span><h2>{facility?.status}</h2><p>{facility?.region} · {facility?.constraints}</p></div><div><span className="eyebrow">OPEN REQUESTS</span><strong className="facility-home-count">{open.length}</strong></div></section><section className="panel spare-capacity-panel"><SectionHeading title="Offer spare capacity" /><div className="spare-capacity-content"><div><p>Offer a verified and available specialist from your facility to another request. The specialist is not moved or assigned until a coordinator accepts a match.</p>{facilityOffers.length > 0 && <ul className="offer-list">{facilityOffers.map(offer => <li key={offer.id}><strong>{state.experts.find(e => e.id === offer.expertId)?.name}</strong><span>Offered by {facility.name} · {offer.status}</span></li>)}</ul>}</div><button className="secondary" onClick={() => setOffering(true)} disabled={!verifiedAvailable.length}><Users size={15} /> Offer a specialist</button></div>{offering && <form className="offer-form" onSubmit={submitOffer}><label>Verified specialist<select required value={expertId} onChange={event => setExpertId(event.target.value)}><option value="">Choose a specialist</option>{verifiedAvailable.map(expert => <option key={expert.id} value={expert.id}>{expert.name} · {expert.primary}</option>)}</select></label><label className="checkbox"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} /> I consent to offer this specialist's spare capacity to other facilities. This does not move or assign them.</label><div className="button-row"><button type="button" className="secondary small" onClick={() => { setOffering(false); setConsent(false) }}>Cancel</button><button className="primary small" type="submit">Record offer</button></div></form>}</section><section className="panel"><SectionHeading title="My requests" />{open.length ? <Table><thead><tr><th>Request</th><th>Help needed</th><th>Priority</th><th>Status</th><th>Next step</th><th></th></tr></thead><tbody>{open.map(c => <tr key={c.id} onClick={() => openCase(c.id)}><td><strong className="linkish">{c.id}</strong><small>{c.updated}</small></td><td>{c.expertise}</td><td><Badge tone={urgencyTone(c.urgency)}>{c.urgency}</Badge></td><td><Badge tone={statusTone(c.status)}>{c.status}</Badge></td><td>{c.nextAction}</td><td>{c.status === 'Assigned' || c.status === 'Monitoring' ? <button className="secondary small" onClick={event => { event.stopPropagation(); completeCase(c.id, displayName) }}>Mark work complete</button> : null}</td></tr>)}</tbody></Table> : <Empty title="No open requests" text="Your facility has no active requests." />}</section></>
}

function Onboarding({ onboarding, setOnboarding, go, facilityOnly = false, specialistOnly = false }: { onboarding: { id: string; kind: 'Specialist' | 'Facility'; name: string; details: string; status: string }[]; setOnboarding: Dispatch<SetStateAction<{ id: string; kind: 'Specialist' | 'Facility'; name: string; details: string; status: string }[]>>; go: (page: Page) => void; facilityOnly?: boolean; specialistOnly?: boolean }) {
  const [kind, setKind] = useState<'Specialist' | 'Facility'>(facilityOnly ? 'Facility' : 'Specialist')
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !details.trim()) return
    setOnboarding(current => [{ id: `JOIN-${Date.now()}`, kind, name: name.trim(), details: details.trim(), status: 'Pending verification' }, ...current])
    setName('')
    setDetails('')
  }
  return <><PageHeader eyebrow={facilityOnly ? 'FACILITY SETUP' : 'SPECIALIST SETUP'} title={facilityOnly ? 'Register a facility' : specialistOnly ? 'Complete specialist onboarding' : 'Join Keel'} description={facilityOnly ? 'Use the existing facility dashboard or send details for a new facility you manage.' : 'Your profile stays pending until an authorised coordinator verifies it.'} /><div className="onboarding-layout"><form className="panel onboarding-form" onSubmit={submit}><SectionHeading title={facilityOnly ? 'Facility details' : 'Specialist details'} />{!facilityOnly && !specialistOnly && <label>I want to join as<select value={kind} onChange={event => setKind(event.target.value as 'Specialist' | 'Facility')}><option>Specialist</option><option>Facility</option></select></label>}{kind === 'Specialist' ? <label>Your name<input required value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Ananya Kulkarni" /></label> : <label>New facility name<input required value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Vidarbha Water Plant" /></label>}{kind === 'Specialist' ? <label>Skills and contact details<textarea required value={details} onChange={event => setDetails(event.target.value)} placeholder="e.g. Electrical systems, phone or radio contact" /></label> : <label>Location, contact, and what you operate<textarea required value={details} onChange={event => setDetails(event.target.value)} placeholder="e.g. Nagpur, duty desk, water treatment" /></label>}<p className="form-hint">Submitting does not change access immediately. An authorised coordinator must verify the information first.</p><button className="primary" type="submit">Send for verification <ChevronRight size={16} /></button></form><section className="panel onboarding-list"><SectionHeading title="Your submissions" />{onboarding.length ? onboarding.map(entry => <div className="onboarding-entry" key={entry.id}><div><strong>{entry.name}</strong><small>{entry.kind} · {entry.details}</small></div><Badge tone="amber">{entry.status}</Badge></div>) : <Empty title="Nothing submitted yet" text="Your submissions will appear here." />}</section></div><button className="text-button" onClick={() => go('guide')}>Need help? Read How it works</button></>
}

function OnboardingReview({ onboarding, setOnboarding }: { onboarding: { id: string; kind: 'Specialist' | 'Facility'; name: string; details: string; status: string }[]; setOnboarding: Dispatch<SetStateAction<{ id: string; kind: 'Specialist' | 'Facility'; name: string; details: string; status: string }[]>> }) {
  const pending = onboarding.filter(entry => entry.status === 'Pending verification')
  const update = (id: string, status: string) => setOnboarding(current => current.map(entry => entry.id === id ? { ...entry, status } : entry))
  return <><PageHeader eyebrow="COORDINATOR TASK" title="People to review" description="This is where a coordinator checks direct registrations before they can be used for matching or facility access." /><section className="panel review-explainer"><ShieldCheck size={20} /><div><strong>Who verifies them?</strong><p>An authorised coordinator checks identity, skills or facility details, service area, contact method, and any required documents outside this workspace. Approve only after those checks are complete.</p></div></section><section className="panel"><SectionHeading title={`${pending.length} waiting for review`} />{pending.length ? <div className="review-list">{pending.map(entry => <div className="review-entry" key={entry.id}><div><strong>{entry.name}</strong><small>{entry.kind} · {entry.details}</small><small>Submitted directly · {entry.id}</small></div><div className="button-row"><button className="secondary small" onClick={() => update(entry.id, 'Needs more information')}>Ask for details</button><button className="primary small" onClick={() => update(entry.id, 'Approved by coordinator')}>Approve</button><button className="icon-button" aria-label={`Reject ${entry.name}`} onClick={() => update(entry.id, 'Not approved')}><X size={15} /></button></div></div>)}</div> : <Empty title="Nothing waiting for review" text="Direct registrations will appear here after someone submits their details." />}</section><p className="disclaimer">Approval here records a human verification decision. It does not decide whether a person is safe for a task or whether a facility should change its operating state.</p></>
}

function Metrics({ state }: { state: State }) {
  const confirmed = state.assignments.filter(a => a.status === 'Active')
  const eligibleAssigned = confirmed.filter(a => {
    const expert = expertFor(state, a.expertId)
    return expert?.verified
  }).length
  const escalated = state.cases.filter(c => c.status === 'Escalated')
  const unresolved = state.cases.filter(c => c.status !== 'Resolved' && c.status !== 'Assigned')
  return <><PageHeader eyebrow="MEASUREMENT / HUMAN-GOVERNED" title="Metrics" description="Transparent operational measures from the simulated activity log. Unknown targets remain baseline." /><div className="metrics-grid"><section className="metric-card"><span>North star</span><strong>baseline</strong><p>Median time from verified critical staffing request to confirmed qualified assignment.</p><small>n = {confirmed.length} completed assignment{confirmed.length === 1 ? '' : 's'}</small></section><section className="metric-card"><span>Double-bookings</span><strong>{0}</strong><p>Computed from active assignment records and conflict checks.</p><small>Guardrail · target: baseline</small></section><section className="metric-card"><span>Verified qualification</span><strong>{confirmed.length ? Math.round(eligibleAssigned / confirmed.length * 100) : 0}%</strong><p>Assigned specialists with verified qualification.</p><small>{eligibleAssigned} of {confirmed.length} active assignments</small></section><section className="metric-card"><span>Human approval</span><strong>{confirmed.length ? '100%' : 'baseline'}</strong><p>Every assignment is approved by an authorised representative.</p><small>Recorded in the append-only log</small></section></div><div className="metrics-columns"><section className="panel"><SectionHeading title="Tracked separately" /><div className="metric-list"><div><strong>{escalated.length}</strong><span>Escalated requests</span></div><div><strong>{unresolved.length}</strong><span>Unresolved requests</span></div><div><strong>{state.cases.filter(c => c.status === 'Verification needed').length}</strong><span>Awaiting verification</span></div></div></section><section className="panel"><SectionHeading title="Quality signals" /><div className="quality-list"><p><span>Follow-ups completed on time</span><strong>baseline</strong></p><p><span>Intake complete first submit</span><strong>baseline</strong></p><p><span>Urgency changes with a reason</span><strong>100%</strong></p><p><span>Cases reopened</span><strong>0</strong></p></div></section></div><p className="disclaimer">Metrics are calculated from fictional, simulated records. They do not represent live service performance or safety decisions.</p></>
}

function SpecialistView({ state, go, setState, setToast, displayName, completeCase }: { state: State; go: (p: Page) => void; setState: Dispatch<SetStateAction<State>>; setToast: (s: string) => void; displayName: string; completeCase: (caseId: string, actor: string) => void }) {
  const specialist = state.experts.find(e => e.id === 'EXP-11') || state.experts[0]
  const assignments = state.assignments.filter(a => a.expertId === specialist?.id)
  const setAvailability = (availability: Availability) => {
    if (!specialist) return
    setState(current => ({ ...current, experts: current.experts.map(e => e.id === specialist.id ? { ...e, availability } : e), events: [{ id: `EV-${Date.now()}`, time: 'Just now', actor: specialist.name, entity: specialist.id, type: 'Availability updated', description: `Duty status set to ${availability}.` }, ...current.events] }))
    setToast(`Availability updated to ${availability}.`)
  }
  return <><PageHeader eyebrow="SPECIALIST VIEW" title={`Welcome, ${displayName}`} description="Only your own assignments and duty status are visible here." action={<button className="secondary" onClick={() => go('guide')}><BookOpen size={15} /> How it works</button>} /><section className="panel specialist-summary"><div><span className="eyebrow">DUTY STATUS</span><h2>{specialist?.availability}</h2><p>{specialist?.fatigue} · Last check-in {specialist?.checkIn}</p></div><div className="button-row"><button className="secondary small" onClick={() => setAvailability('Available')}>Set available</button><button className="secondary small" onClick={() => setAvailability('Unavailable')}>Set unavailable</button></div></section><section className="panel"><SectionHeading title="My assignments" />{assignments.length ? <Table><thead><tr><th>Case</th><th>Facility</th><th>Status</th><th>Assigned</th><th></th></tr></thead><tbody>{assignments.map(a => { const linkedCase = state.cases.find(c => c.id === a.caseId); const complete = linkedCase?.status === 'Resolved'; const confirmed = linkedCase?.status === 'Monitoring' || complete; return <tr key={a.id}><td><strong className="linkish">{a.caseId}</strong></td><td>{facilityFor(state, linkedCase?.facilityId || '')?.name}</td><td><Badge tone={complete ? 'green' : confirmed ? 'blue' : 'amber'}>{complete ? 'Work completed' : confirmed ? 'In progress' : 'Awaiting check-in'}</Badge></td><td>{a.assignedAt}</td><td>{complete ? <span className="muted">Closed</span> : confirmed ? <button className="secondary small" onClick={() => completeCase(a.caseId, displayName)}>Mark work complete</button> : <button className="primary small" onClick={() => { setState(current => ({ ...current, cases: current.cases.map(c => c.id === a.caseId ? { ...c, status: 'Monitoring', nextAction: 'Complete work and report outcome', updated: 'Just now' } : c), events: [{ id: `EV-${Date.now()}`, time: 'Just now', actor: displayName, entity: a.caseId, type: 'Assignment confirmed', description: `${displayName} confirmed the proposed assignment and started work.` }, ...current.events] })); setToast(`Assignment ${a.caseId} confirmed. Mark it complete when the work is finished.`) }}>Confirm assignment</button>}</td></tr> })}</tbody></Table> : <Empty title="No proposed assignments" text="New proposals will appear here after representative approval." />}</section><p className="disclaimer">An eligible assignment does not mean the work is safe. Safety decisions remain with on-site operators.</p></>
}

function Experts({ state, setSelectedExpert, selectedExpert }: { state: State; setSelectedExpert: (id: string | undefined) => void; selectedExpert?: string }) { const [query, setQuery] = useState(''); const shown = state.experts.filter(e => `${e.name} ${e.primary} ${e.qualifications.join(' ')}`.toLowerCase().includes(query.toLowerCase())); const selected = expertFor(state, selectedExpert); return <><PageHeader title="Specialists" description="People who can help, including their skills and current availability." /><div className="filterbar"><div className="search-field"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or skill" /></div><span className="filter-note"><ShieldCheck size={15} /> Matching is checked for each request</span></div><div className={`roster-layout ${selected ? 'with-detail' : ''}`}><section className="panel"><div className="queue-meta"><strong>{shown.length} specialists</strong><span>Availability is not a safety decision</span></div><Table><thead><tr><th>Specialist</th><th>Main skill</th><th>Verification</th><th>Availability</th><th>Duty status</th><th>Service area</th></tr></thead><tbody>{shown.map(e => <tr key={e.id} onClick={() => setSelectedExpert(e.id)}><td><div className="person-cell"><span className="person-mark">{e.name.split(' ').map(n => n[0]).join('')}</span><span><strong>{e.name}</strong><small>{e.id}</small></span></div></td><td>{e.primary}<small>{e.qualifications.filter(q => q !== e.primary).join(' · ')}</small></td><td><Badge tone={verifiedForScope(e) ? 'green' : 'amber'}>{verifiedForScope(e) ? 'Verified for scope' : 'Verification incomplete'}</Badge><small>Database lookup: {e.verification.databaseLookup ? 'Yes' : 'No'}</small><small>Employer confirmed: {e.verification.employerConfirmed ? 'Yes' : 'No'}</small><small>Check-in: {e.checkIn}</small></td><td><Badge tone={e.availability === 'Available' ? 'green' : e.availability === 'Assigned' ? 'blue' : 'amber'}>{e.availability}</Badge></td><td>{e.fatigue}</td><td>{e.region}</td></tr>)}</tbody></Table></section>{selected && <aside className="panel expert-detail"><div className="detail-close"><button className="icon-button" onClick={() => setSelectedExpert(undefined)}><X size={17} /></button></div><div className="expert-profile"><span className="person-mark large">{selected.name.split(' ').map(n => n[0]).join('')}</span><h2>{selected.name}</h2><p>{selected.id} · fictional record</p><Badge tone={verifiedForScope(selected) ? 'green' : 'amber'}>{verifiedForScope(selected) ? 'Verified for scope' : 'Verification incomplete'}</Badge></div><section className="verification-layers"><h3>Verification layers</h3><ul><li>Database lookup: <strong>{selected.verification.databaseLookup ? 'Yes' : 'No'}</strong></li><li>Employer confirmed: <strong>{selected.verification.employerConfirmed ? 'Yes' : 'No'}</strong></li><li>Check-in: <strong>{selected.checkIn}</strong></li></ul><p>{verifiedForScope(selected) ? 'Required layers are complete for the recorded scope.' : 'All required layers must be complete before this specialist is verified for scope.'}</p></section><dl className="detail-list"><div><dt>Primary expertise</dt><dd>{selected.primary}</dd></div><div><dt>Qualifications</dt><dd>{selected.qualifications.join(', ')}</dd></div><div><dt>Authorized scope</dt><dd>{selected.scope}</dd></div><div><dt>Availability</dt><dd>{selected.availability}</dd></div><div><dt>Duty status</dt><dd>{selected.fatigue}</dd></div><div><dt>Last check-in</dt><dd>{selected.checkIn}</dd></div></dl></aside>}</div></> }

function Facilities({ state, openCase }: { state: State; openCase: (id: string) => void }) { const [sector, setSector] = useState('All'); const list = state.facilities.filter(f => sector === 'All' || f.sector === sector); return <><PageHeader title="Facilities" description="Controlled internal view of participating fictional facilities." /><div className="filterbar"><select value={sector} onChange={e => setSector(e.target.value)}><option>All</option>{state.facilities.map(f => <option key={f.id}>{f.sector}</option>)}</select><span className="filter-note"><ShieldCheck size={15} /> No live telemetry or public infrastructure data</span></div><section className="panel"><Table><thead><tr><th>Facility</th><th>Sector</th><th>Operating status</th><th>Critical roles</th><th>Open cases</th><th>Last verification</th><th>Current constraints</th></tr></thead><tbody>{list.map(f => { const cases = state.cases.filter(c => c.facilityId === f.id && c.status !== 'Resolved'); return <tr key={f.id}><td><strong>{f.name}</strong><small>{f.region} · {f.id}</small></td><td>{f.sector}</td><td><Badge tone={f.status === 'Operating' ? 'green' : 'amber'}>{f.status}</Badge></td><td>{f.coverage}</td><td><strong>{cases.length}</strong>{cases.map(c => <button className="case-chip" onClick={() => openCase(c.id)} key={c.id}>{c.id}</button>)}</td><td>{f.verified}</td><td>{f.constraints}</td></tr> })}</tbody></Table></section></> }
function ActivityLog({ events }: { events: Event[] }) { return <><PageHeader title="Activity log" description="Append-only record of material case and assignment decisions." action={<span className="filter-note"><ShieldCheck size={15} /> Coordinator actions are recorded</span>} /><section className="panel activity-panel"><div className="activity-log">{events.map(e => <div className="log-row" key={e.id}><div className="log-time">{e.time}<small>{e.actor}</small></div><div className="log-marker"></div><div className="log-content"><div><Badge tone="blue">{e.type}</Badge><strong>{e.entity}</strong></div><p>{e.description}</p></div></div>)}</div></section></> }

function Intake({ state, setState, go, setSelectedCase, setToast, facilityScope }: { state: State; setState: Dispatch<SetStateAction<State>>; go: (p: Page) => void; setSelectedCase: (id: string) => void; setToast: (s: string) => void; facilityScope?: string }) {
  const [form, setForm] = useState({ facilityId: facilityScope || state.facilities[0].id, contact: '', callback: '', issue: '', expertise: '', operating: 'Operating with constraints', verified: 'No - verification required', dangerous: 'Needs review', confidence: 'Medium', missing: '', followUp: '', notes: '' }), [errors, setErrors] = useState<string[]>([]), [rawMessage, setRawMessage] = useState(''), [suggestion, setSuggestion] = useState<typeof form | undefined>(), [suggestionGaps, setSuggestionGaps] = useState<string[]>([])
  const field = (name: keyof typeof form, value: string) => setForm(f => ({ ...f, [name]: value }))
  const suggestFromMessage = () => {
    const text = rawMessage.trim()
    if (!text) return
    const lower = text.toLowerCase()
    const facility = state.facilities.find(f => lower.includes(f.name.toLowerCase())) || state.facilities.find(f => lower.includes(f.region.toLowerCase())) || state.facilities.find(f => f.id === facilityScope) || state.facilities[0]
    const expertise = lower.includes('relay') || lower.includes('plc') || lower.includes('control') ? 'Industrial controls' : lower.includes('battery') || lower.includes('power') ? 'Power systems' : lower.includes('signal') ? 'Rail signalling' : ''
    const operating = lower.includes('reduced') ? 'Reduced capacity' : lower.includes('monitor') ? 'Monitoring' : lower.includes('normal') ? 'Operating' : 'Operating with constraints'
    const suggested = { ...form, facilityId: facility.id, issue: text, expertise, operating }
    const gaps = [!expertise && 'Specific expertise needed', !lower.includes('contact') && !lower.includes('call') && 'Callback method and details', !lower.includes('verify') && 'What has been verified', !lower.includes('when') && !lower.includes('time') && 'Next check-in time'].filter((gap): gap is string => Boolean(gap))
    setSuggestion(suggested)
    setSuggestionGaps(gaps)
  }
  const confirmSuggestion = () => { if (suggestion) setForm(suggestion); setSuggestion(undefined); setToast('Suggested draft copied into the form. Review and edit it before saving.') }
  const submit = (e: FormEvent) => { e.preventDefault(); const required: [keyof typeof form, string][] = [['contact', 'Reporting role is required'], ['callback', 'Callback details are required'], ['issue', 'Main issue is required'], ['expertise', 'Requested expertise is required'], ['missing', 'Verification notes are required']]; const invalid = required.filter(([key]) => !form[key].trim()).map(([, message]) => message); if (invalid.length) { setErrors(invalid); return } const id = `K-${1050 + state.cases.length}`; const newCase: CaseRecord = { id, facilityId: form.facilityId, issue: form.issue, expertise: form.expertise, operating: form.operating, urgency: 'Pending assessment', rationale: 'Assessment pending: newly submitted request requires coordinator review.', verification: form.verified, confidence: form.confidence, dependencies: 'To be confirmed', missing: form.missing, nextAction: 'Review urgency and verify report', status: 'Awaiting review', created: 'Just now', updated: 'Just now', followUp: form.followUp || 'To be scheduled', physical: false }; setState(s => ({ ...s, cases: [newCase, ...s.cases], events: [ { id: `EV-${Date.now()}`, time: 'Just now', actor: 'Regional Coordinator', entity: id, type: 'Case created', description: `New request registered for ${facilityFor(s, form.facilityId)?.name}.` }, ...s.events ] })); setErrors([]); setSelectedCase(id); setToast(`${id} created. Review urgency before matching an expert.`); go('case') }
  return <><button className="back-link" onClick={() => go('overview')}><ArrowLeft size={15} /> Back to overview</button><PageHeader title="Ask for help" description="Share the basic facts so a coordinator can review the request." /><section className="panel simulated-draft"><SectionHeading title="Suggested draft" /><div className="simulated-draft-body"><div><span className="simulated-label">SIMULATED ASSISTANT SUGGESTION</span><p>Paste a messy message and Keel will show a deterministic draft for you to review. It never calls a real model, saves a request, sets urgency, or chooses a specialist.</p><textarea value={rawMessage} onChange={e => setRawMessage(e.target.value)} placeholder="Example: Narmada Water Works controls are down, shift team needs a PLC person, call the duty desk..." /></div><button type="button" className="secondary" onClick={suggestFromMessage}>Create suggested draft</button></div>{suggestion && <div className="suggestion-review"><div><span className="simulated-label">SIMULATED ASSISTANT SUGGESTION</span><strong>Review these pre-filled fields</strong><dl className="suggestion-fields"><div><dt>Facility</dt><dd>{state.facilities.find(f => f.id === suggestion.facilityId)?.name}</dd></div><div><dt>Issue</dt><dd>{suggestion.issue}</dd></div><div><dt>Expertise</dt><dd>{suggestion.expertise || 'Not identified'}</dd></div><div><dt>Operating status</dt><dd>{suggestion.operating}</dd></div></dl></div><div className="suggestion-gaps"><strong>Gaps flagged</strong>{suggestionGaps.length ? <ul>{suggestionGaps.map(gap => <li key={gap}>{gap}</li>)}</ul> : <p>No gaps detected by the simple checks. Review all fields anyway.</p>}</div><div className="button-row"><button type="button" className="secondary" onClick={() => setSuggestion(undefined)}>Edit</button><button type="button" className="primary" onClick={confirmSuggestion}>Confirm and use draft</button></div></div>}</section><form className="form-layout" onSubmit={submit}><section className="panel form-section"><SectionHeading title="Facility and contact" /><div className="form-grid"><label>Facility<select disabled={Boolean(facilityScope)} value={form.facilityId} onChange={e => field('facilityId', e.target.value)}>{state.facilities.filter(f => !facilityScope || f.id === facilityScope).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label><label>Reporting person or role<input value={form.contact} onChange={e => field('contact', e.target.value)} placeholder="e.g. shift supervisor" /></label><label>Authorization status<select><option>Authorized facility contact</option><option>Authorization pending</option></select></label><label>Callback method and details<input value={form.callback} onChange={e => field('callback', e.target.value)} placeholder="e.g. wireless relay · channel 4" /></label></div></section><section className="panel form-section"><SectionHeading title="Current situation" /><div className="form-grid"><label className="wide">Main issue<textarea value={form.issue} onChange={e => field('issue', e.target.value)} placeholder="Describe the reported operating problem" /></label><label>Current operating status<select value={form.operating} onChange={e => field('operating', e.target.value)}><option>Operating with constraints</option><option>Reduced capacity</option><option>Operating</option><option>Monitoring</option><option>Unknown</option></select></label><label>Critical expertise needed<input value={form.expertise} onChange={e => field('expertise', e.target.value)} placeholder="e.g. Industrial controls" /></label><label>Is the condition verified?<select value={form.verified} onChange={e => field('verified', e.target.value)}><option>Yes - verified by facility contact</option><option>No - verification required</option><option>Conflicting reports</option></select></label><label>Could stopping a process be dangerous?<select value={form.dangerous} onChange={e => field('dangerous', e.target.value)}><option>Needs review</option><option>Yes - refer to authorized operator</option><option>No immediate concern reported</option></select></label></div></section><section className="panel form-section"><SectionHeading title="Verification and follow-up" /><div className="form-grid"><label>Information confidence<select value={form.confidence} onChange={e => field('confidence', e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></label><label>Next check-in, where known<input value={form.followUp} onChange={e => field('followUp', e.target.value)} placeholder="e.g. Today, 11:30" /></label><label className="wide">What needs to be verified?<textarea value={form.missing} onChange={e => field('missing', e.target.value)} placeholder="List unknowns, conflicting reports, or access details" /></label><label className="wide">Coordinator notes<textarea value={form.notes} onChange={e => field('notes', e.target.value)} placeholder="Optional administrative notes" /></label></div>{errors.length > 0 && <div className="form-errors"><AlertTriangle size={16} /><div><strong>Review the required fields</strong>{errors.map(error => <span key={error}>{error}</span>)}</div></div>}<label className="checkbox"><input type="checkbox" required /> I confirm this is a fictional practice record and not live infrastructure data.</label><div className="form-actions"><button type="button" className="secondary" onClick={() => go('overview')}>Cancel</button><button type="submit" className="primary">Review and create request <ChevronRight size={16} /></button></div></section></form></>
}

export default App

createRoot(document.getElementById('root')!).render(<App />)
