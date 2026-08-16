import { useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Bell, BriefcaseBusiness, CalendarDays, Check, ChevronDown, ChevronRight, ClipboardCheck, Clock3, CloudUpload, FileCheck2, FileHeart, FileText, Filter, HeartHandshake, Inbox, LayoutDashboard, LockKeyhole, Mail, MapPinned, Menu, MoreHorizontal, PanelLeftClose, Phone, Plus, Search, Send, SlidersHorizontal, Sparkles, Stethoscope, UserRound, UsersRound, X } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/error-boundary';
import { Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type View = 'overview' | 'registry' | 'inbox' | 'documents';
type Stage = 'Intake' | 'Pastoral review' | 'Medical review' | 'Committee review' | 'Approved';

type Member = {
  name: string;
  role: 'Brother' | 'Sister';
  memberId: string;
  phone: string;
  email: string;
  occupation: string;
  joinedChurch: string;
  address: string;
  pastor: string;
};

type RecordItem = {
  name: string;
  type: string;
  status: 'Verified' | 'Complete' | 'Review needed' | 'Pending signature' | 'Awaiting upload';
  date: string;
  detail: string;
};

type MedicalRecord = {
  name: string;
  facility: string;
  date: string;
  result: 'Cleared' | 'Awaiting upload' | 'Under review';
  detail: string;
};

type ActivityItem = {
  date: string;
  title: string;
  detail: string;
  actor: string;
};

type Candidate = {
  id: string;
  initials: string;
  names: string;
  city: string;
  region: string;
  group: string;
  district: string;
  stage: Stage;
  progress: number;
  updated: string;
  submitted: string;
  pastor: string;
  phone: string;
  wedding: string;
  note: string;
  members: Member[];
  forms: RecordItem[];
  medical: MedicalRecord[];
  activity: ActivityItem[];
};

type Notice = {
  id: string;
  initials: string;
  sender: string;
  role: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  tone: 'copper' | 'teal' | 'indigo';
};

type CandidateSeed = Omit<Candidate, 'members' | 'forms' | 'medical' | 'activity'>;

function makeMember(name: string, gender: Member['role'], index: number, seed: CandidateSeed): Member {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
  return {
    name,
    role: gender,
    memberId: `${seed.id}-M${index}`,
    phone: index === 1 ? seed.phone : `+234 809 ${String(340 + index * 71).padStart(3, '0')} ${String(1200 + index * 413).slice(-4)}`,
    email: `${slug}@oasorin.demo`,
    occupation: index === 1 ? 'Operations manager' : 'Community health officer',
    joinedChurch: index === 1 ? 'March 2018' : 'September 2020',
    address: `${seed.city} · ${seed.district}`,
    pastor: seed.pastor,
  };
}

function enrichCandidate(seed: CandidateSeed): Candidate {
  const [firstName = 'Brother', secondName = 'Sister'] = seed.names.split('&').map((name) => name.trim());
  const forms: RecordItem[] = [
    { name: 'Marriage application form', type: 'Core intake form', status: 'Complete', date: seed.submitted, detail: 'Submitted by both people in the case' },
    { name: 'Declaration of intent', type: 'Signed form', status: seed.progress > 20 ? 'Complete' : 'Pending signature', date: seed.progress > 20 ? '14 Jun 2024' : 'Awaiting', detail: 'Signed declaration and witness section' },
    { name: 'Pastor reference', type: 'Pastoral record', status: seed.stage === 'Intake' ? 'Review needed' : 'Verified', date: seed.stage === 'Intake' ? 'Awaiting' : '15 Jun 2024', detail: `${seed.pastor} · ${seed.district}` },
    { name: 'Medical screening record', type: 'Protected result', status: seed.stage === 'Intake' ? 'Awaiting upload' : seed.stage === 'Medical review' ? 'Review needed' : 'Verified', date: seed.stage === 'Intake' ? 'Awaiting' : '18 Jun 2024', detail: 'Visible to assigned committee reviewers' },
    { name: 'Witness declaration', type: 'Supporting document', status: seed.progress > 70 ? 'Verified' : 'Review needed', date: seed.progress > 70 ? '16 Jun 2024' : 'Awaiting', detail: 'Two church witnesses linked to the case' },
  ];
  const medical: MedicalRecord[] = [
    { name: firstName, facility: seed.city === 'Lagos' ? 'FaithCare Diagnostics' : 'Redeemer Clinic', date: seed.stage === 'Intake' ? 'Not uploaded' : '17 Jun 2024', result: seed.stage === 'Intake' ? 'Awaiting upload' : seed.stage === 'Medical review' ? 'Under review' : 'Cleared', detail: seed.stage === 'Intake' ? 'Result has not been added yet' : 'Screening record attached to this case' },
    { name: secondName, facility: seed.city === 'Enugu' ? 'New Life Medical Centre' : 'Redeemer Clinic', date: seed.stage === 'Intake' ? 'Not uploaded' : '17 Jun 2024', result: seed.stage === 'Intake' ? 'Awaiting upload' : seed.stage === 'Medical review' ? 'Under review' : 'Cleared', detail: seed.stage === 'Intake' ? 'Result has not been added yet' : 'Screening record attached to this case' },
  ];
  const activity: ActivityItem[] = [
    { date: seed.updated, title: seed.stage === 'Intake' ? 'Case opened in the registry' : `${seed.stage} checkpoint updated`, detail: seed.note, actor: seed.pastor },
    { date: seed.stage === 'Intake' ? 'Awaiting' : '16 Jun 2024', title: 'Pastor reference linked', detail: `Reference received from ${seed.district}.`, actor: seed.pastor },
    { date: seed.stage === 'Intake' ? 'Awaiting' : '14 Jun 2024', title: 'Application reviewed', detail: 'Names, church membership and relationship details checked.', actor: 'Bini East Regional desk' },
    { date: seed.submitted, title: 'Application submitted', detail: 'The initial marriage committee form was received.', actor: `${firstName} & ${secondName}` },
  ];
  return { ...seed, members: [makeMember(firstName, 'Brother', 1, seed), makeMember(secondName, 'Sister', 2, seed)], forms, medical, activity };
}

const initialCandidates: Candidate[] = [
  { id: 'OC-2407', initials: 'AO', names: 'Akinwale & Olufunke', city: 'Ibadan', region: 'South West', group: 'Oyo Group', district: 'Bodija District', stage: 'Committee review', progress: 78, updated: '18 min ago', submitted: '12 Jun 2024', pastor: 'Ps. Daniel Adebayo', phone: '+234 803 442 1980', wedding: '24 Aug 2024', note: 'Reference letters are in. Waiting for the committee secretary to confirm the final interview slot.' },
  { id: 'OC-2398', initials: 'CU', names: 'Chinedu & Uchechi', city: 'Enugu', region: 'South East', group: 'Enugu Group', district: 'Independence District', stage: 'Medical review', progress: 61, updated: '42 min ago', submitted: '08 Jun 2024', pastor: 'Ps. Ifeanyi Nwosu', phone: '+234 806 118 7624', wedding: '31 Aug 2024', note: 'Both results have been uploaded. Pastor confirmation is needed before the case can move forward.' },
  { id: 'OC-2411', initials: 'SA', names: 'Samuel & Amina', city: 'Kaduna', region: 'North West', group: 'Kaduna Group', district: 'Barnawa District', stage: 'Pastoral review', progress: 44, updated: '2 hrs ago', submitted: '14 Jun 2024', pastor: 'Ps. Musa Abdullahi', phone: '+234 809 271 4402', wedding: '07 Sep 2024', note: 'The couple have completed the first counselling conversation with their district pastor.' },
  { id: 'OC-2376', initials: 'TO', names: 'Tomiwa & Olamide', city: 'Lagos', region: 'South West', group: 'Lagos Mainland Group', district: 'Yaba District', stage: 'Approved', progress: 100, updated: 'Yesterday', submitted: '22 May 2024', pastor: 'Ps. Tolu Akinyemi', phone: '+234 802 664 0301', wedding: '17 Aug 2024', note: 'Approved by the statewide marriage committee on 13 Jun 2024.' },
  { id: 'OC-2403', initials: 'NE', names: 'Nneka & Emeka', city: 'Port Harcourt', region: 'South South', group: 'Rivers Group', district: 'Trans Amadi District', stage: 'Intake', progress: 23, updated: 'Yesterday', submitted: '11 Jun 2024', pastor: 'Ps. Grace Okoro', phone: '+234 807 920 1155', wedding: '14 Sep 2024', note: 'Awaiting identity documents and the couple’s signed declaration of intent.' },
  { id: 'OC-2389', initials: 'YK', names: 'Yusuf & Kemi', city: 'Ilorin', region: 'North Central', group: 'Kwara Group', district: 'Tanke District', stage: 'Committee review', progress: 84, updated: '2 days ago', submitted: '03 Jun 2024', pastor: 'Ps. Kemi Balogun', phone: '+234 805 312 7088', wedding: '10 Aug 2024', note: 'Committee review is complete. Final sign-off is scheduled for Thursday morning.' },
  { id: 'OC-2416', initials: 'EO', names: 'Efe & Oghenekaro', city: 'Benin City', region: 'South South', group: 'Edo Group', district: 'GRA District', stage: 'Pastoral review', progress: 48, updated: '3 hrs ago', submitted: '15 Jun 2024', pastor: 'Ps. Osaro Eghosa', phone: '+234 816 409 2281', wedding: '21 Sep 2024', note: 'Their first pastoral conversation is complete. The district is waiting for one witness declaration.' },
  { id: 'OC-2409', initials: 'DA', names: 'David & Abisola', city: 'Abeokuta', region: 'South West', group: 'Ogun Group', district: 'Ibara District', stage: 'Medical review', progress: 67, updated: '4 hrs ago', submitted: '10 Jun 2024', pastor: 'Ps. Kunle Akinola', phone: '+234 803 712 9044', wedding: '28 Sep 2024', note: 'The clinic has uploaded both results. A reviewer is checking the signed report before pastoral clearance.' },
  { id: 'OC-2391', initials: 'MO', names: 'Michael & Oyinade', city: 'Lagos', region: 'South West', group: 'Lagos Island Group', district: 'Ikoyi District', stage: 'Approved', progress: 100, updated: '3 days ago', submitted: '27 May 2024', pastor: 'Ps. Seyi Oladipo', phone: '+234 802 553 6709', wedding: '03 Aug 2024', note: 'Approved and referred to the premarital class coordinator for the final preparation sessions.' },
  { id: 'OC-2418', initials: 'BI', names: 'Bamidele & Ireti', city: 'Akure', region: 'South West', group: 'Ondo Group', district: 'Alagbaka District', stage: 'Intake', progress: 18, updated: 'Today', submitted: '18 Jun 2024', pastor: 'Ps. Yetunde Afolabi', phone: '+234 811 620 5532', wedding: '05 Oct 2024', note: 'New intake record. Identity documents and the first pastoral reference are still outstanding.' },
  { id: 'OC-2401', initials: 'HA', names: 'Hassan & Aisha', city: 'Kano', region: 'North West', group: 'Kano Group', district: 'Nasarawa District', stage: 'Pastoral review', progress: 52, updated: 'Yesterday', submitted: '06 Jun 2024', pastor: 'Ps. Sani Ibrahim', phone: '+234 806 902 1716', wedding: '12 Oct 2024', note: 'A cross-district reference has been requested from the sister’s former local assembly.' },
  { id: 'OC-2394', initials: 'TO', names: 'Tosin & Ope', city: 'Ibadan', region: 'South West', group: 'Oyo Group', district: 'Jericho District', stage: 'Committee review', progress: 91, updated: '4 days ago', submitted: '29 May 2024', pastor: 'Ps. Bisi Adesina', phone: '+234 809 144 8630', wedding: '24 Aug 2024', note: 'All records are complete. The case is on the agenda for the next statewide committee sitting.' },
  { id: 'OC-2384', initials: 'JO', names: 'Joshua & Omowunmi', city: 'Abuja', region: 'FCT', group: 'FCT Group', district: 'Wuse District', stage: 'Medical review', progress: 73, updated: '5 days ago', submitted: '24 May 2024', pastor: 'Ps. Lydia Danjuma', phone: '+234 814 387 4206', wedding: '19 Oct 2024', note: 'Results are present for both people. The committee has requested a clearer scan of the laboratory stamp.' },
  { id: 'OC-2379', initials: 'KO', names: 'Kelechi & Ogechi', city: 'Enugu', region: 'South East', group: 'Enugu Group', district: 'New Haven District', stage: 'Approved', progress: 100, updated: '1 week ago', submitted: '19 May 2024', pastor: 'Ps. Chika Eze', phone: '+234 807 443 6318', wedding: '27 Jul 2024', note: 'Approved. Both pastors have acknowledged the decision in the shared case record.' },
].map(enrichCandidate);

const initialNotices: Notice[] = [
  { id: 'n1', initials: 'IO', sender: 'Ps. Ibrahim Ojo', role: 'Lagos Mainland Group', subject: 'Medical results uploaded for OC-2398', preview: 'Both candidates have completed their screening at Redeemer Clinic. The signed results are attached for review.', time: '9 min ago', unread: true, tone: 'copper' },
  { id: 'n2', initials: 'GO', sender: 'Mrs. Grace Okoro', role: 'South South regional lead', subject: 'Please confirm interview panel', preview: 'Could you confirm whether the Rivers panel is available for the 22 June interview block?', time: '1 hr ago', unread: true, tone: 'teal' },
  { id: 'n3', initials: 'TA', sender: 'Ps. Tolu Akinyemi', role: 'Lagos Mainland Group', subject: 'OC-2376 approved', preview: 'Thank you for the careful review. The couple have been informed and will proceed to premarital classes.', time: 'Yesterday', unread: false, tone: 'indigo' },
  { id: 'n4', initials: 'MA', sender: 'Ps. Musa Abdullahi', role: 'Kaduna Group', subject: 'A question about the declaration form', preview: 'The couple have asked whether the witness section may be completed by an elder from another district.', time: 'Yesterday', unread: false, tone: 'teal' },
];

const regionData = [
  { name: 'South West', code: 'SW', count: 18, change: '+4 this month', tint: 'bg-[#e8b86a]', line: 'bg-[#c78642]' },
  { name: 'South East', code: 'SE', count: 11, change: '+2 this month', tint: 'bg-[#8fc1ae]', line: 'bg-[#3e897b]' },
  { name: 'North West', code: 'NW', count: 9, change: 'steady', tint: 'bg-[#b6adc8]', line: 'bg-[#716589]' },
  { name: 'North Central', code: 'NC', count: 7, change: '+1 this month', tint: 'bg-[#d7aa91]', line: 'bg-[#ad6e56]' },
  { name: 'South South', code: 'SS', count: 6, change: 'steady', tint: 'bg-[#a9b9cf]', line: 'bg-[#5f7797]' },
  { name: 'North East', code: 'NE', count: 4, change: '+1 this month', tint: 'bg-[#d2c17b]', line: 'bg-[#a18f42]' },
  { name: 'FCT', code: 'FCT', count: 3, change: 'new pilot', tint: 'bg-[#d8a9bd]', line: 'bg-[#9f5d7a]' },
];

const stageColors: Record<Stage, string> = {
  Intake: 'bg-[#f3ead5] text-[#956b31]',
  'Pastoral review': 'bg-[#e3eee9] text-[#397463]',
  'Medical review': 'bg-[#e3e9f2] text-[#52647d]',
  'Committee review': 'bg-[#eee6f1] text-[#765579]',
  Approved: 'bg-[#e1f0e8] text-[#32705c]',
};

function Avatar({ initials, size = 'md', tone = 'indigo' }: { initials: string; size?: 'sm' | 'md' | 'lg'; tone?: 'indigo' | 'copper' | 'teal' }) {
  const tones = { indigo: 'bg-[#d9deed] text-[#36466f]', copper: 'bg-[#f1d6b6] text-[#945c32]', teal: 'bg-[#cce4d9] text-[#397665]' };
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${tones[tone]} ${size === 'sm' ? 'h-8 w-8 text-[11px]' : size === 'lg' ? 'h-16 w-16 text-lg' : 'h-10 w-10 text-xs'}`} data-testid={`avatar-${initials}`}>{initials}</span>;
}

function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'green' | 'orange' | 'blue' }) {
  const styles = { neutral: 'bg-[#eeeae2] text-[#666158]', green: 'bg-[#e1f0e8] text-[#32705c]', orange: 'bg-[#f3ead5] text-[#956b31]', blue: 'bg-[#e5e9f2] text-[#52647d]' };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[tone]}`}>{children}</span>;
}

