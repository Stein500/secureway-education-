import { motion } from 'framer-motion';

const SocialLink = ({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) => (
  <motion.a href={href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#ECEBEC] hover:border-transparent hover:shadow-lg transition-all duration-300" style={{ '--hover-color': color } as React.CSSProperties} whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.95 }}>
    <span className="text-[#A3A7A1] group-hover:text-[var(--hover-color)] transition-colors">{icon}</span>
    <span className="text-sm font-medium text-[#1A1A1A] group-hover:text-[var(--hover-color)] transition-colors">{label}</span>
  </motion.a>
);

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="relative bg-[#FDFEFE] border-t border-[#ECEBEC] mt-auto">
      <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-[#F33791] via-[#FF6B9D] to-[#336907] opacity-50" />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-white shadow-lg border border-[#ECEBEC] flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="Les Bulles de Joie" className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
                  <span className="hidden text-2xl">🎈</span>
                </div>
                <motion.div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#336907] rounded-md flex items-center justify-center" animate={{ scale:[1,1.1,1] }} transition={{ duration:2, repeat:Infinity }}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                </motion.div>
              </div>
              <div><h3 className="font-bold text-[#1A1A1A] text-lg">Les Bulles de Joie</h3><p className="text-xs text-[#A3A7A1]">Parakou, Bénin</p></div>
            </div>
            <p className="text-sm text-[#A3A7A1] leading-relaxed max-w-xs mx-auto md:mx-0">École : Crèche & Garderie, Maternelle et Primaire Bilingues. Excellence éducative depuis 2017.</p>
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-[#1A1A1A] mb-4 flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-[#F33791]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              Agréments Officiels
            </h4>
            <div className="space-y-3">
              <div className="inline-block px-4 py-2 bg-[#F33791]/5 rounded-xl border border-[#F33791]/20">
                <p className="text-xs font-semibold text-[#F33791]">N° 2021/018/MASM/DC/SGM/DPFG/SA</p>
                <p className="text-xs text-[#A3A7A1]">Ministère des Affaires Sociales</p>
                <p className="text-xs text-[#A3A7A1]">et de la Microfinance</p>
              </div>
              <div className="inline-block px-4 py-2 bg-[#336907]/5 rounded-xl border border-[#336907]/20">
                <p className="text-xs font-semibold text-[#336907]">N° 2022/045/MEMP/DC/SGM/DEP/SA</p>
                <p className="text-xs text-[#A3A7A1]">Ministère des Enseignements</p>
                <p className="text-xs text-[#A3A7A1]">Maternel et Primaire</p>
              </div>
            </div>
          </div>
          <div className="text-center md:text-right">
            <h4 className="font-semibold text-[#1A1A1A] mb-4 flex items-center justify-center md:justify-end gap-2">
              <svg className="w-5 h-5 text-[#336907]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Contact
            </h4>
            <div className="space-y-3">
              <a href="tel:+22901979194" className="flex items-center justify-center md:justify-end gap-2 text-[#A3A7A1] hover:text-[#F33791] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span className="text-sm">+229 01 97 91 94 52</span>
              </a>
              <a href="mailto:lesbullesdejoie@gmail.com" className="flex items-center justify-center md:justify-end gap-2 text-[#A3A7A1] hover:text-[#F33791] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="text-sm">lesbullesdejoie@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <SocialLink href="https://facebook.com/lesbullesdejoie" color="#1877F2" label="Facebook" icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>} />
          <SocialLink href="https://instagram.com/lesbullesdejoie" color="#E4405F" label="Instagram" icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>} />
          <SocialLink href="https://tiktok.com/@cspblesbullesdejoie" color="#000000" label="TikTok" icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>} />
          <SocialLink href="https://maps.app.goo.gl/Cz9oXhGhiR2T6czEA" color="#34A853" label="Localisation" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        </div>
        <div className="pt-6 border-t border-[#ECEBEC]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-[#A3A7A1]">© 2017-{currentYear} Les Bulles de Joie. Tous droits réservés.</p>
            <div className="flex items-center gap-2 text-xs text-[#A3A7A1]">
              <motion.div animate={{ scale:[1,1.2,1] }} transition={{ duration:2, repeat:Infinity }}><svg className="w-4 h-4 text-[#336907]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></motion.div>
              <span>Portail Sécurisé</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
