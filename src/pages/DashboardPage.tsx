import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../providers/AuthProvider';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { requestNotificationPermission, notifyDownloadComplete } from '../utils/notifications';
import toast from 'react-hot-toast';

interface BulletinDoc {
  key: string; trimestre: number; devoir: number;
  label: string; fileName: string; available: boolean; checking: boolean;
}

interface TrimestreGroup {
  trimestre: number; label: string; shortLabel: string;
  color: 'pink' | 'green' | 'orange'; docs: BulletinDoc[]; expanded: boolean;
}

const COLORS = {
  pink:   { accent: '#F33791', light: 'rgba(243,55,145,0.08)', border: 'rgba(243,55,145,0.15)', text: '#F33791', dark: '#C01865', badge: 'rgba(243,55,145,0.1)', badgeText: '#F33791' },
  green:  { accent: '#336907', light: 'rgba(51,105,7,0.08)',   border: 'rgba(51,105,7,0.15)',   text: '#336907', dark: '#254e05', badge: 'rgba(51,105,7,0.1)',   badgeText: '#336907' },
  orange: { accent: '#FF6B35', light: 'rgba(255,107,53,0.08)', border: 'rgba(255,107,53,0.15)', text: '#FF6B35', dark: '#e05a25', badge: 'rgba(255,107,53,0.1)', badgeText: '#FF6B35' },
};

const Spinner = ({ color = '#F33791' }: { color?: string }) => (
  <div className="w-4 h-4 rounded-full border-2 border-gray-200 animate-spin flex-shrink-0" style={{ borderTopColor: color }} />
);