function ProgressBar({ value, color = 'bg-[#c78642]' }: { value: number; color?: string }) {
  return <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ebe7df]" aria-label={`${value}% complete`}><div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} /></div>;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#928b7e]">{children}</p>;
}

function AppShell() {
  const [view, setView] = useState<View>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [registryStage, setRegistryStage] = useState<'All' | Stage>('All');
  const [regionFilter, setRegionFilter] = useState('All regions');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [notices, setNotices] = useState(initialNotices);
  const [showNewCase, setShowNewCase] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [toast, setToast] = useState('');
  const [newCase, setNewCase] = useState({ names: '', city: '', region: 'South West', pastor: '' });

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  };

  const filteredCandidates = useMemo(() => candidates.filter((candidate) => {
     const searchablePeople = candidate.members.map((member) => `${member.name} ${member.memberId} ${member.phone} ${member.email} ${member.occupation}`).join(' ');
     const matchesSearch = `${candidate.names} ${candidate.id} ${candidate.city} ${candidate.pastor} ${candidate.group} ${candidate.district} ${searchablePeople}`.toLowerCase().includes(search.toLowerCase());
    const matchesStage = registryStage === 'All' || candidate.stage === registryStage;
    const matchesRegion = regionFilter === 'All regions' || candidate.region === regionFilter;
    return matchesSearch && matchesStage && matchesRegion;
  }), [candidates, search, registryStage, regionFilter]);

  const unreadCount = notices.filter((notice) => notice.unread).length;
  const go = (next: View) => {
    setView(next);
    setSidebarOpen(false);
    setSelectedCandidate(null);
  };

  const createCase = () => {
    if (!newCase.names.trim() || !newCase.city.trim()) {
      showToast('Add the couple’s names and city to start the case.');
      return;
    }
    const [first = 'N', second = 'C'] = newCase.names.split('&').map((name) => name.trim());
    const created = enrichCandidate({
      id: `OC-${2415 + candidates.length}`,
      initials: `${first.charAt(0)}${second.charAt(0)}`,
      names: newCase.names,
      city: newCase.city,
      region: newCase.region,
      group: `${newCase.city} Group`,
      district: 'District to be assigned',
      stage: 'Intake',
      progress: 12,
      updated: 'Just now',
      submitted: '18 Jun 2024',
      pastor: newCase.pastor || 'Pastor to be assigned',
      phone: 'Not yet provided',
      wedding: 'Date to be confirmed',
      note: 'New case created in the local pilot workspace. Documents and pastoral references are still outstanding.',
    });
    setCandidates((current) => [created, ...current]);
    setShowNewCase(false);
    setNewCase({ names: '', city: '', region: 'South West', pastor: '' });
    showToast(`${newCase.names} has been added to the intake queue.`);
    setView('registry');
  };

  const markRead = (id: string) => {
    setNotices((current) => current.map((notice) => notice.id === id ? { ...notice, unread: false } : notice));
  };

  return (
    <div className="min-h-[100dvh] bg-[#f4f1ea] text-[#292b3f]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col bg-[#252b4a] text-[#f8f5eb] transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <button className="flex items-center gap-3 text-left" onClick={() => go('overview')} data-testid="button-brand-home">
            <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#e7b866] text-[#252b4a]"><HeartHandshake size={20} strokeWidth={2.5} /></span>
            <span><span className="block font-display text-[23px] leading-none">Oasorin</span><span className="mt-1 block text-[9px] font-bold uppercase tracking-[.2em] text-[#b9bfd6]">Church registry</span></span>
          </button>
          <button className="rounded-lg p-1 text-[#b9bfd6] hover:bg-white/10 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu" data-testid="button-close-menu"><X size={18} /></button>
        </div>
        <div className="mx-5 mt-7 rounded-xl border border-[#d1aa68]/25 bg-[#31395e] p-3.5">
           <div className="flex items-start gap-2.5"><MapPinned size={17} className="mt-0.5 text-[#e7b866]" /><div><p className="text-[11px] font-semibold">Bini East Region</p><p className="mt-1 text-[10px] leading-relaxed text-[#b9bfd6]">Main church registry · demo data</p></div></div>
        </div>
        <nav className="mt-8 space-y-1 px-3" aria-label="Primary navigation">
          {[
            { id: 'overview' as View, label: 'Overview', icon: LayoutDashboard },
            { id: 'registry' as View, label: 'Candidate registry', icon: UsersRound, count: candidates.length },
            { id: 'inbox' as View, label: 'Pastor inbox', icon: Inbox, count: unreadCount },
            { id: 'documents' as View, label: 'Forms & documents', icon: FileText },
          ].map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => go(id)} className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm ${view === id ? 'bg-[#e7b866] font-semibold text-[#252b4a]' : 'text-[#c3c8db] hover:bg-white/10 hover:text-[#f8f5eb]'}`} data-testid={`nav-${id}`}>
              <span className="flex items-center gap-3"><Icon size={17} strokeWidth={view === id ? 2.5 : 1.8} /><span>{label}</span></span>
              {count ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${view === id ? 'bg-[#252b4a] text-[#e7b866]' : 'bg-white/10 text-[#e7b866]'}`}>{count}</span> : null}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 px-5 py-5">
          <p className="mb-3 text-[9px] font-bold uppercase tracking-[.2em] text-[#8992b4]">At a glance</p>
          <div className="flex items-center justify-between text-xs"><span className="text-[#b9bfd6]">Active cases</span><span className="font-mono-app text-[#f8f5eb]">58</span></div>
          <div className="mt-2 flex items-center justify-between text-xs"><span className="text-[#b9bfd6]">Last synced</span><span className="text-[#e7b866]">Just now</span></div>
          <button className="mt-6 flex items-center gap-2 text-[11px] text-[#b9bfd6] hover:text-white" onClick={() => showToast('Privacy controls are managed by the statewide coordinator.')} data-testid="button-privacy-info"><LockKeyhole size={13} />Privacy & access</button>
        </div>
      </aside>

      {sidebarOpen && <button className="fixed inset-0 z-30 bg-[#252b4a]/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" data-testid="button-overlay-menu" />}

      <div className="lg:pl-[256px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#dfd9ce] bg-[#f4f1ea]/90 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-[#dfd9ce] bg-[#faf8f3] p-2.5 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu" data-testid="button-open-menu"><Menu size={18} /></button>
             <div className="hidden items-center gap-2 text-xs text-[#777167] sm:flex"><span>Oasorin Church</span><ChevronRight size={13} /><span className="font-semibold text-[#292b3f]">Bini Region</span><ChevronRight size={13} /><span className="font-semibold text-[#292b3f]">Bini East</span></div>
          </div>
          <div className="flex items-center gap-3">
             <label className="relative hidden w-[min(34vw,330px)] md:block"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999184]" /><input value={search} onChange={(event) => { setSearch(event.target.value); if (view !== 'registry') setView('registry'); }} placeholder="Search any person or case..." className="h-10 w-full rounded-xl border border-[#dfd9ce] bg-[#faf8f3] pl-9 pr-3 text-xs text-[#292b3f] placeholder:text-[#aaa297] focus:border-[#397665] focus:outline-none" aria-label="Search the statewide registry" data-testid="input-global-registry-search" /></label>
            <button onClick={() => go('inbox')} className="relative rounded-xl p-2.5 text-[#666158] hover:bg-[#eae5dc]" aria-label="Open inbox" data-testid="button-header-inbox"><Bell size={18} strokeWidth={1.8} />{unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#c78642] ring-2 ring-[#f4f1ea]" />}</button>
            <div className="hidden h-7 w-px bg-[#dfd9ce] sm:block" />
             <button className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 hover:bg-[#eae5dc]" onClick={() => showToast('This is the shared Bini East Region church registry.')} data-testid="button-user-menu"><Avatar initials="BE" size="sm" tone="copper" /><span className="hidden text-left sm:block"><span className="block text-xs font-semibold">Bini East Region</span><span className="block text-[10px] text-[#837b70]">Regional marriage desk</span></span><ChevronDown size={14} className="text-[#837b70]" /></button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9">
          {view === 'overview' && <Overview onNavigate={go} onNewCase={() => setShowNewCase(true)} onSelect={setSelectedCandidate} candidates={candidates} />}
          {view === 'registry' && <Registry search={search} setSearch={setSearch} registryStage={registryStage} setRegistryStage={setRegistryStage} regionFilter={regionFilter} setRegionFilter={setRegionFilter} candidates={filteredCandidates} total={candidates.length} onSelect={setSelectedCandidate} onNewCase={() => setShowNewCase(true)} />}
          {view === 'inbox' && <InboxView notices={notices} onRead={markRead} onCompose={() => setShowCompose(true)} />}
          {view === 'documents' && <Documents onUpload={() => setShowUpload(true)} onToast={showToast} />}
        </main>
      </div>

      {selectedCandidate && <CandidateDrawer candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} onToast={showToast} />}
      {showNewCase && <NewCaseModal form={newCase} setForm={setNewCase} onClose={() => setShowNewCase(false)} onCreate={createCase} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={() => { setShowUpload(false); showToast('Document added to the local demo workspace.'); }} />}
      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} onSend={() => { setShowCompose(false); showToast('Message sent to the selected pastor.'); }} />}
      {toast && <div className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#252b4a] px-4 py-3 text-sm font-medium text-[#f8f5eb] shadow-2xl animate-rise-in" role="status" data-testid="toast-feedback"><Check size={16} className="text-[#e7b866]" />{toast}</div>}
    </div>
  );
}

