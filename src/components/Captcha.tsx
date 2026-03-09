import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CaptchaProps {
  onValidate: (isValid: boolean) => void;
}

type Operation = '+' | '-' | '×';

export function Captcha({ onValidate }: CaptchaProps) {
  const [challenge, setChallenge] = useState<{ num1: number; num2: number; operation: Operation; answer: number } | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generateChallenge = useCallback(() => {
    const operations: Operation[] = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    switch (operation) {
      case '+': num1 = Math.floor(Math.random() * 15) + 1; num2 = Math.floor(Math.random() * 15) + 1; answer = num1 + num2; break;
      case '-': num1 = Math.floor(Math.random() * 15) + 5; num2 = Math.floor(Math.random() * Math.min(num1-1,10)) + 1; answer = num1 - num2; break;
      case '×': num1 = Math.floor(Math.random() * 9) + 1; num2 = Math.floor(Math.random() * 9) + 1; answer = num1 * num2; break;
      default: num1=1; num2=1; answer=2;
    }
    return { num1, num2, operation, answer };
  }, []);

  useEffect(() => { setChallenge(generateChallenge()); }, [generateChallenge]);

  const refreshChallenge = () => {
    setIsRefreshing(true);
    setUserAnswer('');
    setIsValid(null);
    onValidate(false);
    setTimeout(() => { setChallenge(generateChallenge()); setIsRefreshing(false); }, 300);
  };

  const handleSubmit = () => {
    if (!challenge) return;
    const correct = parseInt(userAnswer) === challenge.answer;
    setIsValid(correct);
    onValidate(correct);
    if (!correct) setTimeout(() => refreshChallenge(), 1500);
  };

  if (!challenge) return null;

  return (
    <motion.div className="relative p-4 bg-[#F5F3F5] rounded-2xl border border-[#ECEBEC]" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div className="w-8 h-8 rounded-lg bg-[#F33791]/10 flex items-center justify-center" animate={{ rotate:[0,5,-5,0] }} transition={{ duration:3, repeat:Infinity }}>
            <svg className="w-4 h-4 text-[#F33791]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </motion.div>
          <span className="text-sm font-medium text-[#1A1A1A]">Vérification</span>
        </div>
        <motion.button type="button" onClick={refreshChallenge} disabled={isRefreshing} className="p-2 rounded-lg hover:bg-[#ECEBEC] transition-colors" whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}>
          <motion.svg className="w-5 h-5 text-[#A3A7A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" animate={isRefreshing ? { rotate:360 } : {}} transition={{ duration:0.5 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></motion.svg>
        </motion.button>
      </div>
      <div className="flex items-center gap-3">
        <motion.div className="flex-1 flex items-center justify-center gap-2 py-3 bg-white rounded-xl border border-[#ECEBEC]" key={`${challenge.num1}-${challenge.operation}-${challenge.num2}`} initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}>
          <motion.span className="text-2xl font-bold text-[#1A1A1A]" animate={{ scale:[1,1.1,1] }} transition={{ duration:0.5 }}>{challenge.num1}</motion.span>
          <motion.span className="text-2xl font-bold text-[#F33791]" animate={{ rotate:[0,10,-10,0] }} transition={{ duration:0.5, delay:0.1 }}>{challenge.operation}</motion.span>
          <motion.span className="text-2xl font-bold text-[#1A1A1A]" animate={{ scale:[1,1.1,1] }} transition={{ duration:0.5, delay:0.2 }}>{challenge.num2}</motion.span>
          <span className="text-2xl font-bold text-[#A3A7A1]">=</span>
          <span className="text-2xl font-bold text-[#336907]">?</span>
        </motion.div>
        <motion.div className="relative">
          <input type="number" value={userAnswer} onChange={(e) => { setUserAnswer(e.target.value); setIsValid(null); onValidate(false); }} onKeyPress={(e) => e.key==='Enter' && handleSubmit()} placeholder="?" className={`w-16 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-300 focus:outline-none ${isValid===true ? 'border-[#336907] bg-[#336907]/10 text-[#336907]' : isValid===false ? 'border-[#F33791] bg-[#F33791]/10 text-[#F33791]' : 'border-[#ECEBEC] bg-white text-[#1A1A1A] focus:border-[#F33791]'}`} />
          <AnimatePresence>{isValid!==null && <motion.div initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0, opacity:0 }} className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${isValid ? 'bg-[#336907]' : 'bg-[#F33791]'}`}>{isValid ? <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}</motion.div>}</AnimatePresence>
        </motion.div>
        <motion.button type="button" onClick={handleSubmit} disabled={!userAnswer} className={`px-4 h-14 rounded-xl font-semibold transition-all duration-300 ${userAnswer ? 'bg-[#F33791] hover:bg-[#E02A7A] text-white' : 'bg-[#ECEBEC] text-[#A3A7A1] cursor-not-allowed'}`} whileHover={userAnswer ? { scale:1.05 } : {}} whileTap={userAnswer ? { scale:0.95 } : {}}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></motion.button>
      </div>
      <AnimatePresence>{isValid!==null && <motion.p initial={{ opacity:0, y:-5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-5 }} className={`mt-3 text-sm text-center font-medium ${isValid ? 'text-[#336907]' : 'text-[#F33791]'}`}>{isValid ? <span className="flex items-center justify-center gap-1"><motion.span animate={{ rotate:[0,15,-15,0] }} transition={{ duration:0.5 }}>✓</motion.span> Vérification réussie !</span> : <span className="flex items-center justify-center gap-1"><motion.span animate={{ x:[0,-3,3,-3,3,0] }} transition={{ duration:0.4 }}>✗</motion.span> Réponse incorrecte, réessayez</span>}</motion.p>}</AnimatePresence>
    </motion.div>
  );
}