// ── Individual bulletin row ────────────────────────────────────────────────
const BulletinRow = ({ doc, c, isDownloading, onDownload, index }: {
  doc: BulletinDoc; c: typeof COLORS['pink']; isDownloading: boolean; onDownload: (d: BulletinDoc) => void; index: number;
}) => {
  const busy = isDownloading || doc.checking;
  return (
    <motion.div
      className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
      style={{
        background: doc.available ? c.light : 'rgba(0,0,0,0.02)',
        border: `1px solid ${doc.available ? c.border : 'rgba(0,0,0,0.06)'}`,
      }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      whileHover={doc.available ? { scale: 1.01, y: -1 } : {}}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
          style={{ background: doc.available ? c.badge : 'rgba(0,0,0,0.04)' }}>
          <span className="text-lg">{doc.devoir === 1 ? '📄' : '📋'}</span>
          <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-[#FF6B35] text-white px-1 rounded-sm leading-4">PDF</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-[#1A1A1A] text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>{doc.label}</p>
            {doc.available && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: c.badge, color: c.text }}>✓ Dispo</motion.span>
            )}
          </div>
          <p className="text-[10px] text-[#A3A7A1] font-mono truncate mt-0.5">{doc.fileName}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {doc.checking ? <Spinner color={c.accent} /> : !doc.available && (
          <span className="hidden sm:block text-[10px] font-medium text-[#A3A7A1] px-2 py-1 rounded-full bg-gray-100">En attente</span>
        )}
        <motion.button
          onClick={() => !busy && doc.available && onDownload(doc)}
          disabled={busy || !doc.available}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-35 disabled:cursor-not-allowed"
          style={{
            background: doc.available ? `linear-gradient(135deg, ${c.accent}, ${c.dark})` : '#E8E8E8',
            boxShadow: doc.available ? `0 4px 12px ${c.accent}40` : 'none',
            fontFamily: 'Sora, sans-serif',
          }}
          whileHover={!busy && doc.available ? { scale: 1.06, y: -1 } : {}}
          whileTap={!busy && doc.available ? { scale: 0.94 } : {}}
        >
          {isDownloading ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <motion.svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              animate={doc.available ? { y: [0, 2, 0] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </motion.svg>
          )}
          <span className="hidden sm:inline">{isDownloading ? 'Téléch…' : 'Télécharger'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// ── Trimestre card ────────────────────────────────────────────────────────
const TrimestreCard = ({ group, downloadingKey, onDownload, onToggle, cardIndex }: {
  group: TrimestreGroup; downloadingKey: string | null;
  onDownload: (d: BulletinDoc) => void; onToggle: (t: number) => void; cardIndex: number;
}) => {
  const c = COLORS[group.color];
  const available = group.docs.filter(d => d.available).length;
  const total = group.docs.length;
  const checking = group.docs.some(d => d.checking);

  return (
    <motion.div
      className="rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.95)',
        border: `1px solid ${group.expanded ? c.border : 'rgba(0,0,0,0.06)'}`,
        boxShadow: group.expanded
          ? `0 4px 24px ${c.accent}18, 0 16px 48px rgba(0,0,0,0.06)`
          : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.3s, border-color 0.3s',
      }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 * cardIndex }}
    >
      {/* Header */}
      <motion.button
        onClick={() => onToggle(group.trimestre)}
        className="w-full px-5 py-4 flex items-center justify-between"
        style={{ background: group.expanded ? c.light : 'transparent' }}
        whileHover={{ background: c.light }} whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center gap-4">
          {/* Trimestre number */}
          <div className="relative">
            <div
              className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${c.accent}, ${c.dark})`,
                boxShadow: `0 4px 12px ${c.accent}40`,
              }}
            >
              <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">Trim.</span>
              <span className="text-xl font-black text-white leading-none">{group.trimestre}</span>
            </div>
            {available === total && total > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#336907] flex items-center justify-center"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
              >
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
          </div>

          <div className="text-left">
            <h3 className="font-bold text-[#1A1A1A] text-base" style={{ fontFamily: 'Sora, sans-serif' }}>{group.label}</h3>
            {/* Mini progress */}
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${c.accent}, ${c.dark})` }}
                  initial={{ width: 0 }} animate={{ width: `${(available / total) * 100}%` }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }} />
              </div>
              <span className="text-xs font-bold" style={{ color: c.text, fontFamily: 'Sora, sans-serif' }}>{available}/{total}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {checking ? <Spinner color={c.accent} /> : available === total && total > 0 ? (
            <motion.span className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full text-white"
              style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.dark})` }}
              animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              ✓ Complet
            </motion.span>
          ) : available > 0 ? (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full" style={{ background: c.badge, color: c.text }}>Partiel</span>
          ) : (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-400">En attente</span>
          )}

          <motion.div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: c.badge, color: c.text }}
            animate={{ rotate: group.expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {group.expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 pt-2 space-y-2.5">
              {/* Divider */}
              <div className="h-px" style={{ background: `linear-gradient(90deg, ${c.accent}30, transparent)` }} />
              {group.docs.map((doc, i) => (
                <BulletinRow key={doc.key} doc={doc} c={c} isDownloading={downloadingKey === doc.key} onDownload={onDownload} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── InfoCard ─────────────────────────────────────────────────────────────
const InfoCard = ({ icon, label, value, color = 'pink', delay = 0 }: {
  icon: React.ReactNode; label: string; value: string;
  color?: 'pink' | 'green' | 'orange' | 'gray'; delay?: number;
}) => {
  const palette = {
    pink:   { bg: 'rgba(243,55,145,0.07)', text: '#F33791', border: 'rgba(243,55,145,0.12)' },
    green:  { bg: 'rgba(51,105,7,0.07)',   text: '#336907', border: 'rgba(51,105,7,0.12)'   },
    orange: { bg: 'rgba(255,107,53,0.07)', text: '#FF6B35', border: 'rgba(255,107,53,0.12)' },
    gray:   { bg: 'rgba(163,167,161,0.07)',text: '#A3A7A1', border: 'rgba(163,167,161,0.12)'},
  };
  const p = palette[color];
  return (
    <motion.div
      className="p-4 rounded-2xl"
      style={{ background: p.bg, border: `1px solid ${p.border}` }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: p.bg, color: p.text, border: `1px solid ${p.border}` }}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A3A7A1] mb-0.5" style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.07em' }}>{label}</p>
          <p className="text-sm font-semibold text-[#1A1A1A] leading-tight" style={{ fontFamily: 'Sora, sans-serif', wordBreak: 'break-word' }}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ── Global stats bar ──────────────────────────────────────────────────────
const StatsBar = ({ groups }: { groups: TrimestreGroup[] }) => {
  const total = groups.reduce((s, g) => s + g.docs.length, 0);
  const available = groups.reduce((s, g) => s + g.docs.filter(d => d.available).length, 0);
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;

  return (
    <motion.div
      className="rounded-2xl p-4 flex items-center gap-4"
      style={{
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#1A1A1A]" style={{ fontFamily: 'Sora, sans-serif' }}>Progression globale des bulletins</span>
          <span className="text-xs font-bold text-[#F33791]" style={{ fontFamily: 'Sora, sans-serif' }}>{available} / {total} disponibles</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #F33791, #FF6B35, #336907)' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(243,55,145,0.07)', border: '1px solid rgba(243,55,145,0.12)' }}>
        <span className="text-sm font-black text-[#F33791]" style={{ fontFamily: 'Sora, sans-serif' }}>{pct}%</span>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
export function DashboardPage() {
  const { student, logout } = useAuth();
  const [groups, setGroups] = useState<TrimestreGroup[]>([]);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (!student) return;
    const STRUCTURE = [
      { trimestre: 1, label: '1er Trimestre', shortLabel: 'T1', color: 'pink' as const },
      { trimestre: 2, label: '2ème Trimestre', shortLabel: 'T2', color: 'green' as const },
      { trimestre: 3, label: '3ème Trimestre', shortLabel: 'T3', color: 'orange' as const },
    ];
    const initial: TrimestreGroup[] = STRUCTURE.map((t, ti) => ({
      ...t, expanded: ti === 0,
      docs: [1, 2].map(d => ({
        key: `${t.shortLabel}-${d}`, trimestre: t.trimestre, devoir: d,
        label: `Devoir ${d} — ${t.label}`,
        fileName: `${student.id}_${t.shortLabel}-${d}_bulletin.pdf`,
        available: false, checking: true,
      })),
    }));
    setGroups(initial);
    STRUCTURE.forEach(t => {
      [1, 2].forEach(async d => {
        const key = `${t.shortLabel}-${d}`;
        const fileName = `${student.id}_${t.shortLabel}-${d}_bulletin.pdf`;
        try {
          const res = await fetch(`/bulletins/${fileName}`, { method: 'HEAD' });
          setGroups(prev => prev.map(g => g.trimestre === t.trimestre
            ? { ...g, docs: g.docs.map(doc => doc.key === key ? { ...doc, available: res.ok, checking: false } : doc) }
            : g));
        } catch {
          setGroups(prev => prev.map(g => g.trimestre === t.trimestre
            ? { ...g, docs: g.docs.map(doc => doc.key === key ? { ...doc, available: false, checking: false } : doc) }
            : g));
        }
      });
    });
  }, [student]);

  useEffect(() => {
    if ('Notification' in window) setNotificationsEnabled(Notification.permission === 'granted');
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) toast.success('Notifications activées !');
    else toast.error('Notifications refusées');
  };

  const handleToggle = useCallback((trimestre: number) => {
    setGroups(prev => prev.map(g => g.trimestre === trimestre ? { ...g, expanded: !g.expanded } : g));
  }, []);

  const handleDownload = useCallback(async (doc: BulletinDoc) => {
    if (!student || downloadingKey) return;
    setDownloadingKey(doc.key);
    try {
      await new Promise(r => setTimeout(r, 700));
      const link = document.createElement('a');
      link.href = `/bulletins/${doc.fileName}`;
      const name = `Bulletin_${student.id}_${student.fullName.replace(/\s+/g, '_')}_${doc.key}_2025-2026.pdf`;
      link.download = name;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      toast.success(`${doc.label} téléchargé ! 🎉`);
      if (notificationsEnabled) notifyDownloadComplete(name);
    } catch {
      toast.error('Erreur lors du téléchargement.');
    } finally {
      setDownloadingKey(null);
    }
  }, [student, downloadingKey, notificationsEnabled]);

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#FAFAF8' }}>
        <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-[#F33791] animate-spin" />
        <p className="text-[#A3A7A1] text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Chargement…</p>
      </div>
    );
  }

  const totalAvailable = groups.reduce((s, g) => s + g.docs.filter(d => d.available).length, 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAFAF8' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full orb-1"
          style={{ background: 'radial-gradient(circle, rgba(243,55,145,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full orb-2"
          style={{ background: 'radial-gradient(circle, rgba(51,105,7,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: 'linear-gradient(rgba(243,55,145,1) 1px, transparent 1px), linear-gradient(90deg, rgba(243,55,145,1) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }} />
      </div>

      <Header />

      <main className="flex-1 relative z-10 py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Welcome */}
          <motion.div className="text-center mb-2"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.4, 0, 0.2, 1] }}>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
              style={{ background: 'rgba(51,105,7,0.07)', border: '1px solid rgba(51,105,7,0.12)' }}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="text-lg">👋</motion.span>
              <span className="text-xs font-semibold text-[#336907]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Espace parents — Secureway</span>
            </motion.div>
            <motion.h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]"
              style={{ fontFamily: 'Sora, sans-serif' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              Bonjour, <span style={{ color: '#F33791' }}>{student.parentName}</span>
            </motion.h1>
            <motion.p className="mt-1 text-sm text-[#A3A7A1]" style={{ fontFamily: 'DM Sans, sans-serif' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              Consultez et téléchargez les bulletins de votre enfant
            </motion.p>
          </motion.div>

          {/* Notification banner */}
          {!notificationsEnabled && 'Notification' in window && (
            <motion.button onClick={handleEnableNotifications}
              className="w-full p-3.5 rounded-2xl flex items-center justify-center gap-3 transition-colors"
              style={{
                background: 'rgba(255,215,0,0.08)',
                border: '1px solid rgba(255,215,0,0.25)',
              }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.01, background: 'rgba(255,215,0,0.12)' }} whileTap={{ scale: 0.99 }}>
              <span className="text-lg">🔔</span>
              <span className="text-sm font-medium text-[#1A1A1A]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Activer les notifications — être alerté à la mise en ligne d'un bulletin
              </span>
            </motion.button>
          )}

          {/* Student card */}
          <motion.div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.97)',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.04)',
            }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            {/* Dark hero header */}
            <div
              className="relative px-5 py-5 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0F0F0E 0%, #1E1E1C 50%, #0D1A06 100%)' }}
            >
              {/* Decorative glows */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(243,55,145,0.15) 0%, transparent 70%)', filter: 'blur(30px)', transform: 'translate(30%, -30%)' }} />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(51,105,7,0.2) 0%, transparent 70%)', filter: 'blur(25px)', transform: 'translate(-30%, 30%)' }} />

              <div className="flex items-center gap-4 relative z-10">
                <motion.div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
                  whileHover={{ scale: 1.08, rotate: 5 }} whileTap={{ scale: 0.95 }}
                >
                  <span className="text-3xl">{student.gender === 'F' ? '👩‍🎓' : '👨‍🎓'}</span>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white leading-tight break-words" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {student.fullName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full text-white"
                      style={{ background: 'linear-gradient(135deg, #F33791, #C01865)' }}>{student.classe}</span>
                    <span className="text-white/40 text-xs font-mono">{student.id}</span>
                  </div>
                </div>
                <motion.div
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl flex-shrink-0"
                  style={{ background: 'rgba(51,105,7,0.25)', border: '1px solid rgba(51,105,7,0.3)' }}
                  animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-green-400 font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>Vérifié</span>
                </motion.div>
              </div>
            </div>

            {/* Info grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
              <InfoCard
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                label="Parent / Tuteur" value={student.parentName} color="pink" delay={0.3}
              />
              <InfoCard
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                label="Classe" value={student.classe} color="green" delay={0.35}
              />
              <InfoCard
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                label="Année scolaire" value="2025 – 2026" color="orange" delay={0.4}
              />
              <InfoCard
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                label="Bulletins reçus" value={`${totalAvailable} / 6`} color="gray" delay={0.45}
              />
            </div>
          </motion.div>

          {/* Stats bar */}
          {groups.length > 0 && <StatsBar groups={groups} />}

          {/* Section title */}
          <motion.div className="flex items-center gap-3 pt-1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(243,55,145,0.08)', border: '1px solid rgba(243,55,145,0.12)' }}>
              <svg className="w-4 h-4 text-[#F33791]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-[#1A1A1A] text-base" style={{ fontFamily: 'Sora, sans-serif' }}>Bulletins scolaires</h2>
              <p className="text-xs text-[#A3A7A1]" style={{ fontFamily: 'DM Sans, sans-serif' }}>2 devoirs par trimestre · Cliquez pour déplier</p>
            </div>
          </motion.div>

          {/* Trimestre cards */}
          <div className="space-y-3">
            {groups.map((group, i) => (
              <TrimestreCard key={group.trimestre} group={group} downloadingKey={downloadingKey}
                onDownload={handleDownload} onToggle={handleToggle} cardIndex={i} />
            ))}
          </div>

          {/* Security footer */}
          <motion.div className="flex items-center justify-center gap-2 py-2 text-xs text-[#A3A7A1]"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            <svg className="w-3.5 h-3.5 text-[#336907]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0117.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Documents officiels · Accès personnel et confidentiel
          </motion.div>

          {/* Logout */}
          <motion.div className="text-center pb-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <motion.button onClick={logout}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-[#A3A7A1] rounded-xl transition-colors"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
              whileHover={{ scale: 1.02, color: '#F33791', background: 'rgba(243,55,145,0.05)' }}
              whileTap={{ scale: 0.98 }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </motion.button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
