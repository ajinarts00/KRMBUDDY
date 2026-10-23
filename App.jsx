import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, Bell, BookOpen, CalendarDays, Check, ChevronDown, CircleHelp, ClipboardList,
  FileText, GraduationCap, LayoutDashboard, LogOut, Menu, Megaphone, Plus, Search,
  ShieldCheck, Sparkles, Users, X, Eye, EyeOff, ArrowUpRight, LoaderCircle, Trash2,
  UserRound, Settings2, UploadCloud
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './supabase';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'members', label: 'Pengurusan Ahli', icon: Users },
  { id: 'announcements', label: 'Pengumuman', icon: Megaphone },
  { id: 'materials', label: 'Material Usrah', icon: BookOpen },
  { id: 'attendance', label: 'Kehadiran', icon: ClipboardList },
];
const roleLabel = (role) => ({ admin: 'Admin', leader: 'Ketua Kumpulan', member: 'Ahli' }[role] || 'Ahli');
const dateLabel = (value) => value ? new Intl.DateTimeFormat('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : '—';
const initials = (name = 'KRM Buddy') => name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join('').toUpperCase();

function Brand({ small = false }) {
  return <div className={`brand ${small ? 'brand-small' : ''}`}>
    <div className="brand-mark"><span>K</span><span>R</span><span>M</span></div>
    <div className="brand-copy"><strong>KRM <em>BUDDY</em></strong><span>KELAB RAKAN MASJID UMS</span></div>
  </div>;
}
function Notice({ notice, onClose }) {
  if (!notice) return null;
  return <div className={`notice ${notice.type || 'info'}`} role="status"><span>{notice.message}</span><button onClick={onClose} aria-label="Tutup mesej"><X size={16}/></button></div>;
}
function AuthScreen({ onNotice }) {
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', username: '', full_name: '', matric_no: '', faculty: '', password: '', confirm: '' });
  const change = (key) => (e) => setForm((v) => ({ ...v, [key]: e.target.value }));
  async function submit(e) {
    e.preventDefault();
    if (!supabase) return;
    if (mode === 'signup' && form.password !== form.confirm) { onNotice({ type: 'error', message: 'Pengesahan kata laluan tidak sepadan.' }); return; }
    if (mode === 'signup' && form.password.length < 8) { onNotice({ type: 'error', message: 'Gunakan kata laluan sekurang-kurangnya 8 aksara.' }); return; }
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(), password: form.password,
          options: { data: { username: form.username.trim(), full_name: form.full_name.trim(), matric_no: form.matric_no.trim(), faculty: form.faculty.trim() } }
        });
        if (error) throw error;
        if (!data.session) onNotice({ type: 'success', message: 'Pendaftaran berjaya. Semak e-mel untuk mengesahkan akaun sebelum log masuk.' });
        else onNotice({ type: 'success', message: 'Akaun berjaya didaftarkan. Selamat datang ke KRM Buddy!' });
      }
    } catch (error) { onNotice({ type: 'error', message: error.message || 'Tidak berjaya. Sila cuba lagi.' }); }
    finally { setBusy(false); }
  }
  return <main className="auth-page">
    <div className="auth-decoration"><div className="orb orb-one"/><div className="orb orb-two"/><div className="auth-pattern"/>
      <div className="auth-message"><Brand/><div className="eyebrow"><Sparkles size={15}/> RUANG UKHUWAH, ILMU & KHIDMAT</div>
        <h1>Ukhuwah terjaga.<br/><span>Usrah lebih bermakna.</span></h1>
        <p>Satu ruang digital untuk ahli KRM Buddy berhubung, berkongsi ilmu dan mengurus aktiviti usrah bersama-sama.</p>
        <div className="auth-points"><span><ShieldCheck size={17}/> Ruang ahli yang teratur</span><span><BookOpen size={17}/> Bahan usrah dalam satu tempat</span><span><Bell size={17}/> Hebahan terkini kelab</span></div>
      </div><div className="auth-footer">KELAB RAKAN MASJID · UNIVERSITI MALAYSIA SABAH</div>
    </div>
    <div className="auth-panel"><div className="auth-form-wrap">
      <div className="mobile-brand"><Brand/></div>
      <div className="form-kicker">PORTAL AHLI KRM</div><h2>{mode === 'login' ? 'Selamat kembali' : 'Sertai KRM Buddy'}</h2>
      <p className="muted">{mode === 'login' ? 'Log masuk untuk meneruskan ke ruang komuniti anda.' : 'Daftar akaun ahli untuk mengakses portal KRM Buddy.'}</p>
      <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Log masuk</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Daftar akaun</button></div>
      <form onSubmit={submit} className="form-stack">
        {mode === 'signup' && <>
          <label>Nama penuh<input required autoComplete="name" value={form.full_name} onChange={change('full_name')} placeholder="Contoh: Nur Aisyah"/></label>
          <label>Username<input required minLength={3} maxLength={24} pattern="[A-Za-z0-9_.-]+" value={form.username} onChange={change('username')} placeholder="Contoh: aisyah_krm"/><small>3–24 aksara; huruf, nombor, titik, _ atau -.</small></label>
          <div className="field-row"><label>No. matrik (pilihan)<input value={form.matric_no} onChange={change('matric_no')} placeholder="BK..."/></label><label>Fakulti (pilihan)<input value={form.faculty} onChange={change('faculty')} placeholder="Fakulti"/></label></div>
        </>}
        <label>Alamat e-mel<input required type="email" autoComplete="email" value={form.email} onChange={change('email')} placeholder="nama@contoh.com"/></label>
        <label>Kata laluan<div className="password-wrap"><input required type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} value={form.password} onChange={change('password')} placeholder="Sekurang-kurangnya 8 aksara"/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Papar kata laluan">{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
        {mode === 'signup' && <label>Sahkan kata laluan<input required type="password" autoComplete="new-password" minLength={8} value={form.confirm} onChange={change('confirm')} placeholder="Masukkan semula kata laluan"/></label>}
        <button className="btn btn-primary btn-wide" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18}/> : null}{mode === 'login' ? 'Log masuk ke portal' : 'Cipta akaun ahli'}<ArrowUpRight size={17}/></button>
      </form>
      <p className="auth-small">Dengan meneruskan, anda bersetuju menggunakan portal ini secara bertanggungjawab dan menjaga kerahsiaan data ahli.</p>
      <div className="auth-help"><ShieldCheck size={16}/><span>Admin dilantik secara berasingan. Pendaftaran biasa tidak memberikan akses admin.</span></div>
    </div></div>
  </main>;
}

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({});
  const [selectedGroup, setSelectedGroup] = useState('all');

  const showNotice = useCallback((n) => { setNotice(n); window.setTimeout(() => setNotice((old) => old === n ? null : old), 6000); }, []);
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setProfile(null); });
    return () => listener.subscription.unsubscribe();
  }, []);

  const isAdmin = profile?.role === 'admin';
  const isLeader = profile?.role === 'leader';
  const canManageGroup = isAdmin || isLeader;
  const filteredMembers = useMemo(() => members.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || [m.full_name, m.username, m.email, m.matric_no, m.faculty].some((v) => (v || '').toLowerCase().includes(q));
    const matchesGroup = selectedGroup === 'all' || m.group_id === selectedGroup;
    return matchesSearch && matchesGroup;
  }), [members, search, selectedGroup]);

  const loadData = useCallback(async (currentProfile) => {
    if (!supabase || !currentProfile) return;
    const [groupRes, memberRes, announcementRes, materialRes, attendanceRes] = await Promise.all([
      supabase.from('groups').select('*').order('name'),
      supabase.from('profiles').select('id,full_name,username,email,matric_no,faculty,phone,role,group_id,status,created_at').order('created_at', { ascending: false }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('materials').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('attendance').select('*, groups(name)').order('session_date', { ascending: false }).limit(100),
    ]);
    const errors = [groupRes, memberRes, announcementRes, materialRes, attendanceRes].filter((r) => r.error);
    if (errors.length) showNotice({ type: 'error', message: errors[0].error.message });
    setGroups(groupRes.data || []); setMembers(memberRes.data || []); setAnnouncements(announcementRes.data || []); setMaterials(materialRes.data || []); setAttendance(attendanceRes.data || []);
  }, [showNotice]);

  useEffect(() => {
    let active = true;
    async function getProfile() {
      if (!session?.user || !supabase) { setProfile(null); return; }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (!active) return;
      if (error) showNotice({ type: 'error', message: 'Profil tidak dapat dimuat: ' + error.message });
      const p = data ? { ...data, email: session.user.email } : { id: session.user.id, email: session.user.email, full_name: session.user.user_metadata?.full_name || 'Ahli KRM', username: session.user.user_metadata?.username || '', role: 'member' };
      setProfile(p);
      if (data) loadData(p);
    }
    getProfile();
    return () => { active = false; };
  }, [session, loadData, showNotice]);

  async function signOut() { await supabase?.auth.signOut(); setPage('dashboard'); }
  function openModal(type, item = null) { setDraft(item ? { ...item } : {}); setModal({ type, item }); }
  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  async function saveModal(e) {
    e.preventDefault(); if (!supabase || !modal) return; setSaving(true);
    try {
      const { type, item } = modal; let error;
      if (type === 'announcement') {
        const payload = { title: draft.title?.trim(), body: draft.body?.trim(), audience: draft.audience || (profile.role === 'admin' ? 'all' : profile.group_id), created_by: profile.id };
        ({ error } = item ? await supabase.from('announcements').update(payload).eq('id', item.id) : await supabase.from('announcements').insert(payload));
      } else if (type === 'material') {
        const payload = { title: draft.title?.trim(), description: draft.description?.trim() || '', url: draft.url?.trim(), topic: draft.topic?.trim() || '', created_by: profile.id };
        ({ error } = item ? await supabase.from('materials').update(payload).eq('id', item.id) : await supabase.from('materials').insert(payload));
      } else if (type === 'group') {
        const payload = { name: draft.name?.trim(), description: draft.description?.trim() || '' };
        ({ error } = item ? await supabase.from('groups').update(payload).eq('id', item.id) : await supabase.from('groups').insert(payload));
      } else if (type === 'member') {
        const payload = { role: draft.role, group_id: draft.group_id || null, status: draft.status || 'active' };
        ({ error } = await supabase.from('profiles').update(payload).eq('id', item.id));
      } else if (type === 'attendance') {
        const payload = { title: draft.title?.trim(), session_date: draft.session_date, group_id: draft.group_id || null, notes: draft.notes?.trim() || '', created_by: profile.id };
        ({ error } = await supabase.from('attendance').insert(payload));
      }
      if (error) throw error;
      setModal(null); showNotice({ type: 'success', message: 'Maklumat berjaya disimpan.' }); await loadData(profile);
    } catch (error) { showNotice({ type: 'error', message: error.message || 'Tidak berjaya menyimpan data.' }); }
    finally { setSaving(false); }
  }
  async function deleteItem(table, id) {
    if (!window.confirm('Padam rekod ini? Tindakan ini tidak boleh dibatalkan.')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) showNotice({ type: 'error', message: error.message }); else { showNotice({ type: 'success', message: 'Rekod dipadam.' }); await loadData(profile); }
  }
  async function markAttendance(eventId, status) {
    const { error } = await supabase.from('attendance_records').upsert({ event_id: eventId, member_id: profile.id, status }, { onConflict: 'event_id,member_id' });
    if (error) showNotice({ type: 'error', message: error.message }); else showNotice({ type: 'success', message: 'Kehadiran anda direkodkan.' });
  }

  if (!isSupabaseConfigured) return <div className="setup-page"><div className="setup-card"><Brand/><div className="setup-icon"><Settings2 size={25}/></div><h1>Sambungkan database KRM Buddy</h1><p>Projek sudah disediakan, tetapi perlu disambungkan kepada projek Supabase kamu sebelum pendaftaran, log masuk dan penyimpanan data boleh digunakan.</p><ol><li>Cipta projek di <a href="https://supabase.com" target="_blank" rel="noreferrer">Supabase</a>.</li><li>Salin fail <code>.env.example</code> sebagai <code>.env</code>.</li><li>Masukkan Project URL dan publishable/anon key ke dalam <code>.env</code>.</li><li>Jalankan skrip database <code>supabase/schema.sql</code> seperti diterangkan dalam README.</li></ol><div className="setup-warning"><ShieldCheck size={18}/><span>Jangan letak <b>service_role key</b> dalam website atau fail .env yang bermula dengan VITE_.</span></div><a className="btn btn-primary btn-wide" href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Buka Supabase <ArrowUpRight size={17}/></a><p className="tiny-note">Arahan pemasangan lengkap ada dalam README.md di dalam folder projek.</p></div></div>;
  if (loading) return <div className="loading-screen"><LoaderCircle className="spin" size={28}/><span>Menyediakan ruang KRM Buddy…</span></div>;
  if (!session) return <><AuthScreen onNotice={showNotice}/><Notice notice={notice} onClose={() => setNotice(null)}/></>;
  if (!profile) return <div className="loading-screen"><LoaderCircle className="spin" size={28}/><span>Memuatkan profil ahli…</span></div>;

  const allowedNav = NAV.filter((n) => n.id !== 'members' || canManageGroup);
  const pageTitle = NAV.find((n) => n.id === page)?.label || 'Dashboard';
  const myGroup = groups.find((g) => g.id === profile.group_id);
  const scopedMembers = isLeader ? members.filter((m) => m.group_id === profile.group_id) : members;
  const scopedAttendance = isLeader ? attendance.filter((a) => a.group_id === profile.group_id) : attendance;
  const latestAnnouncements = announcements.filter((a) => a.audience === 'all' || isAdmin || a.audience === profile.group_id);

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><Brand/><button className="icon-btn mobile-close" onClick={() => setMobileNav(false)}><X size={19}/></button></div>
      <div className="workspace-label">RUANG KOMUNITI</div><nav className="side-nav">{allowedNav.map((n) => { const Icon = n.icon; return <button key={n.id} className={`nav-item ${page === n.id ? 'selected' : ''}`} onClick={() => { setPage(n.id); setMobileNav(false); }}><Icon size={18}/><span>{n.label}</span>{n.id === 'announcements' && latestAnnouncements.length > 0 && <span className="nav-count">{Math.min(latestAnnouncements.length, 9)}</span>}</button>; })}</nav>
      {isAdmin && <><div className="workspace-label admin-label">PENTADBIRAN</div><button className={`nav-item ${page === 'groups' ? 'selected' : ''}`} onClick={() => { setPage('groups'); setMobileNav(false); }}><GraduationCap size={18}/><span>Kumpulan Usrah</span></button><button className={`nav-item ${page === 'settings' ? 'selected' : ''}`} onClick={() => { setPage('settings'); setMobileNav(false); }}><Settings2 size={18}/><span>Tetapan Portal</span></button></>}
      <div className="sidebar-bottom"><div className="sidebar-help"><div className="help-icon"><CircleHelp size={18}/></div><strong>Perlukan bantuan?</strong><p>Hubungi pentadbir KRM Buddy untuk bantuan akaun.</p></div><div className="sidebar-user"><div className="avatar avatar-gold">{initials(profile.full_name)}</div><div className="user-meta"><strong>{profile.full_name || 'Ahli KRM'}</strong><span>{roleLabel(profile.role)}</span></div><button className="icon-btn" title="Log keluar" onClick={signOut}><LogOut size={17}/></button></div></div>
    </aside>
    {mobileNav && <button className="nav-scrim" aria-label="Tutup menu" onClick={() => setMobileNav(false)}/>}
    <main className="main-area"><header className="topbar"><div className="topbar-left"><button className="icon-btn menu-toggle" onClick={() => setMobileNav(true)}><Menu size={21}/></button><div className="breadcrumbs"><span>KRM Buddy</span><span className="crumb-slash">/</span><strong>{pageTitle}</strong></div></div><div className="topbar-right"><span className="online-pill"><span/> Portal ahli</span><button className="icon-btn notification-btn" onClick={() => setPage('announcements')} aria-label="Pengumuman"><Bell size={18}/>{latestAnnouncements.length > 0 && <i/>}</button><div className="top-user"><div className="avatar">{initials(profile.full_name)}</div><div><strong>{profile.full_name || 'Ahli KRM'}</strong><span>{roleLabel(profile.role)}</span></div><ChevronDown size={15}/></div></div></header>
      <div className="content-wrap"><Notice notice={notice} onClose={() => setNotice(null)}/>
        {page === 'dashboard' && <Dashboard profile={profile} isAdmin={isAdmin} isLeader={isLeader} myGroup={myGroup} members={scopedMembers} announcements={latestAnnouncements} materials={materials} attendance={scopedAttendance} setPage={setPage} openModal={openModal}/>}
        {page === 'members' && <MembersPage members={filteredMembers} groups={groups} profile={profile} isAdmin={isAdmin} isLeader={isLeader} search={search} setSearch={setSearch} selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} openModal={openModal} />}
        {page === 'announcements' && <AnnouncementsPage announcements={latestAnnouncements} canManage={canManageGroup} isAdmin={isAdmin} openModal={openModal} deleteItem={deleteItem}/>}
        {page === 'materials' && <MaterialsPage materials={materials} canManage={canManageGroup} openModal={openModal} deleteItem={deleteItem}/>}
        {page === 'attendance' && <AttendancePage attendance={scopedAttendance} groups={groups} profile={profile} canManage={canManageGroup} openModal={openModal} markAttendance={markAttendance}/>}
        {page === 'groups' && isAdmin && <GroupsPage groups={groups} members={members} openModal={openModal} deleteItem={deleteItem}/>}
        {page === 'settings' && isAdmin && <SettingsPage profile={profile} members={members} groups={groups}/>}
        <footer className="page-footer"><span>© {new Date().getFullYear()} KRM Buddy · Kelab Rakan Masjid UMS</span><span>Dibina untuk mengukuhkan ukhuwah <span className="gold-heart">♥</span></span></footer>
      </div>
    </main>
    {modal && <Modal modal={modal} draft={draft} setField={setField} groups={groups} members={members} profile={profile} isAdmin={isAdmin} saving={saving} onClose={() => setModal(null)} onSubmit={saveModal}/>}
  </div>;
}

