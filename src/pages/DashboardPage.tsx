import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../providers/AuthProvider';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { requestNotificationPermission, notifyDownloadComplete } from '../utils/notifications';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface BulletinDoc {
  key: string;         // unique key  e.g. "T1-1"
  trimestre: number;   // 1 | 2 | 3
  devoir: number;      // 1 | 2
  label: string;       // "Devoir 1"
  fileName: string;    // "CE1-001_T1-1_bulletin.pdf"
  available: boolean;
  checking: boolean;
}

interface TrimestreGroup {
  trimestre: number;
  label: string;        // "1er Trimestre"
  shortLabel: string;   // "T1"
  color: 'pink' | 'green' | 'orange';
  docs: BulletinDoc[];
  expanded: boolean;
}

// ─── Color palette per trimestre ──────────────────────────────────────────────
const TRIM_COLORS = {
  pink:   {
    bg: 'bg-[#F33791]/10', text: 'text-[#F33791]', border: 'border-[#F33791]/25',
    badge: 'bg-[#F33791] text-white', btn: 'bg-[#F33791] hover:bg-[#d42e7e]',
    header: 'from-[#F33791]/15 to-[#F33791]/5', dot: 'bg-[#F33791]',
    progress: 'bg-[#F33791]', light: 'bg-[#F33791]/8',
  },
  green:  {
    bg: 'bg-[#336907]/10', text: 'text-[#336907]', border: 'border-[#336907]/25',
    badge: 'bg-[#336907] text-white', btn: 'bg-[#336907] hover:bg-[#254e05]',
    header: 'from-[#336907]/15 to-[#336907]/5', dot: 'bg-[#336907]',
    progress: 'bg-[#336907]', light: 'bg-[#336907]/8',
  },
  orange: {
    bg: 'bg-[#FF6B35]/10', text: 'text-[#FF6B35]', border: 'border-[#FF6B35]/25',
    badge: 'bg-[#FF6B35] text-white', btn: 'bg-[#FF6B35] hover:bg-[#e05a25]',
    header: 'from-[#FF6B35]/15 to-[#FF6B35]/5', dot: 'bg-[#FF6B35]',
    progress: 'bg-[#FF6B35]', light: 'bg-[#FF6B35]/8',
  },
};

// ─── Small helpers ────────────────────────────────────────────────────────────
const AnimatedIcon = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    animate={{ y: [0, -3, 0], rotate: [0, 3, -3, 0] }}
    transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeInOut' }}
    className="gpu-accelerated"
  >{children}</motion.div>
);

const Spinner = ({ color = '#F33791' }: { color?: string }) => (
  <div
    className="w-4 h-4 rounded-full border-2 border-gray-200 animate-spin flex-shrink-0"
    style={{ borderTopColor: color }}
  />
);