function Overview({ onNavigate, onNewCase, onSelect, candidates }: { onNavigate: (view: View) => void; onNewCase: () => void; onSelect: (candidate: Candidate) => void; candidates: Candidate[] }) {
  const attention = candidates.filter((candidate) => candidate.stage !== 'Approved').slice(0, 4);
  return <div className="space-y-8">
    <div className="animate-rise-in flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="mb-3 text-[11px] font-bold uppercase tracking-[.22em] text-[#b4783f]">Bini Region · shared registry</p><h1 className="font-display text-[clamp(2.8rem,5vw,4.6rem)] leading-[.9] tracking-[-.03em] text-[#252b4a]">People in<br /><em className="text-[#b4783f]">our care.</em></h1><p className="mt-5 max-w-[520px] text-sm leading-relaxed text-[#6d685f]">A single church-wide view of every person and marriage case, with the forms, results and pastoral history needed at each step.</p></div>
      <button onClick={onNewCase} className="group flex w-fit items-center gap-2.5 rounded-xl bg-[#252b4a] px-4 py-3 text-sm font-semibold text-[#f8f5eb] shadow-[0_8px_18px_rgba(37,43,74,.14)] hover:-translate-y-0.5 hover:bg-[#30385e]" data-testid="button-start-new-case"><Plus size={17} /><span>Start a new marriage case</span><ChevronRight size={15} className="ml-1 text-[#e7b866] transition-transform group-hover:translate-x-0.5" /></button>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label: 'Active marriage cases', value: '58', detail: 'across 7 regions', icon: BriefcaseBusiness, accent: 'text-[#b4783f]', bg: 'bg-[#fbf3e5]' },
        { label: 'Need attention', value: '12', detail: '3 due today', icon: Clock3, accent: 'text-[#397665]', bg: 'bg-[#e8f1ec]' },
        { label: 'Ready for committee', value: '06', detail: 'next sitting · 20 Jun', icon: ClipboardCheck, accent: 'text-[#6e5880]', bg: 'bg-[#eee9f1]' },
        { label: 'Approved this month', value: '09', detail: '+2 from May', icon: FileCheck2, accent: 'text-[#52647d]', bg: 'bg-[#e8ecf2]' },
      ].map(({ label, value, detail, icon: Icon, accent, bg }, index) => <div key={label} className={`animate-rise-in rounded-2xl border border-[#dfd9ce] bg-[#faf8f3] p-5 delay-${index + 1}`} data-testid={`metric-${index}`}><div className="flex items-start justify-between"><p className="max-w-[150px] text-xs font-medium leading-relaxed text-[#777167]">{label}</p><span className={`grid h-8 w-8 place-items-center rounded-lg ${bg} ${accent}`}><Icon size={16} /></span></div><p className="mt-5 font-display text-4xl text-[#252b4a]">{value}</p><p className="mt-1 text-[11px] text-[#938b7e]">{detail}</p></div>)}
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
       <section className="overflow-hidden rounded-2xl border border-[#dfd9ce] bg-[#faf8f3] animate-rise-in delay-2">
         <div className="flex items-center justify-between border-b border-[#e8e2d8] px-5 py-5 sm:px-6"><div><SectionLabel>Work queue</SectionLabel><h2 className="font-display text-2xl text-[#252b4a]">Cases needing a hand</h2></div><button onClick={() => onNavigate('registry')} className="flex items-center gap-1 text-xs font-semibold text-[#397665] hover:text-[#252b4a]" data-testid="button-view-all-cases">View all <ChevronRight size={14} /></button></div>
        <div className="divide-y divide-[#e8e2d8]">{attention.map((candidate) => <button key={candidate.id} onClick={() => onSelect(candidate)} className="group flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-[#f3efe7] sm:px-6" data-testid={`button-open-case-${candidate.id}`}><Avatar initials={candidate.initials} size="sm" tone={candidate.stage === 'Medical review' ? 'teal' : candidate.stage === 'Committee review' ? 'copper' : 'indigo'} /><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="truncate text-sm font-semibold text-[#39394b]">{candidate.names}</span><Badge tone={candidate.stage === 'Medical review' ? 'blue' : candidate.stage === 'Committee review' ? 'orange' : 'neutral'}>{candidate.stage}</Badge></span><span className="mt-1 block text-[11px] text-[#938b7e]">{candidate.id} · {candidate.region} · updated {candidate.updated}</span></span><span className="hidden w-24 sm:block"><ProgressBar value={candidate.progress} /><span className="mt-1 block text-right font-mono-app text-[10px] text-[#938b7e]">{candidate.progress}%</span></span><ChevronRight size={16} className="text-[#b5aea3] transition-transform group-hover:translate-x-1" /></button>)}</div>
      </section>
      <section className="rounded-2xl border border-[#dfd9ce] bg-[#252b4a] p-5 text-[#f8f5eb] animate-rise-in delay-3 sm:p-6"><div className="flex items-start justify-between"><div><SectionLabel>Across the state</SectionLabel><h2 className="font-display text-2xl">Regional pulse</h2></div><span className="rounded-full bg-[#394263] px-2.5 py-1 text-[10px] font-semibold text-[#e7b866]">Live pilot</span></div><div className="mt-6 space-y-3">{regionData.map((region) => <div key={region.code} className="flex items-center gap-3"><span className={`grid h-7 w-7 place-items-center rounded-lg text-[9px] font-bold text-[#252b4a] ${region.tint}`}>{region.code}</span><span className="min-w-0 flex-1"><span className="flex justify-between text-xs"><span className="text-[#d9dbe5]">{region.name}</span><span className="font-mono-app text-[#f8f5eb]">{region.count}</span></span><span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/10"><span className={`block h-full rounded-full ${region.line}`} style={{ width: `${Math.max(region.count * 3, 9)}%` }} /></span></span></div>)}</div><div className="mt-6 border-t border-white/10 pt-4 text-[11px] text-[#aeb4cb]"><span className="font-semibold text-[#e7b866]">58 active cases</span> are being cared for by 42 pastors.</div></section>
    </div>
     <div className="grid gap-5 md:grid-cols-3">
      <div className="rounded-2xl border border-[#dfd9ce] bg-[#e9f1ed] p-5 md:col-span-2"><div className="flex items-start gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#397665] text-[#eef6f1]"><Sparkles size={18} /></span><div><SectionLabel>Coordinator note</SectionLabel><p className="max-w-2xl text-sm leading-relaxed text-[#3b5e54]">“The aim is not to move paper faster. It is to make sure no couple is carrying the process alone.”</p><p className="mt-3 text-[11px] font-semibold text-[#648378]">— Statewide marriage committee, June sitting</p></div></div></div>
      <button onClick={() => onNavigate('documents')} className="group rounded-2xl border border-[#dfd9ce] bg-[#faf8f3] p-5 text-left hover:-translate-y-0.5 hover:border-[#c9bfae]" data-testid="button-open-documents-card"><SectionLabel>Shared library</SectionLabel><div className="flex items-end justify-between"><div><p className="font-display text-3xl text-[#252b4a]">24</p><p className="mt-1 text-xs text-[#777167]">forms & templates</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f3ead5] text-[#956b31] transition-transform group-hover:translate-x-1"><ChevronRight size={17} /></span></div></button>
    </div>
     <button onClick={() => onNavigate('registry')} className="group flex flex-col gap-4 rounded-2xl border border-[#dfd9ce] bg-[#252b4a] p-5 text-left text-[#f8f5eb] shadow-[0_10px_24px_rgba(37,43,74,.12)] hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between sm:p-6" data-testid="button-search-registry-cta">
       <span><SectionLabel>Find someone in the registry</SectionLabel><span className="block font-display text-2xl">Search the Bini Region records</span><span className="mt-1 block text-xs text-[#b9bfd6]">Open any person or couple to see their forms, results, pastors and case history.</span></span>
       <span className="flex shrink-0 items-center gap-2 rounded-xl bg-[#e7b866] px-4 py-3 text-xs font-bold text-[#252b4a]">Open registry <Search size={15} /></span>
     </button>
  </div>;
}

function Registry({ search, setSearch, registryStage, setRegistryStage, regionFilter, setRegionFilter, candidates, total, onSelect, onNewCase }: { search: string; setSearch: (value: string) => void; registryStage: 'All' | Stage; setRegistryStage: (value: 'All' | Stage) => void; regionFilter: string; setRegionFilter: (value: string) => void; candidates: Candidate[]; total: number; onSelect: (candidate: Candidate) => void; onNewCase: () => void }) {
  const stages: ('All' | Stage)[] = ['All', 'Intake', 'Pastoral review', 'Medical review', 'Committee review', 'Approved'];
  return <div className="space-y-7">
     <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><SectionLabel>Bini Region · people registry</SectionLabel><h1 className="font-display text-4xl tracking-[-.02em] text-[#252b4a] sm:text-5xl">People <span className="text-[#b4783f]">in care.</span></h1><p className="mt-3 text-sm text-[#777167]">Search any name to open the full record: forms, results, church structure and pastoral history.</p></div><button onClick={onNewCase} className="flex w-fit items-center gap-2 rounded-xl bg-[#252b4a] px-4 py-3 text-sm font-semibold text-[#f8f5eb] hover:bg-[#30385e]" data-testid="button-registry-new-case"><Plus size={17} />New marriage case</button></div>
     <div className="flex flex-col gap-3 rounded-2xl border border-[#dfd9ce] bg-[#faf8f3] p-3 sm:flex-row"><label className="relative flex-1"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999184]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search any person, case ID, city, phone or pastor" className="h-11 w-full rounded-xl border border-[#e2dcd2] bg-[#f5f1e9] pl-10 pr-4 text-sm text-[#292b3f] placeholder:text-[#aaa297] focus:border-[#397665] focus:bg-[#faf8f3] focus:outline-none" data-testid="input-search-candidates" /></label><div className="flex items-center gap-2"><Filter size={16} className="ml-2 text-[#8d857a]" /><select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)} className="h-11 rounded-xl border border-[#e2dcd2] bg-[#f5f1e9] px-3 text-xs font-semibold text-[#514e48] focus:border-[#397665] focus:outline-none" data-testid="select-region-filter"><option>All regions</option>{regionData.map((region) => <option key={region.name}>{region.name}</option>)}</select></div></div>
    <div className="flex items-center gap-2 overflow-x-auto pb-1">{stages.map((stage) => <button key={stage} onClick={() => setRegistryStage(stage)} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold ${registryStage === stage ? 'bg-[#252b4a] text-[#f8f5eb]' : 'bg-[#ebe7df] text-[#777167] hover:bg-[#e0dbd1]'}`} data-testid={`filter-stage-${stage.toLowerCase().replaceAll(' ', '-')}`}>{stage}{stage === 'All' && <span className="ml-1.5 opacity-60">{total}</span>}</button>)}</div>
    {candidates.length > 0 ? <div className="overflow-hidden rounded-2xl border border-[#dfd9ce] bg-[#faf8f3]"><div className="hidden grid-cols-[1.6fr_1fr_.9fr_1fr_24px] gap-4 border-b border-[#e8e2d8] px-5 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#9b9387] md:grid"><span>Candidate</span><span>Church structure</span><span>Stage</span><span>Progress</span><span /></div><div className="divide-y divide-[#e8e2d8]">{candidates.map((candidate, index) => <button key={candidate.id} onClick={() => onSelect(candidate)} className="grid w-full grid-cols-1 items-center gap-3 px-5 py-4 text-left animate-rise-in hover:bg-[#f3efe7] md:grid-cols-[1.6fr_1fr_.9fr_1fr_24px] md:gap-4" style={{ animationDelay: `${index * 45}ms` }} data-testid={`row-candidate-${candidate.id}`}><span className="flex items-center gap-3"><Avatar initials={candidate.initials} size="sm" tone={index % 3 === 0 ? 'copper' : index % 3 === 1 ? 'teal' : 'indigo'} /><span><span className="block text-sm font-semibold text-[#39394b]">{candidate.names}</span><span className="mt-0.5 block font-mono-app text-[10px] text-[#9a9286]">{candidate.id} · {candidate.city}</span></span></span><span className="pl-11 text-xs text-[#777167] md:pl-0"><span className="block">{candidate.region}</span><span className="mt-0.5 block text-[10px] text-[#a29b90]">{candidate.group}</span></span><span className="pl-11 md:pl-0"><Badge tone={candidate.stage === 'Approved' ? 'green' : candidate.stage === 'Medical review' ? 'blue' : candidate.stage === 'Committee review' ? 'orange' : 'neutral'}>{candidate.stage}</Badge></span><span className="pl-11 md:pl-0"><span className="mb-1 flex justify-between text-[10px] text-[#91897d]"><span>completion</span><span className="font-mono-app">{candidate.progress}%</span></span><ProgressBar value={candidate.progress} color={candidate.stage === 'Approved' ? 'bg-[#397665]' : 'bg-[#c78642]'} /></span><ChevronRight size={16} className="hidden text-[#b5aea3] md:block" /></button>)}</div></div> : <div className="rounded-2xl border border-dashed border-[#cfc7b9] bg-[#faf8f3] px-6 py-16 text-center animate-soft-in"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f1ed] text-[#397665]"><Search size={20} /></span><h3 className="mt-4 font-display text-2xl text-[#252b4a]">No cases match this view</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#888075]">Try a different name, region, or stage. The registry keeps every case, even when the queue is quiet.</p><button onClick={() => { setSearch(''); setRegionFilter('All regions'); setRegistryStage('All'); }} className="mt-5 text-xs font-bold text-[#397665] underline underline-offset-4" data-testid="button-clear-registry-filters">Clear filters</button></div>}
  </div>;
}

function InboxView({ notices, onRead, onCompose }: { notices: Notice[]; onRead: (id: string) => void; onCompose: () => void }) {
  return <div className="space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><SectionLabel>Pastor-to-pastor</SectionLabel><h1 className="font-display text-4xl tracking-[-.02em] text-[#252b4a] sm:text-5xl">A clear line <span className="text-[#397665]">of care.</span></h1><p className="mt-3 text-sm text-[#777167]">Keep small, timely decisions from getting lost between regions and districts.</p></div><button onClick={onCompose} className="flex w-fit items-center gap-2 rounded-xl bg-[#252b4a] px-4 py-3 text-sm font-semibold text-[#f8f5eb] hover:bg-[#30385e]" data-testid="button-compose-message"><Send size={16} />Compose message</button></div>
    <div className="grid gap-5 xl:grid-cols-[1.4fr_.6fr]">
      <section className="overflow-hidden rounded-2xl border border-[#dfd9ce] bg-[#faf8f3]"><div className="flex items-center justify-between border-b border-[#e8e2d8] px-5 py-4"><div className="flex items-center gap-3"><span className="text-sm font-semibold text-[#39394b]">Inbox</span><Badge tone="orange">{notices.filter((notice) => notice.unread).length} unread</Badge></div><button onClick={() => notices.forEach((notice) => onRead(notice.id))} className="text-xs font-semibold text-[#397665] hover:text-[#252b4a]" data-testid="button-mark-all-read">Mark all read</button></div><div className="divide-y divide-[#e8e2d8]">{notices.map((notice) => <button key={notice.id} onClick={() => onRead(notice.id)} className={`flex w-full gap-3 px-5 py-5 text-left hover:bg-[#f3efe7] ${notice.unread ? 'bg-[#fdf9f0]' : ''}`} data-testid={`message-${notice.id}`}><Avatar initials={notice.initials} size="sm" tone={notice.tone === 'copper' ? 'copper' : notice.tone === 'teal' ? 'teal' : 'indigo'} /><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className={`truncate text-sm ${notice.unread ? 'font-bold text-[#292b3f]' : 'font-semibold text-[#57534c]'}`}>{notice.sender}</span>{notice.unread && <span className="h-1.5 w-1.5 rounded-full bg-[#c78642]" />}</span><span className="mt-1 block text-[10px] text-[#91897d]">{notice.role} · {notice.time}</span><span className="mt-3 block text-sm font-semibold text-[#45414a]">{notice.subject}</span><span className="mt-1 block max-w-xl truncate text-xs leading-relaxed text-[#847d72]">{notice.preview}</span></span><MoreHorizontal size={17} className="shrink-0 text-[#b5aea3]" /></button>)}</div></section>
      <aside className="rounded-2xl border border-[#dfd9ce] bg-[#e9f1ed] p-6"><SectionLabel>Communication rhythm</SectionLabel><h2 className="font-display text-3xl text-[#2f5148]">Small notes,<br />stronger care.</h2><p className="mt-4 text-sm leading-relaxed text-[#537268]">Pastors in the same case can see one another’s messages. Keep health records and sensitive details in the protected case record instead.</p><div className="mt-8 space-y-4 border-t border-[#c9ded3] pt-5"><div className="flex items-center justify-between text-xs"><span className="text-[#668277]">Response time this week</span><span className="font-mono-app font-bold text-[#2f5148]">3h 18m</span></div><div className="flex items-center justify-between text-xs"><span className="text-[#668277]">Pastors connected</span><span className="font-mono-app font-bold text-[#2f5148]">42</span></div></div><button onClick={onCompose} className="mt-7 flex items-center gap-2 text-xs font-bold text-[#397665] hover:text-[#252b4a]" data-testid="button-send-note-card"><Mail size={15} />Send a quick note <ChevronRight size={14} /></button></aside>
    </div>
  </div>;
}

function Documents({ onUpload, onToast }: { onUpload: () => void; onToast: (message: string) => void }) {
  const [tab, setTab] = useState<'documents' | 'forms'>('documents');
  const docs = [{ name: 'Medical screening · Akinwale & Olufunke', type: 'Medical result', owner: 'Bodija District', date: '18 Jun 2024', status: 'Verified', icon: ClipboardCheck }, { name: 'Pastor reference · Yusuf & Kemi', type: 'Supporting document', owner: 'Tanke District', date: '17 Jun 2024', status: 'Review needed', icon: FileText }, { name: 'Declaration of intent · Nneka & Emeka', type: 'Signed form', owner: 'Trans Amadi District', date: '16 Jun 2024', status: 'Pending signature', icon: FileText }, { name: 'Medical screening · Chinedu & Uchechi', type: 'Medical result', owner: 'Independence District', date: '15 Jun 2024', status: 'Verified', icon: ClipboardCheck }];
  const forms = [{ title: 'Marriage application form', desc: 'The first shared intake record for every couple.', count: '58 submissions', color: 'bg-[#f3ead5]' }, { title: 'Declaration of intent', desc: 'Signed by both candidates and their witnesses.', count: '51 submissions', color: 'bg-[#e8f1ec]' }, { title: 'Pastor reference', desc: 'A quiet, honest picture of pastoral readiness.', count: '46 submissions', color: 'bg-[#e8ecf2]' }, { title: 'Medical screening record', desc: 'Protected results, visible only to assigned reviewers.', count: '39 submissions', color: 'bg-[#eee9f1]' }];
  return <div className="space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><SectionLabel>Case library</SectionLabel><h1 className="font-display text-4xl tracking-[-.02em] text-[#252b4a] sm:text-5xl">Forms & <span className="text-[#b4783f]">documents.</span></h1><p className="mt-3 text-sm text-[#777167]">The shared paperwork, with a little more visibility and a lot less chasing.</p></div><button onClick={onUpload} className="flex w-fit items-center gap-2 rounded-xl bg-[#252b4a] px-4 py-3 text-sm font-semibold text-[#f8f5eb] hover:bg-[#30385e]" data-testid="button-upload-document"><CloudUpload size={16} />Add document</button></div>
    <div className="flex gap-6 border-b border-[#dfd9ce]"><button onClick={() => setTab('documents')} className={`border-b-2 pb-3 text-sm font-semibold ${tab === 'documents' ? 'border-[#b4783f] text-[#252b4a]' : 'border-transparent text-[#928b7e]'}`} data-testid="tab-documents">Recent documents <span className="ml-1 text-[10px] opacity-60">24</span></button><button onClick={() => setTab('forms')} className={`border-b-2 pb-3 text-sm font-semibold ${tab === 'forms' ? 'border-[#b4783f] text-[#252b4a]' : 'border-transparent text-[#928b7e]'}`} data-testid="tab-forms">Forms & templates <span className="ml-1 text-[10px] opacity-60">4</span></button></div>
    {tab === 'documents' ? <section className="overflow-hidden rounded-2xl border border-[#dfd9ce] bg-[#faf8f3]"><div className="flex items-center justify-between border-b border-[#e8e2d8] px-5 py-4"><span className="text-sm font-semibold text-[#39394b]">Recent uploads</span><button onClick={() => onToast('Document filters are ready for the next pilot release.')} className="flex items-center gap-2 text-xs font-semibold text-[#777167] hover:text-[#252b4a]" data-testid="button-document-filter"><SlidersHorizontal size={14} />Filter</button></div><div className="divide-y divide-[#e8e2d8]">{docs.map((doc, index) => { const Icon = doc.icon; return <button key={doc.name} onClick={() => onToast(`${doc.name} opened in the local preview.`)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-[#f3efe7]" data-testid={`document-row-${index}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eee9df] text-[#6f685e]"><Icon size={16} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#48444b]">{doc.name}</span><span className="mt-1 block text-[11px] text-[#928b7e]">{doc.type} · {doc.owner}</span></span><span className="hidden text-right sm:block"><span className="block text-xs text-[#777167]">{doc.date}</span><Badge tone={doc.status === 'Verified' ? 'green' : 'orange'}>{doc.status}</Badge></span><ChevronRight size={16} className="text-[#b5aea3]" /></button> })}</div></section> : <div className="grid gap-4 md:grid-cols-2">{forms.map((form, index) => <button key={form.title} onClick={() => onToast(`${form.title} is ready to use in a new case.`)} className={`group rounded-2xl border border-[#dfd9ce] ${form.color} p-6 text-left hover:-translate-y-0.5`} data-testid={`form-template-${index}`}><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#faf8f3]/70 text-[#57534c]"><FileText size={18} /></span><ChevronRight size={17} className="text-[#9c9387] transition-transform group-hover:translate-x-1" /></div><h2 className="mt-7 font-display text-2xl text-[#34364a]">{form.title}</h2><p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6f6b63]">{form.desc}</p><p className="mt-5 text-[11px] font-bold uppercase tracking-[.12em] text-[#888075]">{form.count}</p></button>)}</div>}
  </div>;
}

function CandidateDrawer({ candidate, onClose, onToast }: { candidate: Candidate; onClose: () => void; onToast: (message: string) => void }) {
  const steps = ['Intake', 'Pastoral review', 'Medical review', 'Committee review', 'Approved'];
  const activeIndex = steps.indexOf(candidate.stage);
  const recordStatus = (status: RecordItem['status']) => status === 'Verified' || status === 'Complete'
    ? 'bg-[#e1f0e8] text-[#32705c]'
    : status === 'Review needed'
      ? 'bg-[#f3ead5] text-[#956b31]'
      : 'bg-[#eee9f1] text-[#765579]';
  return <>
    <button className="fixed inset-0 z-50 bg-[#252b4a]/35 backdrop-blur-[2px]" onClick={onClose} aria-label="Close person detail" data-testid="button-close-candidate-backdrop" />
    <aside className="fixed inset-y-0 right-0 z-[55] flex w-full max-w-[620px] flex-col overflow-y-auto bg-[#faf8f3] shadow-2xl animate-soft-in">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e1dbd1] bg-[#faf8f3]/95 px-5 py-4 backdrop-blur sm:px-7">
        <button onClick={onClose} className="flex items-center gap-2 text-xs font-semibold text-[#777167] hover:text-[#252b4a]" data-testid="button-close-candidate"><PanelLeftClose size={17} />Back to registry</button>
        <button onClick={() => onToast('More case actions will be available to the church registry team.')} className="rounded-lg p-2 text-[#777167] hover:bg-[#eee9df]" aria-label="More case actions" data-testid="button-candidate-more"><MoreHorizontal size={18} /></button>
      </div>
      <div className="px-5 py-7 sm:px-7">
        <div className="flex items-start gap-4">
          <Avatar initials={candidate.initials} size="lg" tone="copper" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><span className="font-mono-app text-[10px] font-bold tracking-wide text-[#a2784b]">{candidate.id}</span><Badge tone={candidate.stage === 'Approved' ? 'green' : 'orange'}>{candidate.stage}</Badge></div>
            <h2 className="mt-2 font-display text-4xl leading-none text-[#252b4a]">{candidate.names}</h2>
            <p className="mt-2 text-xs text-[#777167]">{candidate.city} · {candidate.region} · {candidate.group}</p>
          </div>
        </div>
        <div className="mt-8 rounded-2xl bg-[#252b4a] p-5 text-[#f8f5eb]">
          <div className="flex items-end justify-between"><div><SectionLabel>Case completion</SectionLabel><p className="font-display text-4xl">{candidate.progress}<span className="text-xl text-[#e7b866]">%</span></p></div><span className="text-right text-[11px] leading-relaxed text-[#b9bfd6]">Started<br /><span className="text-[#f8f5eb]">{candidate.submitted}</span></span></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#e7b866]" style={{ width: `${candidate.progress}%` }} /></div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between"><SectionLabel>People in this record</SectionLabel><span className="text-[10px] font-semibold text-[#9a9286]">Demo information</span></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {candidate.members.map((member, index) => <div key={member.memberId} className="rounded-xl border border-[#e3ddd3] bg-[#f4f1ea] p-4 animate-rise-in" style={{ animationDelay: `${index * 65}ms` }}>
              <div className="flex items-start gap-3"><Avatar initials={member.name.split(' ').map((part) => part[0]).join('').slice(0, 2)} size="sm" tone={index === 0 ? 'copper' : 'teal'} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#4b4743]">{member.name}</p><p className="mt-1 text-[10px] text-[#888075]">{member.role} · {member.memberId}</p></div></div>
              <div className="mt-4 space-y-2 text-[11px] text-[#777167]"><p className="flex items-center gap-2"><Phone size={13} className="text-[#397665]" />{member.phone}</p><p className="flex items-center gap-2"><Mail size={13} className="text-[#397665]" />{member.email}</p><p className="flex items-center gap-2"><UserRound size={13} className="text-[#397665]" />{member.occupation}</p><p className="flex items-center gap-2"><MapPinned size={13} className="text-[#397665]" />{member.address}</p></div>
              <p className="mt-3 border-t border-[#e1dbd1] pt-3 text-[10px] text-[#9a9286]">Member since {member.joinedChurch} · {member.pastor}</p>
            </div>)}
          </div>
        </div>

        <div className="mt-8">
          <SectionLabel>Journey checkpoints</SectionLabel>
          <div className="space-y-0">{steps.map((step, index) => <div key={step} className="flex gap-3"><div className="flex flex-col items-center"><span className={`grid h-7 w-7 place-items-center rounded-full border-2 ${index <= activeIndex ? 'border-[#397665] bg-[#397665] text-white' : 'border-[#d4cec2] text-[#aaa297]'}`}>{index < activeIndex ? <Check size={13} /> : <span className="text-[10px] font-bold">{index + 1}</span>}</span>{index < steps.length - 1 && <span className={`h-8 w-px ${index < activeIndex ? 'bg-[#93beae]' : 'bg-[#e1dbd1]'}`} />}</div><div className="pb-4 pt-1"><p className={`text-xs font-semibold ${index <= activeIndex ? 'text-[#3a383e]' : 'text-[#aaa297]'}`}>{step}</p><p className="mt-1 text-[10px] text-[#9a9286]">{index < activeIndex ? 'Completed and recorded' : index === activeIndex ? 'Current checkpoint' : 'Awaiting this step'}</p></div></div>)}</div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#e3ddd3] bg-[#f4f1ea] p-4"><SectionLabel>Church structure</SectionLabel><p className="text-xs font-semibold text-[#4b4743]">{candidate.region}</p><p className="mt-1 text-[11px] text-[#888075]">{candidate.group} · {candidate.district}</p></div>
          <div className="rounded-xl border border-[#e3ddd3] bg-[#f4f1ea] p-4"><SectionLabel>Pastoral lead</SectionLabel><p className="text-xs font-semibold text-[#4b4743]">{candidate.pastor}</p><p className="mt-1 text-[11px] text-[#888075]">{candidate.phone}</p></div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between"><SectionLabel>Forms & records</SectionLabel><span className="text-[10px] text-[#9a9286]">{candidate.forms.length} records</span></div>
          <div className="overflow-hidden rounded-xl border border-[#e3ddd3] bg-[#f4f1ea] divide-y divide-[#e3ddd3]">
            {candidate.forms.map((record) => <div key={record.name} className="flex items-center gap-3 px-4 py-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e9e5dc] text-[#6f685e]"><FileHeart size={15} /></span><span className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#4b4743]">{record.name}</p><p className="mt-1 truncate text-[10px] text-[#938b7e]">{record.type} · {record.detail}</p></span><span className="shrink-0 text-right"><span className={`block rounded-full px-2 py-1 text-[9px] font-bold ${recordStatus(record.status)}`}>{record.status}</span><span className="mt-1 block text-[9px] text-[#a0988c]">{record.date}</span></span></div>)}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between"><SectionLabel>Medical screening</SectionLabel><span className="flex items-center gap-1 text-[10px] font-semibold text-[#765579]"><LockKeyhole size={11} />Protected record</span></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {candidate.medical.map((result) => <div key={result.name} className="rounded-xl border border-[#e3ddd3] bg-[#f4f1ea] p-4"><div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e8ecf2] text-[#52647d]"><Stethoscope size={15} /></span><p className="text-xs font-semibold text-[#4b4743]">{result.name}</p></div><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${result.result === 'Cleared' ? 'bg-[#e1f0e8] text-[#32705c]' : result.result === 'Under review' ? 'bg-[#f3ead5] text-[#956b31]' : 'bg-[#eee9f1] text-[#765579]'}`}>{result.result}</span></div><p className="mt-3 text-[10px] text-[#777167]">{result.facility} · {result.date}</p><p className="mt-1 text-[10px] leading-relaxed text-[#9a9286]">{result.detail}</p></div>)}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between"><SectionLabel>Activity history</SectionLabel><CalendarDays size={15} className="text-[#938b7e]" /></div>
          <div className="space-y-4 border-l border-[#d8d0c4] pl-4">{candidate.activity.map((item, index) => <div key={`${item.title}-${index}`} className="relative"><span className="absolute -left-[21px] top-0.5 grid h-3 w-3 place-items-center rounded-full bg-[#397665] ring-4 ring-[#faf8f3]"><span className="h-1 w-1 rounded-full bg-white" /></span><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#a2784b]">{item.date}</p><p className="mt-1 text-xs font-semibold text-[#4b4743]">{item.title}</p><p className="mt-1 text-[11px] leading-relaxed text-[#888075]">{item.detail}</p><p className="mt-1 text-[10px] text-[#aaa297]">{item.actor}</p></div>)}</div>
        </div>

        <div className="mt-8 rounded-xl border-l-2 border-[#c78642] bg-[#f5eee2] p-4"><SectionLabel>Latest case note</SectionLabel><p className="text-sm leading-relaxed text-[#61584d]">{candidate.note}</p></div>
        <div className="mt-7 flex gap-2">
          <button onClick={() => onToast('A review reminder has been prepared for the pastoral lead.')} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#252b4a] px-4 py-3 text-xs font-semibold text-[#f8f5eb] hover:bg-[#30385e]" data-testid="button-send-reminder"><Send size={14} />Send reminder</button>
          <button onClick={() => onToast('Case forms are available in the shared library.')} className="flex items-center justify-center gap-2 rounded-xl border border-[#d8d0c4] px-4 py-3 text-xs font-semibold text-[#57534c] hover:bg-[#eee9df]" data-testid="button-view-case-forms"><FileText size={14} />Forms</button>
        </div>
      </div>
    </aside>
  </>;
}

function ModalFrame({ title, eyebrow, onClose, children }: { title: string; eyebrow: string; onClose: () => void; children: ReactNode }) {
  return <><button className="fixed inset-0 z-50 bg-[#252b4a]/40 backdrop-blur-[2px]" onClick={onClose} aria-label="Close dialog backdrop" data-testid="button-close-dialog-backdrop" /><div className="fixed left-1/2 top-1/2 z-[55] max-h-[90vh] w-[calc(100%-2rem)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#dfd9ce] bg-[#faf8f3] p-6 shadow-2xl animate-soft-in sm:p-8"><div className="flex items-start justify-between"><div><SectionLabel>{eyebrow}</SectionLabel><h2 className="font-display text-3xl text-[#252b4a]">{title}</h2></div><button onClick={onClose} className="rounded-lg p-2 text-[#777167] hover:bg-[#eee9df]" aria-label="Close dialog" data-testid="button-close-dialog"><X size={18} /></button></div>{children}</div></>;
}

function NewCaseModal({ form, setForm, onClose, onCreate }: { form: { names: string; city: string; region: string; pastor: string }; setForm: (value: { names: string; city: string; region: string; pastor: string }) => void; onClose: () => void; onCreate: () => void }) {
  return <ModalFrame eyebrow="New case · local demo" title="Begin with care" onClose={onClose}><p className="mt-3 text-sm leading-relaxed text-[#777167]">Create the first record for a couple. You can add documents, references, and the pastoral journey as the case develops.</p><div className="mt-6 space-y-4"><label className="block"><span className="mb-2 block text-xs font-semibold text-[#514e48]">Couple’s names <span className="text-[#b4783f]">*</span></span><input autoFocus value={form.names} onChange={(event) => setForm({ ...form, names: event.target.value })} placeholder="e.g. David & Esther" className="h-11 w-full rounded-xl border border-[#dcd5ca] bg-[#f5f1e9] px-3.5 text-sm focus:border-[#397665] focus:outline-none" data-testid="input-new-case-names" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-xs font-semibold text-[#514e48]">City <span className="text-[#b4783f]">*</span></span><input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="e.g. Abeokuta" className="h-11 w-full rounded-xl border border-[#dcd5ca] bg-[#f5f1e9] px-3.5 text-sm focus:border-[#397665] focus:outline-none" data-testid="input-new-case-city" /></label><label className="block"><span className="mb-2 block text-xs font-semibold text-[#514e48]">Region</span><select value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} className="h-11 w-full rounded-xl border border-[#dcd5ca] bg-[#f5f1e9] px-3.5 text-sm focus:border-[#397665] focus:outline-none" data-testid="select-new-case-region">{regionData.map((region) => <option key={region.name}>{region.name}</option>)}</select></label></div><label className="block"><span className="mb-2 block text-xs font-semibold text-[#514e48]">Pastoral lead <span className="font-normal text-[#9a9286]">(optional)</span></span><input value={form.pastor} onChange={(event) => setForm({ ...form, pastor: event.target.value })} placeholder="Assign a pastor later if needed" className="h-11 w-full rounded-xl border border-[#dcd5ca] bg-[#f5f1e9] px-3.5 text-sm focus:border-[#397665] focus:outline-none" data-testid="input-new-case-pastor" /></label></div><div className="mt-7 flex justify-end gap-2"><button onClick={onClose} className="rounded-xl px-4 py-3 text-xs font-semibold text-[#777167] hover:bg-[#eee9df]" data-testid="button-cancel-new-case">Cancel</button><button onClick={onCreate} className="rounded-xl bg-[#252b4a] px-4 py-3 text-xs font-semibold text-[#f8f5eb] hover:bg-[#30385e]" data-testid="button-create-new-case">Create case</button></div></ModalFrame>;
}

function UploadModal({ onClose, onUpload }: { onClose: () => void; onUpload: () => void }) {
  return <ModalFrame eyebrow="Shared library · local demo" title="Add a document" onClose={onClose}><p className="mt-3 text-sm leading-relaxed text-[#777167]">This presentation workspace stores no files. Choose a file-shaped record to preview the upload journey.</p><button onClick={onUpload} className="mt-6 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#b9cfc5] bg-[#e9f1ed] px-5 py-10 text-center hover:bg-[#e1ece6]" data-testid="button-confirm-upload"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#397665] text-[#f1f7f3]"><CloudUpload size={19} /></span><span className="mt-3 text-sm font-semibold text-[#31594e]">Choose a document</span><span className="mt-1 text-[11px] text-[#648378]">PDF, JPG, or PNG · up to 10 MB</span></button><div className="mt-5 flex justify-end"><button onClick={onClose} className="rounded-xl px-4 py-3 text-xs font-semibold text-[#777167] hover:bg-[#eee9df]" data-testid="button-cancel-upload">Not now</button></div></ModalFrame>;
}

function ComposeModal({ onClose, onSend }: { onClose: () => void; onSend: () => void }) {
  const [message, setMessage] = useState('');
  return <ModalFrame eyebrow="Pastor-to-pastor · private note" title="Write a quick note" onClose={onClose}><div className="mt-5 space-y-4"><label className="block"><span className="mb-2 block text-xs font-semibold text-[#514e48]">To</span><select className="h-11 w-full rounded-xl border border-[#dcd5ca] bg-[#f5f1e9] px-3.5 text-sm focus:border-[#397665] focus:outline-none" data-testid="select-message-recipient"><option>Ps. Ifeanyi Nwosu · Enugu Group</option><option>Ps. Musa Abdullahi · Kaduna Group</option><option>Mrs. Grace Okoro · South South region</option></select></label><label className="block"><span className="mb-2 block text-xs font-semibold text-[#514e48]">Message</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Keep it concise and pastoral..." rows={5} className="w-full resize-none rounded-xl border border-[#dcd5ca] bg-[#f5f1e9] p-3.5 text-sm leading-relaxed focus:border-[#397665] focus:outline-none" data-testid="textarea-message" /></label></div><div className="mt-7 flex justify-end gap-2"><button onClick={onClose} className="rounded-xl px-4 py-3 text-xs font-semibold text-[#777167] hover:bg-[#eee9df]" data-testid="button-cancel-message">Cancel</button><button onClick={onSend} disabled={!message.trim()} className="flex items-center gap-2 rounded-xl bg-[#252b4a] px-4 py-3 text-xs font-semibold text-[#f8f5eb] hover:bg-[#30385e] disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-send-message"><Send size={14} />Send note</button></div></ModalFrame>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary resetKey="/">{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><AppShell /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;