function PageHeading({ eyebrow, title, description, action }) { return <div className="page-heading"><div><div className="eyebrow-text">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>; }
function Dashboard({ profile, isAdmin, isLeader, myGroup, members, announcements, materials, attendance, setPage, openModal }) {
  const upcoming = [...attendance].filter((a) => a.session_date && new Date(a.session_date + 'T23:59:59') >= new Date()).sort((a,b) => a.session_date.localeCompare(b.session_date)).slice(0,3);
  return <><div className="welcome-banner"><div className="welcome-content"><div className="welcome-tag"><Sparkles size={14}/> ASSALAMUALAIKUM</div><h1>Selamat datang, <span>{(profile.full_name || 'Sahabat KRM').split(' ')[0]}.</span></h1><p>Ruang untuk kita saling menguatkan, berkongsi ilmu dan membina ukhuwah.</p><button className="btn btn-gold" onClick={() => setPage('announcements')}>Lihat pengumuman <ArrowUpRight size={16}/></button></div><div className="welcome-art"><div className="art-ring ring-one"/><div className="art-ring ring-two"/><div className="art-crescent">☾</div><div className="art-star">✦</div><div className="art-caption">UKHUWAH<br/><b>SEPANJANG MASA</b></div></div><div className="banner-bottom-line"/></div>
    <div className="section-title-row"><div><h2>Ringkasan portal</h2><p>Gambaran ringkas komuniti KRM Buddy.</p></div><span className="date-chip"><CalendarDays size={15}/>{new Intl.DateTimeFormat('ms-MY',{weekday:'long',day:'numeric',month:'long'}).format(new Date())}</span></div>
    <div className="stats-grid"><StatCard icon={Users} label={isAdmin ? 'Jumlah ahli' : isLeader ? 'Ahli kumpulan' : 'Profil keahlian'} value={isAdmin || isLeader ? members.length : 'Aktif'} note={isAdmin ? 'Semua kumpulan' : isLeader ? (myGroup?.name || 'Kumpulan anda') : 'Selamat menyertai KRM'} tone="blue"/><StatCard icon={Megaphone} label="Pengumuman" value={announcements.length} note="Hebahan komuniti" tone="gold"/><StatCard icon={BookOpen} label="Bahan usrah" value={materials.length} note="Nota & rujukan ilmu" tone="green"/><StatCard icon={CalendarDays} label="Sesi akan datang" value={upcoming.length} note="Dalam senarai jadual" tone="purple"/></div>
    <div className="dashboard-grid"><section className="panel announcements-panel"><div className="panel-heading"><div><div className="panel-icon gold-icon"><Megaphone size={17}/></div><div><h3>Pengumuman terkini</h3><p>Maklumat penting untuk komuniti</p></div></div><button className="text-action" onClick={() => setPage('announcements')}>Lihat semua <ArrowUpRight size={14}/></button></div>
      {announcements.length ? <div className="announcement-list">{announcements.slice(0,3).map((a) => <article className="announcement-row" key={a.id}><div className="announcement-mark"><Megaphone size={17}/></div><div className="announcement-info"><div className="announcement-meta"><span className="tag tag-gold">{a.audience === 'all' ? 'Semua ahli' : 'Kumpulan'}</span><span>{dateLabel(a.created_at)}</span></div><h4>{a.title}</h4><p>{a.body}</p></div></article>)}</div> : <EmptyState icon={Megaphone} title="Belum ada pengumuman" text="Pengumuman baharu akan dipaparkan di sini."/>}
      {canCreatePlaceholder(isAdmin,isLeader) && <button className="panel-bottom-action" onClick={() => openModal('announcement')}><Plus size={16}/> Tulis pengumuman baharu</button>}
    </section><section className="panel quick-panel"><div className="panel-heading"><div><div className="panel-icon blue-icon"><Activity size={17}/></div><div><h3>Akses pantas</h3><p>Perkara yang boleh anda lakukan</p></div></div></div><div className="quick-links"><button onClick={() => setPage('materials')}><span className="quick-icon quick-green"><BookOpen size={17}/></span><span><strong>Teroka material usrah</strong><small>Nota, PDF dan pautan pembelajaran</small></span><ArrowUpRight size={16}/></button><button onClick={() => setPage('attendance')}><span className="quick-icon quick-purple"><CalendarDays size={17}/></span><span><strong>Jadual & kehadiran</strong><small>Semak rekod dan sesi usrah</small></span><ArrowUpRight size={16}/></button>{(isAdmin || isLeader) && <button onClick={() => setPage('members')}><span className="quick-icon quick-gold"><Users size={17}/></span><span><strong>Urus ahli</strong><small>Lihat maklumat keahlian</small></span><ArrowUpRight size={16}/></button>}</div><div className="quote-card"><span>“</span><p>Orang mukmin dengan mukmin yang lain seperti satu bangunan yang saling menguatkan.</p><small>— Hadis riwayat al-Bukhari & Muslim</small></div></section></div>
    <div className="lower-grid"><section className="panel"><div className="panel-heading"><div><div className="panel-icon green-icon"><CalendarDays size={17}/></div><div><h3>Sesi akan datang</h3><p>Jangan terlepas perjumpaan</p></div></div><button className="text-action" onClick={() => setPage('attendance')}>Semua sesi <ArrowUpRight size={14}/></button></div>{upcoming.length ? upcoming.map((a) => <div className="session-row" key={a.id}><div className="session-date"><b>{new Date(a.session_date+'T12:00:00').getDate()}</b><span>{new Intl.DateTimeFormat('ms-MY',{month:'short'}).format(new Date(a.session_date+'T12:00:00'))}</span></div><div className="session-info"><strong>{a.title}</strong><span>{a.groups?.name || 'Semua kumpulan'} · {dateLabel(a.session_date)}</span></div><span className="status-dot-label"><i/> Akan datang</span></div>) : <EmptyState icon={CalendarDays} title="Tiada sesi dijadualkan" text="Sesi yang akan datang akan muncul di sini."/>}</section><section className="panel member-welcome"><div className="member-welcome-icon"><UserRound size={23}/></div><div><span className="eyebrow-text">PROFIL ANDA</span><h3>{profile.full_name || 'Ahli KRM Buddy'}</h3><p>{profile.email}</p><div className="profile-tags"><span>{roleLabel(profile.role)}</span>{myGroup && <span>{myGroup.name}</span>}</div></div><div className="profile-note"><ShieldCheck size={16}/><span>Maklumat akaun anda diurus dengan kawalan akses.</span></div></section></div>
  </>;
}
function canCreatePlaceholder(admin,leader){return admin||leader;}
function StatCard({icon:Icon,label,value,note,tone}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span></div>; }
function EmptyState({icon:Icon,title,text}) { return <div className="empty-state"><div><Icon size={22}/></div><strong>{title}</strong><p>{text}</p></div>; }
function MembersPage({ members, groups, profile, isAdmin, isLeader, search, setSearch, selectedGroup, setSelectedGroup, openModal }) {
  const [detail, setDetail] = useState(null);
  return <><PageHeading eyebrow="KOMUNITI KRM" title="Pengurusan Ahli" description="Maklumat keahlian dalam satu ruang yang tersusun." action={<span className="count-chip"><Users size={16}/>{members.length} ahli</span>}/><section className="panel table-panel"><div className="table-toolbar"><div className="search-field"><Search size={17}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Cari nama, username, matrik…"/></div><div className="toolbar-filters">{isAdmin && <select value={selectedGroup} onChange={(e)=>setSelectedGroup(e.target.value)}><option value="all">Semua kumpulan</option>{groups.map((g)=><option key={g.id} value={g.id}>{g.name}</option>)}</select>}</div></div><div className="table-scroll"><table><thead><tr><th>AHLI</th><th>NO. MATRIK</th><th>KUMPULAN</th><th>PERANAN</th><th>STATUS</th>{isAdmin&&<th>TINDAKAN</th>}</tr></thead><tbody>{members.map((m)=><tr key={m.id}><td><div className="table-person"><div className="avatar">{initials(m.full_name)}</div><div><strong>{m.full_name||'Nama belum diisi'}</strong><span>@{m.username||'username'}</span><small>{m.email}</small></div></div></td><td>{m.matric_no||'—'}<small className="cell-subtext">{m.faculty||''}</small></td><td>{groups.find((g)=>g.id===m.group_id)?.name||'Belum ditetapkan'}</td><td><span className={`role-pill role-${m.role}`}>{roleLabel(m.role)}</span></td><td><span className={`status-pill ${m.status==='active'?'status-active':'status-inactive'}`}><i/>{m.status==='active'?'Aktif':'Tidak aktif'}</span></td>{isAdmin&&<td><button className="small-btn" onClick={()=>openModal('member',m)}>Urus akses</button></td>}</tr>)}</tbody></table>{!members.length&&<EmptyState icon={Users} title="Tiada ahli ditemui" text="Cuba ubah carian atau penapis kumpulan."/>}</div><div className="table-foot"><span>Maklumat ahli hanya dipaparkan mengikut kebenaran akaun anda.</span><span>{members.length} rekod</span></div></section><div className="info-strip"><ShieldCheck size={18}/><span><b>Privasi ahli:</b> admin boleh mengurus semua ahli. Ketua kumpulan hanya melihat ahli kumpulan yang ditugaskan kepada mereka.</span></div></>;
}
function AnnouncementsPage({announcements,canManage,isAdmin,openModal,deleteItem}) { return <><PageHeading eyebrow="MAKLUMAN & HEBAHAN" title="Pengumuman" description="Hebahan program, makluman penting dan berita komuniti KRM Buddy." action={canManage&&<button className="btn btn-primary" onClick={()=>openModal('announcement')}><Plus size={17}/> Pengumuman baharu</button>}/><div className="announcement-cards">{announcements.map((a,i)=><article className="panel announcement-card" key={a.id}><div className="announcement-card-top"><div className={`announcement-large-icon ${i%3===0?'gold-icon':i%3===1?'blue-icon':'green-icon'}`}><Megaphone size={20}/></div><span className="tag tag-gold">{a.audience==='all'?'Semua ahli':'Kumpulan'}</span><span className="date-label">{dateLabel(a.created_at)}</span></div><h3>{a.title}</h3><p>{a.body}</p><div className="announcement-card-foot"><span><UserRound size={14}/> Pentadbiran KRM</span>{(isAdmin || a.audience !== 'all')&&canManage&&<div className="inline-actions"><button className="text-action" onClick={()=>openModal('announcement',a)}>Edit</button>{isAdmin&&<button className="icon-btn danger-icon" onClick={()=>deleteItem('announcements',a.id)} aria-label="Padam"><Trash2 size={15}/></button>}</div>}</div></article>)}{!announcements.length&&<div className="panel empty-panel"><EmptyState icon={Megaphone} title="Belum ada pengumuman" text="Apabila admin menerbitkan hebahan, ia akan muncul di sini."/>{canManage&&<button className="btn btn-primary" onClick={()=>openModal('announcement')}><Plus size={16}/> Tulis pengumuman pertama</button>}</div>}</div></>; }
function MaterialsPage({materials,canManage,openModal,deleteItem}) { return <><PageHeading eyebrow="ILMU & PEMBELAJARAN" title="Material Usrah" description="Koleksi nota, rujukan dan bahan perbincangan untuk setiap sesi usrah." action={canManage&&<button className="btn btn-primary" onClick={()=>openModal('material')}><Plus size={17}/> Tambah material</button>}/><div className="materials-grid">{materials.map((m,i)=><article className="panel material-card" key={m.id}><div className={`material-cover cover-${i%4}`}><div className="cover-orbit"/><div className="cover-book"><BookOpen size={28}/></div><span>{(m.topic||'MATERIAL USRAH').toUpperCase()}</span></div><div className="material-content"><span className="eyebrow-text">{m.topic||'RUJUKAN KRM'}</span><h3>{m.title}</h3><p>{m.description||'Bahan pembelajaran untuk rujukan ahli KRM Buddy.'}</p><div className="material-footer"><span><FileText size={14}/> Bahan rujukan</span><div className="inline-actions"><a className="text-action" href={m.url} target="_blank" rel="noreferrer">Buka bahan <ArrowUpRight size={14}/></a>{canManage&&<button className="icon-btn" onClick={()=>openModal('material',m)} aria-label="Edit material"><Settings2 size={15}/></button>}{canManage&&<button className="icon-btn danger-icon" onClick={()=>deleteItem('materials',m.id)} aria-label="Padam material"><Trash2 size={15}/></button>}</div></div></div></article>)}{!materials.length&&<div className="panel empty-panel"><EmptyState icon={BookOpen} title="Ruang ilmu menanti" text="Material usrah yang dimuatkan oleh admin akan dipaparkan di sini."/>{canManage&&<button className="btn btn-primary" onClick={()=>openModal('material')}><Plus size={16}/> Tambah material</button>}</div>}</div></>; }
function AttendancePage({attendance,groups,profile,canManage,openModal,markAttendance}) { return <><PageHeading eyebrow="AKTIVITI KOMUNITI" title="Jadual & Kehadiran" description="Urus sesi usrah dan rekod kehadiran ahli." action={canManage&&<button className="btn btn-primary" onClick={()=>openModal('attendance')}><Plus size={17}/> Cipta sesi</button>}/><div className="session-list">{attendance.map((a)=><article className="panel attendance-card" key={a.id}><div className="session-date large"><b>{a.session_date?new Date(a.session_date+'T12:00:00').getDate():'—'}</b><span>{a.session_date?new Intl.DateTimeFormat('ms-MY',{month:'short'}).format(new Date(a.session_date+'T12:00:00')):'TBD'}</span></div><div className="attendance-main"><div className="eyebrow-text">{a.groups?.name||groups.find(g=>g.id===a.group_id)?.name||'SEMUA KUMPULAN'}</div><h3>{a.title}</h3><p>{a.notes||'Sesi perjumpaan usrah KRM Buddy.'}</p><span className="session-full-date"><CalendarDays size={14}/>{dateLabel(a.session_date)}</span></div><div className="attendance-actions">{canManage&&<span className="tag tag-blue">Sesi dijadualkan</span>}<button className="btn btn-outline" onClick={()=>markAttendance(a.id,'present')}><Check size={15}/> Hadir</button><button className="btn btn-light" onClick={()=>markAttendance(a.id,'absent')}>Tidak hadir</button></div></article>)}{!attendance.length&&<div className="panel empty-panel"><EmptyState icon={CalendarDays} title="Belum ada sesi" text="Sesi usrah yang dicipta akan muncul di sini."/>{canManage&&<button className="btn btn-primary" onClick={()=>openModal('attendance')}><Plus size={16}/> Cipta sesi pertama</button>}</div>}</div><div className="info-strip"><ClipboardList size={18}/><span>Ahli boleh merekodkan kehadiran sendiri. Pentadbir boleh melihat dan mengurus sesi mengikut akses yang diberikan.</span></div></>; }
function GroupsPage({groups,members,openModal,deleteItem}) { return <><PageHeading eyebrow="PENTADBIRAN" title="Kumpulan Usrah" description="Susun kumpulan dan pantau bilangan ahli dalam setiap kumpulan." action={<button className="btn btn-primary" onClick={()=>openModal('group')}><Plus size={17}/> Tambah kumpulan</button>}/><div className="groups-grid">{groups.map((g,i)=><article className="panel group-card" key={g.id}><div className={`group-symbol symbol-${i%4}`}><GraduationCap size={23}/></div><div className="group-card-main"><h3>{g.name}</h3><p>{g.description||'Kumpulan usrah KRM Buddy'}</p></div><div className="group-card-stats"><strong>{members.filter(m=>m.group_id===g.id).length}</strong><span>ahli</span></div><button className="icon-btn danger-icon" onClick={()=>deleteItem('groups',g.id)} aria-label="Padam kumpulan"><Trash2 size={16}/></button></article>)}{!groups.length&&<div className="panel empty-panel"><EmptyState icon={GraduationCap} title="Belum ada kumpulan" text="Cipta kumpulan usrah untuk mula mengurus keahlian."/><button className="btn btn-primary" onClick={()=>openModal('group')}><Plus size={16}/> Cipta kumpulan</button></div>}</div></>; }
function SettingsPage({profile,members,groups}) { return <><PageHeading eyebrow="PENTADBIRAN" title="Tetapan Portal" description="Maklumat ringkas sistem dan amalan keselamatan pentadbir."/><div className="settings-grid"><section className="panel settings-card"><div className="panel-icon gold-icon"><ShieldCheck size={18}/></div><h3>Akses & keselamatan</h3><p>Peranan akaun dikawal melalui database Supabase. Akaun pendaftaran biasa tidak boleh menaik taraf dirinya sendiri kepada admin.</p><ul><li>Jangan kongsi kata laluan admin.</li><li>Jangan masukkan service_role key ke dalam frontend.</li><li>Semak peranan dan kumpulan ahli secara berkala.</li></ul></section><section className="panel settings-card"><div className="panel-icon blue-icon"><Activity size={18}/></div><h3>Status portal</h3><div className="setting-metric"><span>Jumlah ahli</span><strong>{members.length}</strong></div><div className="setting-metric"><span>Kumpulan usrah</span><strong>{groups.length}</strong></div><div className="setting-metric"><span>Akaun anda</span><strong>{profile.email}</strong></div><div className="setting-metric"><span>Peranan</span><strong>{roleLabel(profile.role)}</strong></div></section></div><div className="info-strip"><CircleHelp size={18}/><span>Untuk menambah admin pertama, ikut langkah “Bootstrap admin” dalam README. Admin tambahan boleh dilantik daripada jadual profiles di SQL Editor.</span></div></>; }
function Modal({modal,draft,setField,groups,profile,isAdmin,saving,onClose,onSubmit}) {
  const {type,item}=modal; const title={announcement:item?'Edit pengumuman':'Pengumuman baharu',material:item?'Edit material':'Tambah material usrah',group:item?'Edit kumpulan':'Tambah kumpulan usrah',member:'Urus peranan & kumpulan ahli',attendance:'Cipta sesi usrah'}[type];
  return <div className="modal-backdrop" onMouseDown={(e)=>{if(e.target===e.currentTarget)onClose();}}><section className="modal-card"><div className="modal-heading"><div><div className="eyebrow-text">KRM BUDDY · PENGURUSAN</div><h2>{title}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Tutup"><X size={20}/></button></div><form onSubmit={onSubmit} className="modal-form">
    {type==='announcement'&&<><label>Tajuk pengumuman<input required maxLength={140} value={draft.title||''} onChange={e=>setField('title',e.target.value)} placeholder="Contoh: Perjumpaan usrah minggu ini"/></label><label>Isi pengumuman<textarea required rows={5} value={draft.body||''} onChange={e=>setField('body',e.target.value)} placeholder="Tulis maklumat pengumuman dengan jelas…"/></label><label>Siapa boleh melihat?<select value={draft.audience||(isAdmin?'all':profile?.group_id||'')} onChange={e=>setField('audience',e.target.value)}>{isAdmin&&<option value="all">Semua ahli</option>}{groups.filter(g=>isAdmin || g.id===profile?.group_id).map(g=><option key={g.id} value={g.id}>Kumpulan: {g.name}</option>)}</select></label></>}
    {type==='material'&&<><label>Tajuk material<input required value={draft.title||''} onChange={e=>setField('title',e.target.value)} placeholder="Contoh: Modul Ukhuwah Islamiah"/></label><label>Topik / kategori<input value={draft.topic||''} onChange={e=>setField('topic',e.target.value)} placeholder="Contoh: Akidah, Akhlak, Sirah"/></label><label>Penerangan<textarea rows={3} value={draft.description||''} onChange={e=>setField('description',e.target.value)} placeholder="Ringkasan bahan ini…"/></label><label>Pautan bahan (PDF, Drive atau laman web)<input required type="url" value={draft.url||''} onChange={e=>setField('url',e.target.value)} placeholder="https://…"/></label><div className="modal-hint"><UploadCloud size={16}/> Buat masa ini, bahan ditambah melalui pautan. Muat naik fail terus boleh ditambah melalui Supabase Storage.</div></>}
    {type==='group'&&<><label>Nama kumpulan<input required value={draft.name||''} onChange={e=>setField('name',e.target.value)} placeholder="Contoh: Usrah Al-Falah"/></label><label>Penerangan<textarea rows={3} value={draft.description||''} onChange={e=>setField('description',e.target.value)} placeholder="Penerangan ringkas kumpulan"/></label></>}
    {type==='member'&&<><div className="member-modal-person"><div className="avatar avatar-gold">{initials(item?.full_name)}</div><div><strong>{item?.full_name}</strong><span>{item?.email}</span></div></div><label>Peranan<select value={draft.role||'member'} onChange={e=>setField('role',e.target.value)}><option value="member">Ahli</option><option value="leader">Ketua Kumpulan</option><option value="admin">Admin — akses penuh</option></select></label><label>Kumpulan usrah<select value={draft.group_id||''} onChange={e=>setField('group_id',e.target.value)}><option value="">Belum ditetapkan</option>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label><label>Status akaun<select value={draft.status||'active'} onChange={e=>setField('status',e.target.value)}><option value="active">Aktif</option><option value="inactive">Tidak aktif</option></select></label><div className="modal-hint"><ShieldCheck size={16}/> Hanya admin boleh mengubah peranan. Berikan peranan admin hanya kepada orang yang dipercayai.</div></>}
    {type==='attendance'&&<><label>Nama sesi<input required value={draft.title||''} onChange={e=>setField('title',e.target.value)} placeholder="Contoh: Usrah Mingguan"/></label><label>Tarikh sesi<input required type="date" value={draft.session_date||''} onChange={e=>setField('session_date',e.target.value)}/></label><label>Kumpulan<select value={draft.group_id||''} onChange={e=>setField('group_id',e.target.value)}><option value="">Semua kumpulan</option>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label><label>Nota / lokasi<textarea rows={3} value={draft.notes||''} onChange={e=>setField('notes',e.target.value)} placeholder="Lokasi, masa atau perkara untuk dibawa…"/></label></>}
    <div className="modal-actions"><button type="button" className="btn btn-light" onClick={onClose}>Batal</button><button className="btn btn-primary" disabled={saving}>{saving?<LoaderCircle size={17} className="spin"/>:<Check size={17}/>} Simpan</button></div>
  </form></section></div>;
}

export default App;
