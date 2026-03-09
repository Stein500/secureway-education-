import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../providers/AuthProvider';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { requestNotificationPermission, notifyDownloadComplete } from '../utils/notifications';
import toast from 'react-hot-toast';

/* ─── Types ─────────────────────────────────────────────── */
interface BulletinDoc {
  key: string; trimestre: number; devoir: number;
  label: string; fileName: string; available: boolean; checking: boolean;
}
interface TrimestreGroup {
  trimestre: number; label: string; shortLabel: string;
  color: 'rose' | 'vert' | 'orange'; docs: BulletinDoc[]; expanded: boolean;
}

/* ─── Palettes ───────────────────────────────────────────── */
const PAL = {
  rose:   { accent: '#F33791', dark: '#C8116A', light: '#FFE8F3', border: 'rgba(243,55,145,0.14)', text: '#C8116A' },
  vert:   { accent: '#336907', dark: '#204205', light: '#E8F5E0', border: 'rgba(51,105,7,0.14)',   text: '#204205' },
  orange: { accent: '#E06B20', dark: '#B85218', light: '#FFF1E8', border: 'rgba(224,107,32,0.14)', text: '#8B3A10' },
};

const Spinner = ({ color }: { color: string }) => (
  <div className="w-4 h-4 rounded-full border-2 border-gray-200 animate-spin flex-shrink-0"
    style={{ borderTopColor: color, willChange: 'transform' }} />
);