// ─── Progress bar for a trimestre ────────────────────────────────────────────
const TrimProgress = ({ available, total, color }: { available: number; total: number; color: typeof TRIM_COLORS['pink'] }) => (
  <div className="flex items-center gap-2">
    <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color.progress}`}
        initial={{ width: 0 }}
        animate={{ width: `${(available / total) * 100}%` }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
    <span className={`text-xs font-semibold ${color.text}`}>{available}/{total}</span>
  </div>
);

// ─── Individual bulletin row ──────────────────────────────────────────────────
const BulletinRow = ({
  doc, color, isDownloading, onDownload, index,
}: {
  doc: BulletinDoc;
  color: typeof TRIM_COLORS['pink'];
  isDownloading: boolean;
  onDownload: (doc: BulletinDoc) => void;
  index: number;
}) => {
  const devoirEmoji = doc.devoir === 1 ? '📄' : '📋';
  const busy = isDownloading || doc.checking;

  return (
    <motion.div
      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border ${color.border} ${color.light} gpu-accelerated`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, ease: [0.4, 0, 0.2, 1] }}
      whileHover={doc.available ? { scale: 1.01 } : {}}
    >
      {/* Left: icon + info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center flex-shrink-0 relative`}>
          <span className="text-lg">{devoirEmoji}</span>
          <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-[#FF6B35] text-white px-1 rounded-sm">PDF</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-[#1A1A1A] text-sm">{doc.label}</p>
            {doc.available && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-[#336907] text-xs"
              >✓</motion.span>
            )}
          </div>
          <p className="text-[10px] text-[#A3A7A1] font-mono truncate mt-0.5">{doc.fileName}</p>
        </div>
      </div>

      {/* Right: status + button */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {doc.checking ? (
          <Spinner color={color.dot.replace('bg-', '#').replace('[', '').replace(']', '')} />
        ) : doc.available ? (
          <span className={`hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full ${color.badge}`}>
            Disponible
          </span>
        ) : (
          <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-400">
            En attente
          </span>
        )}

        <motion.button
          onClick={() => !busy && doc.available && onDownload(doc)}
          disabled={busy || !doc.available}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${color.btn}`}
          whileHover={!busy && doc.available ? { scale: 1.06 } : {}}
          whileTap={!busy && doc.available ? { scale: 0.94 } : {}}
        >
          {isDownloading ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <motion.svg
              className="w-3.5 h-3.5"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              animate={doc.available ? { y: [0, 2, 0] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </motion.svg>
          )}
          <span className="hidden sm:inline">{isDownloading ? 'Téléchargement...' : 'Télécharger'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Trimestre accordion card ─────────────────────────────────────────────────
const TrimestreCard = ({
  group, downloadingKey, onDownload, onToggle, cardIndex,
}: {
  group: TrimestreGroup;
  downloadingKey: string | null;
  onDownload: (doc: BulletinDoc) => void;
  onToggle: (t: number) => void;
  cardIndex: number;
}) => {
  const c = TRIM_COLORS[group.color];
  const available = group.docs.filter(d => d.available).length;
  const total = group.docs.length;
  const allReady = available === total;
  const checking = group.docs.some(d => d.checking);

  return (
    <motion.div
      className={`rounded-3xl border ${c.border} overflow-hidden gpu-accelerated bg-white shadow-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 * cardIndex, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* ── Card header (clickable) ── */}
      <motion.button
        onClick={() => onToggle(group.trimestre)}
        className={`w-full bg-gradient-to-r ${c.header} px-5 py-4 flex items-center justify-between`}
        whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-4">
          {/* Trimestre badge */}
          <div className={`w-12 h-12 rounded-2xl ${c.bg} ${c.text} flex flex-col items-center justify-center flex-shrink-0`}>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Trim.</span>
            <span className="text-xl font-black leading-none">{group.trimestre}</span>
          </div>

          <div className="text-left">
            <h3 className={`font-bold text-base text-[#1A1A1A]`}>{group.label}</h3>
            <div className="mt-1">
              <TrimProgress available={available} total={total} color={c} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status pill */}
          {checking ? (
            <Spinner />
          ) : allReady ? (
            <motion.span
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${c.badge}`}
              animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity }}
            >
              <span>✓</span> Complet
            </motion.span>
          ) : available > 0 ? (
            <span className={`hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${c.badge} opacity-80`}>
              Partiel
            </span>
          ) : (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-400">
              En attente
            </span>
          )}

          {/* Chevron */}
          <motion.div
            animate={{ rotate: group.expanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className={`w-8 h-8 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.button>

      {/* ── Expandable content ── */}
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
            <div className="px-5 pb-5 pt-3 space-y-3">
              {group.docs.map((doc, i) => (
                <BulletinRow
                  key={doc.key}
                  doc={doc}
                  color={c}
                  isDownloading={downloadingKey === doc.key}
                  onDownload={onDownload}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── InfoCard ─────────────────────────────────────────────────────────────────
const InfoCard = ({ icon, label, value, color = 'pink', delay = 0 }: {
  icon: React.ReactNode; label: string; value: string;
  color?: 'pink' | 'green' | 'orange' | 'gray'; delay?: number;
}) => {
  const colors = {
    pink:   { bg: 'bg-[#F33791]/10', text: 'text-[#F33791]', border: 'border-[#F33791]/20' },
    green:  { bg: 'bg-[#336907]/10', text: 'text-[#336907]', border: 'border-[#336907]/20' },
    orange: { bg: 'bg-[#FF6B35]/10', text: 'text-[#FF6B35]', border: 'border-[#FF6B35]/20' },
    gray:   { bg: 'bg-[#A3A7A1]/10', text: 'text-[#A3A7A1]', border: 'border-[#A3A7A1]/20' },
  };
  return (
    <motion.div
      className={`p-4 rounded-2xl border ${colors[color].border} ${colors[color].bg} hover:shadow-md gpu-accelerated`}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${colors[color].bg} ${colors[color].text} flex items-center justify-center flex-shrink-0`}>
          <AnimatedIcon delay={delay}>{icon}</AnimatedIcon>
        </div>
        <div>
          <p className="text-xs text-[#A3A7A1] font-medium uppercase tracking-wide">{label}</p>
          <p className="text-[#1A1A1A] font-semibold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Global stats bar ────────────────────────────────────────────────────────
const StatsBar = ({ groups }: { groups: TrimestreGroup[] }) => {
  const total = groups.reduce((s, g) => s + g.docs.length, 0);
  const available = groups.reduce((s, g) => s + g.docs.filter(d => d.available).length, 0);
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;

  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#ECEBEC] p-4 flex items-center gap-4"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-[#1A1A1A]">Progression globale des bulletins</span>
          <span className="text-xs font-bold text-[#F33791]">{available} / {total} disponibles</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#F33791] via-[#FF6B35] to-[#336907]"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#F33791]/10 flex items-center justify-center">
        <span className="text-sm font-black text-[#F33791]">{pct}%</span>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export function DashboardPage() {
  const { student, logout } = useAuth();
  const [groups, setGroups] = useState<TrimestreGroup[]>([]);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // ── Build structure & check availability ──────────────────────────────────
  useEffect(() => {
    if (!student) return;

    const STRUCTURE: { trimestre: number; label: string; shortLabel: string; color: 'pink' | 'green' | 'orange' }[] = [
      { trimestre: 1, label: '1er Trimestre', shortLabel: 'T1', color: 'pink' },
      { trimestre: 2, label: '2ème Trimestre', shortLabel: 'T2', color: 'green' },
      { trimestre: 3, label: '3ème Trimestre', shortLabel: 'T3', color: 'orange' },
    ];

    const initial: TrimestreGroup[] = STRUCTURE.map((t, ti) => ({
      ...t,
      expanded: ti === 0, // open first trimestre by default
      docs: [1, 2].map(d => ({
        key: `${t.shortLabel}-${d}`,
        trimestre: t.trimestre,
        devoir: d,
        label: `Devoir ${d} — ${t.label}`,
        fileName: `${student.id}_${t.shortLabel}-${d}_bulletin.pdf`,
        available: false,
        checking: true,
      })),
    }));

    setGroups(initial);

    // Check each PDF file in parallel
    STRUCTURE.forEach(t => {
      [1, 2].forEach(async d => {
        const key = `${t.shortLabel}-${d}`;
        const fileName = `${student.id}_${t.shortLabel}-${d}_bulletin.pdf`;
        try {
          const res = await fetch(`/bulletins/${fileName}`, { method: 'HEAD' });
          setGroups(prev => prev.map(g =>
            g.trimestre === t.trimestre
              ? { ...g, docs: g.docs.map(doc => doc.key === key ? { ...doc, available: res.ok, checking: false } : doc) }
              : g
          ));
        } catch {
          setGroups(prev => prev.map(g =>
            g.trimestre === t.trimestre
              ? { ...g, docs: g.docs.map(doc => doc.key === key ? { ...doc, available: false, checking: false } : doc) }
              : g
          ));
        }
      });
    });
  }, [student]);

  // ── Notifications ─────────────────────────────────────────────────────────
  useEffect(() => {
    if ('Notification' in window) setNotificationsEnabled(Notification.permission === 'granted');
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) toast.success('Notifications activées !');
    else toast.error('Notifications refusées');
  };

  // ── Accordion toggle ──────────────────────────────────────────────────────
  const handleToggle = useCallback((trimestre: number) => {
    setGroups(prev => prev.map(g => g.trimestre === trimestre ? { ...g, expanded: !g.expanded } : g));
  }, []);

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = useCallback(async (doc: BulletinDoc) => {
    if (!student || downloadingKey) return;
    setDownloadingKey(doc.key);
    try {
      await new Promise(r => setTimeout(r, 700));
      const link = document.createElement('a');
      link.href = `/bulletins/${doc.fileName}`;
      const name = `Bulletin_${student.id}_${student.fullName.replace(/\s+/g, '_')}_${doc.key}_2025-2026.pdf`;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${doc.label} téléchargé ! 🎉`);
      if (notificationsEnabled) notifyDownloadComplete(name);
    } catch {
      toast.error('Erreur lors du téléchargement.');
    } finally {
      setDownloadingKey(null);
    }
  }, [student, downloadingKey, notificationsEnabled]);

  // ── Loading guard ─────────────────────────────────────────────────────────
  if (!student) {
    return (
      <div className="min-h-screen bg-[#FDFEFE] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-[#ECEBEC] border-t-[#F33791] animate-spin" />
        <p className="text-[#A3A7A1]">Chargement...</p>
      </div>
    );
  }

  const totalAvailable = groups.reduce((s, g) => s + g.docs.filter(d => d.available).length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFEFE]">
      {/* ── Background orbs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#F33791]/4 gpu-accelerated"
          animate={{ scale: [1, 1.12, 1], rotate: [0, 90, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#336907]/4 gpu-accelerated"
          animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 17, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#FF6B35]/2 gpu-accelerated"
          animate={{ scale: [1, 1.08, 1], rotate: [0, -45, 0] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
      </div>

      <Header />

      <main className="flex-1 relative z-10 py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* ── Welcome ── */}
          <motion.div className="text-center"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.4, 0, 0.2, 1] }}>
            <motion.div className="inline-flex items-center gap-2 px-4 py-2 bg-[#336907]/10 rounded-full mb-3"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-xl">👋</motion.span>
              <span className="text-sm font-medium text-[#336907]">Espace parents — Secureway</span>
            </motion.div>
            <motion.h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              Bonjour, <span className="text-[#F33791]">{student.parentName}</span>
            </motion.h1>
            <motion.p className="mt-1 text-sm text-[#A3A7A1]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              Consultez et téléchargez tous les bulletins de votre enfant
            </motion.p>
          </motion.div>

          {/* ── Notification banner ── */}
          {!notificationsEnabled && 'Notification' in window && (
            <motion.button onClick={handleEnableNotifications}
              className="w-full p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#FFD700]/20 transition-colors"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <span className="text-xl">🔔</span>
              <span className="text-sm font-medium text-[#1A1A1A]">
                Activer les notifications — être alerté à la mise en ligne d'un nouveau bulletin
              </span>
            </motion.button>
          )}

          {/* ── Student card ── */}
          <motion.div className="bg-white rounded-3xl shadow-lg border border-[#ECEBEC] overflow-hidden gpu-accelerated"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: [0.4, 0, 0.2, 1] }}>
            {/* Dark header */}
            <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2D2D2D] px-5 py-5">
              <div className="flex items-center gap-4">
                <motion.div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.06, rotate: 5 }} whileTap={{ scale: 0.95 }}>
                  <span className="text-3xl">{student.gender === 'F' ? '👩‍🎓' : '👨‍🎓'}</span>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white leading-tight break-words">{student.fullName}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-[#F33791] text-white text-xs font-bold rounded-full">{student.classe}</span>
                    <span className="text-white/50 text-xs font-mono">{student.id}</span>
                  </div>
                </div>
                <motion.div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#336907] rounded-xl flex-shrink-0"
                  animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-white font-semibold">Vérifié</span>
                </motion.div>
              </div>
            </div>

            {/* Info grid */}
            <div className="p-5 grid grid-cols-2 gap-3">
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

          {/* ── Global progress bar ── */}
          {groups.length > 0 && <StatsBar groups={groups} />}

          {/* ── Section title ── */}
          <motion.div className="flex items-center gap-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
            <div className="w-8 h-8 rounded-xl bg-[#F33791]/10 flex items-center justify-center">
              <AnimatedIcon>
                <svg className="w-4 h-4 text-[#F33791]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </AnimatedIcon>
            </div>
            <div>
              <h2 className="font-bold text-[#1A1A1A] text-base">Bulletins scolaires</h2>
              <p className="text-xs text-[#A3A7A1]">2 devoirs par trimestre · Cliquez pour déplier</p>
            </div>
          </motion.div>

          {/* ── Trimestre accordion cards ── */}
          <div className="space-y-3">
            {groups.map((group, i) => (
              <TrimestreCard
                key={group.trimestre}
                group={group}
                downloadingKey={downloadingKey}
                onDownload={handleDownload}
                onToggle={handleToggle}
                cardIndex={i}
              />
            ))}
          </div>

          {/* ── Security footer ── */}
          <motion.div className="flex items-center justify-center gap-2 py-2 text-xs text-[#A3A7A1]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            <svg className="w-3.5 h-3.5 text-[#336907]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Documents officiels · Accès personnel et confidentiel
          </motion.div>

          {/* ── Logout ── */}
          <motion.div className="text-center pb-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <motion.button onClick={logout}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-[#A3A7A1] hover:text-[#F33791] hover:bg-[#F33791]/5 rounded-xl transition-colors"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