/* ─── Bulletin row ───────────────────────────────────────── */
const BulletinRow = ({ doc, p, isDownloading, onDownload, idx }: {
  doc: BulletinDoc; p: typeof PAL.rose; isDownloading: boolean;
  onDownload: (d: BulletinDoc) => void; idx: number;
}) => {
  const busy = isDownloading || doc.checking;
  return (
    <motion.div
      className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
      style={{
        background: doc.available ? p.light : 'rgba(12,12,11,0.025)',
        border: `1px solid ${doc.available ? p.border : 'rgba(12,12,11,0.07)'}`,
      }}
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={doc.available ? { scale: 1.01, y: -1 } : {}}
    >
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 relative"
          style={{ background: doc.available ? 'rgba(255,255,255,0.9)' : 'rgba(12,12,11,0.04)', border: `1px solid ${p.border}` }}>
          <span className="text-base leading-none">{doc.devoir === 1 ? '📄' : '📋'}</span>
          <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold text-white px-1 rounded leading-[13px]"
            style={{ background: '#E06B20' }}>PDF</span>
        </div>
        <div className="min-w-0">
          <p style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 13, color: '#0C0C0B', marginBottom: 2 }}>
            {doc.label}
          </p>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 10, color: '#7A7A74', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
            {doc.fileName}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {doc.checking ? <Spinner color={p.accent} /> : !doc.available && (
          <span className="pill pill-pierre hidden sm:inline-flex">En attente</span>
        )}
        <motion.button
          onClick={() => !busy && doc.available && onDownload(doc)}
          disabled={busy || !doc.available}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-[12px] text-white font-bold disabled:opacity-35 disabled:cursor-not-allowed relative overflow-hidden"
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 12,
            background: doc.available ? `linear-gradient(135deg, ${p.accent}, ${p.dark})` : '#DCDCD8',
            boxShadow: doc.available ? `0 4px 14px ${p.accent}38` : 'none',
            color: doc.available ? '#FFFFFF' : '#7A7A74',
          }}
          whileHover={!busy && doc.available ? { scale: 1.06, y: -1 } : {}}
          whileTap={!busy && doc.available ? { scale: 0.94 } : {}}
        >
          {isDownloading ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <motion.svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              animate={doc.available ? { y: [0, 2, 0] } : {}}
              transition={{ duration: 1.8, repeat: Infinity }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </motion.svg>
          )}
          <span className="hidden sm:inline">{isDownloading ? 'Téléch…' : 'Télécharger'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

/* ─── Trimestre card ─────────────────────────────────────── */
const TriCard = ({ group, dlKey, onDownload, onToggle, idx }: {
  group: TrimestreGroup; dlKey: string | null;
  onDownload: (d: BulletinDoc) => void; onToggle: (t: number) => void; idx: number;
}) => {
  const p = PAL[group.color];
  const avail = group.docs.filter(d => d.available).length;
  const total = group.docs.length;
  const checking = group.docs.some(d => d.checking);
  const complete = avail === total && total > 0;

  return (
    <motion.div
      className="rounded-[24px] overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${group.expanded ? p.border : 'rgba(12,12,11,0.07)'}`,
        boxShadow: group.expanded
          ? `0 0 0 1px ${p.border}, 0 8px 28px ${p.accent}18, 0 20px 52px rgba(0,0,0,0.05)`
          : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.35s ease, border-color 0.35s ease',
      }}
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * idx, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Accent top bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${p.accent}, ${p.dark}, transparent)` }} />

      {/* Header */}
      <motion.button
        onClick={() => onToggle(group.trimestre)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
        style={{ background: group.expanded ? `${p.light}80` : 'transparent', transition: 'background 0.25s' }}
        whileHover={{ background: `${p.light}90` }} whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center gap-4">
          {/* Number badge */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-[16px] flex flex-col items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${p.accent}, ${p.dark})`,
                boxShadow: `0 4px 14px ${p.accent}38`,
              }}>
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Trim.</span>
              <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: 22, color: '#FFFFFF', lineHeight: 1 }}>{group.trimestre}</span>
            </div>
            {complete && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: '#336907', border: '2px solid #FFFFFF', boxShadow: '0 2px 6px rgba(51,105,7,0.4)' }}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
          </div>

          {/* Label + progress */}
          <div className="text-left">
            <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 15, color: '#0C0C0B', marginBottom: 6 }}>
              {group.label}
            </h3>
            <div className="flex items-center gap-2">
              <div style={{ width: 72, height: 4, background: 'rgba(12,12,11,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', background: `linear-gradient(90deg, ${p.accent}, ${p.dark})`, borderRadius: 2, willChange: 'width' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(avail / total) * 100}%` }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 12, color: p.accent }}>{avail}/{total}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {checking ? <Spinner color={p.accent} /> : complete ? (
            <motion.span className="pill pill-vert hidden sm:inline-flex"
              animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
              ✓ Complet
            </motion.span>
          ) : avail > 0 ? (
            <span className="pill hidden sm:inline-flex" style={{ background: p.light, color: p.text, border: `1px solid ${p.border}` }}>Partiel</span>
          ) : (
            <span className="pill pill-pierre hidden sm:inline-flex">En attente</span>
          )}

          <motion.div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{ background: p.light, color: p.accent, willChange: 'transform' }}
            animate={{ rotate: group.expanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.button>

      {/* Expandable */}
      <AnimatePresence initial={false}>
        {group.expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 pt-1 space-y-2.5">
              <div style={{ height: 1, background: `linear-gradient(90deg, ${p.accent}40, transparent)`, marginBottom: 4 }} />
              {group.docs.map((doc, i) => (
                <BulletinRow key={doc.key} doc={doc} p={p} isDownloading={dlKey === doc.key} onDownload={onDownload} idx={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── Info card ──────────────────────────────────────────── */
const InfoCard = ({ icon, label, value, color, delay }: {
  icon: React.ReactNode; label: string; value: string;
  color: 'rose' | 'vert' | 'orange' | 'pierre'; delay: number;
}) => {
  const c = {
    rose:   { bg: '#FFE8F3', text: '#C8116A', border: 'rgba(243,55,145,0.13)' },
    vert:   { bg: '#E8F5E0', text: '#204205', border: 'rgba(51,105,7,0.13)'   },
    orange: { bg: '#FFF1E8', text: '#8B3A10', border: 'rgba(224,107,32,0.13)' },
    pierre: { bg: 'rgba(122,122,116,0.07)', text: '#7A7A74', border: 'rgba(122,122,116,0.12)' },
  }[color];
  return (
    <motion.div className="p-4 rounded-[18px]"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.8)', color: c.text, border: `1px solid ${c.border}` }}>
          {icon}
        </div>
        <div className="min-w-0">
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 10, color: '#7A7A74', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</p>
          <p style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 14, color: '#0C0C0B', wordBreak: 'break-word', lineHeight: 1.3 }}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Stats bar ──────────────────────────────────────────── */
const StatsBar = ({ groups }: { groups: TrimestreGroup[] }) => {
  const total = groups.reduce((s, g) => s + g.docs.length, 0);
  const avail = groups.reduce((s, g) => s + g.docs.filter(d => d.available).length, 0);
  const pct = total > 0 ? Math.round((avail / total) * 100) : 0;
  return (
    <motion.div className="rounded-[20px] p-4"
      style={{ background: '#FFFFFF', border: '1px solid rgba(12,12,11,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 13, color: '#0C0C0B' }}>Progression globale</span>
            <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 12, color: '#F33791' }}>{avail} / {total} disponibles</span>
          </div>
          <div style={{ height: 6, background: 'rgba(12,12,11,0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(90deg, #F33791, #E06B20, #336907)', borderRadius: 3, willChange: 'width' }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
        <div className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(243,55,145,0.08)', border: '1px solid rgba(243,55,145,0.12)' }}>
          <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: 15, color: '#F33791' }}>{pct}%</span>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════ */
export function DashboardPage() {
  const { student, logout } = useAuth();
  const [groups, setGroups] = useState<TrimestreGroup[]>([]);
  const [dlKey, setDlKey] = useState<string | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    if (!student) return;
    const STRUCT = [
      { trimestre: 1, label: '1er Trimestre',  shortLabel: 'T1', color: 'rose'   as const },
      { trimestre: 2, label: '2ème Trimestre', shortLabel: 'T2', color: 'vert'   as const },
      { trimestre: 3, label: '3ème Trimestre', shortLabel: 'T3', color: 'orange' as const },
    ];
    const init: TrimestreGroup[] = STRUCT.map((t, ti) => ({
      ...t, expanded: ti === 0,
      docs: [1, 2].map(d => ({
        key: `${t.shortLabel}-${d}`, trimestre: t.trimestre, devoir: d,
        label: `Devoir ${d} — ${t.label}`,
        fileName: `${student.id}_${t.shortLabel}-${d}_bulletin.pdf`,
        available: false, checking: true,
      })),
    }));
    setGroups(init);
    STRUCT.forEach(t => {
      [1, 2].forEach(async d => {
        const key = `${t.shortLabel}-${d}`;
        const file = `${student.id}_${t.shortLabel}-${d}_bulletin.pdf`;
        try {
          const r = await fetch(`/bulletins/${file}`, { method: 'HEAD' });
          setGroups(prev => prev.map(g => g.trimestre === t.trimestre
            ? { ...g, docs: g.docs.map(doc => doc.key === key ? { ...doc, available: r.ok, checking: false } : doc) }
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
    if ('Notification' in window) setNotifEnabled(Notification.permission === 'granted');
  }, []);

  const handleToggle = useCallback((t: number) =>
    setGroups(prev => prev.map(g => g.trimestre === t ? { ...g, expanded: !g.expanded } : g)), []);

  const handleDownload = useCallback(async (doc: BulletinDoc) => {
    if (!student || dlKey) return;
    setDlKey(doc.key);
    try {
      await new Promise(r => setTimeout(r, 700));
      const a = document.createElement('a');
      a.href = `/bulletins/${doc.fileName}`;
      const name = `Bulletin_${student.id}_${student.fullName.replace(/\s+/g, '_')}_${doc.key}_2025-2026.pdf`;
      a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast.success(`${doc.label} téléchargé ! 🎉`);
      if (notifEnabled) notifyDownloadComplete(name);
    } catch { toast.error('Erreur lors du téléchargement.'); }
    finally { setDlKey(null); }
  }, [student, dlKey, notifEnabled]);

  const handleNotif = async () => {
    const ok = await requestNotificationPermission();
    setNotifEnabled(ok);
    if (ok) toast.success('Notifications activées !');
    else toast.error('Notifications refusées');
  };

  if (!student) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 hero-gradient">
      <div className="w-12 h-12 rounded-full border-3 border-gray-200 border-t-[#F33791] animate-spin" style={{ willChange: 'transform' }} />
      <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, color: '#7A7A74' }}>Chargement…</p>
    </div>
  );

  const totalAvail = groups.reduce((s, g) => s + g.docs.filter(d => d.available).length, 0);

  /* stagger helpers */
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, ease: [0.16, 1, 0.3, 1] as [number,number,number,number], duration: 0.55 },
  });

  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      {/* Dot grid */}
      <div className="fixed inset-0 dot-grid opacity-25 pointer-events-none" />
      {/* Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb absolute rounded-full" style={{ width: 420, height: 420, top: '-8%', right: '-6%', background: 'radial-gradient(circle, rgba(243,55,145,0.07) 0%, transparent 68%)' }} />
        <div className="orb orb-2 absolute rounded-full" style={{ width: 340, height: 340, bottom: '-6%', left: '-4%', background: 'radial-gradient(circle, rgba(51,105,7,0.06) 0%, transparent 68%)' }} />
      </div>

      <Header />

      <main className="flex-1 relative z-10 py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* ── Welcome ── */}
          <motion.div className="text-center mb-1" {...fadeUp(0)}>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
              style={{ background: 'rgba(51,105,7,0.08)', border: '1px solid rgba(51,105,7,0.12)' }}
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.18, type: 'spring', stiffness: 280, damping: 22 }}
            >
              <motion.span animate={{ rotate: [0, 18, -12, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}>👋</motion.span>
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 12, color: '#336907' }}>
                Espace parents — Secureway
              </span>
            </motion.div>

            <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: 'clamp(22px, 6vw, 30px)', letterSpacing: '-0.02em', color: '#0C0C0B' }}>
              Bonjour,{' '}
              <span style={{ color: '#F33791' }}>{student.parentName}</span>
            </h1>
            <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, color: '#7A7A74', marginTop: 4 }}>
              Consultez et téléchargez les bulletins de votre enfant
            </p>
          </motion.div>

          {/* ── Notif banner ── */}
          {!notifEnabled && 'Notification' in window && (
            <motion.button onClick={handleNotif} {...fadeUp(0.22)}
              className="w-full p-3.5 rounded-[18px] flex items-center justify-center gap-3 transition-base"
              style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.22)' }}
              whileHover={{ scale: 1.01, background: 'rgba(232,160,32,0.12)' }} whileTap={{ scale: 0.99 }}
            >
              <span style={{ fontSize: 18 }}>🔔</span>
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500, fontSize: 13, color: '#0C0C0B' }}>
                Activez les notifications pour être alerté à la mise en ligne d'un bulletin
              </span>
            </motion.button>
          )}

          {/* ── Student card ── */}
          <motion.div className="card-premium" {...fadeUp(0.14)}>
            {/* Dark hero */}
            <div className="relative overflow-hidden px-5 py-5 dark-hero">
              {/* Glows */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(243,55,145,0.18) 0%, transparent 68%)', transform: 'translate(35%, -35%)' }} />
              <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(51,105,7,0.22) 0%, transparent 68%)', transform: 'translate(-35%, 35%)' }} />
              {/* Gold sparkle dots */}
              {[30, 58, 75, 85, 92].map((l, i) => (
                <motion.div key={i} className="absolute w-1 h-1 rounded-full"
                  style={{ background: 'rgba(232,160,32,0.7)', left: `${l}%`, top: `${20 + i * 14}%` }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.4, 0.8] }}
                  transition={{ duration: 2 + i * 0.5, delay: i * 0.4, repeat: Infinity }} />
              ))}

              <div className="relative z-10 flex items-center gap-4">
                <motion.div
                  className="w-14 h-14 rounded-[18px] flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                  whileHover={{ scale: 1.08, rotate: 4 }} whileTap={{ scale: 0.94 }}
                >
                  <span style={{ fontSize: 30 }}>{student.gender === 'F' ? '👩‍🎓' : '👨‍🎓'}</span>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: 17, color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1.25, wordBreak: 'break-word' }}>
                    {student.fullName}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="pill" style={{ background: 'linear-gradient(135deg, #F33791, #C8116A)', color: '#FFFFFF', border: 'none', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, padding: '4px 10px' }}>
                      {student.classe}
                    </span>
                  </div>
                </div>
                <motion.div
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] flex-shrink-0"
                  style={{ background: 'rgba(51,105,7,0.3)', border: '1px solid rgba(51,105,7,0.4)' }}
                  animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity }}
                >
                  <svg className="w-3.5 h-3.5" style={{ color: '#80C840' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0117.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 11, color: '#80C840' }}>Vérifié</span>
                </motion.div>
              </div>
            </div>

            {/* Info grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
              <InfoCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} label="Parent / Tuteur" value={student.parentName} color="rose" delay={0.28} />
              <InfoCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} label="Classe" value={student.classe} color="vert" delay={0.33} />
              <InfoCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} label="Année scolaire" value="2025 – 2026" color="orange" delay={0.38} />
              <InfoCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Bulletins reçus" value={`${totalAvail} / 6`} color="pierre" delay={0.43} />
            </div>
          </motion.div>

          {/* ── Stats bar ── */}
          {groups.length > 0 && <StatsBar groups={groups} />}

          {/* ── Section title ── */}
          <motion.div className="flex items-center gap-3 pt-1" {...fadeUp(0.48)}>
            <div className="w-8 h-8 rounded-[11px] flex items-center justify-center"
              style={{ background: 'rgba(243,55,145,0.09)', border: '1px solid rgba(243,55,145,0.13)', color: '#F33791' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 15, color: '#0C0C0B' }}>Bulletins scolaires</h2>
              <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#7A7A74' }}>2 devoirs par trimestre · Cliquez pour déplier</p>
            </div>
          </motion.div>

          {/* ── Trimestre cards ── */}
          <div className="space-y-3">
            {groups.map((g, i) => (
              <TriCard key={g.trimestre} group={g} dlKey={dlKey} onDownload={handleDownload} onToggle={handleToggle} idx={i} />
            ))}
          </div>

          {/* Security note */}
          <motion.div className="flex items-center justify-center gap-2 py-1" {...fadeUp(0.82)}>
            <svg className="w-3.5 h-3.5" style={{ color: '#336907' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0117.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, color: '#7A7A74' }}>
              Documents officiels · Accès personnel et confidentiel
            </span>
          </motion.div>

          {/* Logout */}
          <motion.div className="text-center pb-4" {...fadeUp(0.76)}>
            <motion.button onClick={logout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] transition-base"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500, fontSize: 13, color: '#7A7A74' }}
              whileHover={{ color: '#F33791', background: 'rgba(243,55,145,0.06)', scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
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
