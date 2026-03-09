import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Student {
  id: string;
  password: string;
  fullName: string;
  classe: string;
  parentName: string;
  gender: 'M' | 'F';
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  student: Student | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const STUDENTS_DATA: Student[] = [
  // ─── CI ───────────────────────────────────────────────────────────────────
  { id: "CI-001", password: "elanora",       fullName: "AHOUANSOU Elanora",           classe: "CI",  parentName: "Mme/M. AHOUANSOU",           gender: "F" },
  { id: "CI-002", password: "hidayath",      fullName: "AMADOU Hidayath",             classe: "CI",  parentName: "Mme/M. AMADOU",              gender: "F" },
  { id: "CI-003", password: "omulhairdoue",  fullName: "AMOUDA Omulhair Doué",        classe: "CI",  parentName: "M./Mme AMOUDA",              gender: "M" },
  { id: "CI-004", password: "rayane",        fullName: "BIAHOU Rayane",               classe: "CI",  parentName: "M./Mme BIAHOU",              gender: "M" },
  { id: "CI-005", password: "drucilia",      fullName: "DAH-ZOUNNON Drucilia",        classe: "CI",  parentName: "Mme/M. DAH-ZOUNNON",         gender: "F" },
  { id: "CI-006", password: "tsidkenu",      fullName: "HOUEHOU Tsidkenu",            classe: "CI",  parentName: "M./Mme HOUEHOU",             gender: "M" },
  { id: "CI-007", password: "happy",         fullName: "MONRA Happy",                 classe: "CI",  parentName: "M./Mme MONRA",               gender: "M" },
  { id: "CI-008", password: "julius",        fullName: "ODE Julius",                  classe: "CI",  parentName: "M./Mme ODE",                 gender: "M" },
  { id: "CI-009", password: "mariereine",    fullName: "SINA Oumégui Marie Reine",    classe: "CI",  parentName: "Mme/M. SINA Oumégui",        gender: "F" },
  { id: "CI-010", password: "dauy",          fullName: "YALLOU Dauy",                 classe: "CI",  parentName: "M./Mme YALLOU",              gender: "M" },
  { id: "CI-011", password: "fauzane",       fullName: "BONI SENI Fauzane",           classe: "CI",  parentName: "M./Mme BONI SENI",           gender: "M" },
  { id: "CI-012", password: "keren",         fullName: "TOSSAVI Kéren",               classe: "CI",  parentName: "Mme/M. TOSSAVI",             gender: "F" },
  { id: "CI-013", password: "yann-mael",     fullName: "KOMBIENI Yann-Maël",          classe: "CI",  parentName: "M./Mme KOMBIENI",            gender: "M" },
  { id: "CI-014", password: "samssia",       fullName: "BANI Samssia",                classe: "CI",  parentName: "Mme/M. BANI",                gender: "F" },
  { id: "CI-015", password: "sadiath",       fullName: "ADEOTI Sadiath",              classe: "CI",  parentName: "Mme/M. ADEOTI",              gender: "F" },
  { id: "CI-016", password: "ihsane",        fullName: "AGBATAOU Ihsane",             classe: "CI",  parentName: "M./Mme AGBATAOU",            gender: "M" },
  { id: "CI-017", password: "samuel",        fullName: "EDAH Samuel",                 classe: "CI",  parentName: "M./Mme EDAH",                gender: "M" },
  // ─── CP ───────────────────────────────────────────────────────────────────
  { id: "CP-001", password: "arya",          fullName: "SANTOS Arya",                 classe: "CP",  parentName: "Mme/M. SANTOS",              gender: "F" },
  { id: "CP-002", password: "fatimatou",     fullName: "IMOROU Fatimatou",            classe: "CP",  parentName: "Mme/M. IMOROU",              gender: "F" },
  { id: "CP-003", password: "ifedunsedami",  fullName: "HOUNDETON Ifèdun Sèdami",     classe: "CP",  parentName: "Mme/M. HOUNDETON",           gender: "F" },
  { id: "CP-004", password: "imad-dine",     fullName: "AMADOU Imad-Dine",            classe: "CP",  parentName: "M./Mme AMADOU",              gender: "M" },
  { id: "CP-005", password: "moustamia",     fullName: "ADJE Moustamia",              classe: "CP",  parentName: "Mme/M. ADJE",                gender: "F" },
  { id: "CP-006", password: "immaculee",     fullName: "KPOGBE Immaculée",            classe: "CP",  parentName: "Mme/M. KPOGBE",              gender: "F" },
  { id: "CP-007", password: "arthur",        fullName: "TOGNIZIN Arthur",             classe: "CP",  parentName: "M./Mme TOGNIZIN",            gender: "M" },
  { id: "CP-008", password: "ayedunsedomi",  fullName: "HOUNDETON Ayédun Sèdomi",     classe: "CP",  parentName: "M./Mme HOUNDETON",           gender: "M" },
  { id: "CP-009", password: "jaynelle",      fullName: "BOKO GOUNOU Jaynelle",        classe: "CP",  parentName: "Mme/M. BOKO GOUNOU",         gender: "F" },
  // ─── CE1 ──────────────────────────────────────────────────────────────────
  { id: "CE1-001", password: "fifame",        fullName: "AGBLO AGONDJIHOSSOU Fifamè",  classe: "CE1", parentName: "Mme/M. AGBLO AGONDJIHOSSOU", gender: "F" },
  { id: "CE1-002", password: "emmanuel",      fullName: "AKYOH Emmanuel",              classe: "CE1", parentName: "M./Mme AKYOH",               gender: "M" },
  { id: "CE1-003", password: "yinki",         fullName: "AMOUDA Yinki",                classe: "CE1", parentName: "Mme/M. AMOUDA",              gender: "F" },
  { id: "CE1-004", password: "rahama",        fullName: "BANI Rahama",                 classe: "CE1", parentName: "Mme/M. BANI",                gender: "F" },
  { id: "CE1-005", password: "noham",         fullName: "DAHOUGOU Noham",              classe: "CE1", parentName: "M./Mme DAHOUGOU",            gender: "M" },
  { id: "CE1-006", password: "queen",         fullName: "EDAH Queen",                  classe: "CE1", parentName: "Mme/M. EDAH",                gender: "F" },
  { id: "CE1-007", password: "mekaddishkem",  fullName: "HOUEHOU Mékaddishkem",        classe: "CE1", parentName: "M./Mme HOUEHOU",             gender: "M" },
  { id: "CE1-008", password: "faith",         fullName: "PADONOU Faith",               classe: "CE1", parentName: "Mme/M. PADONOU",             gender: "F" },
  { id: "CE1-009", password: "peniel",        fullName: "SOVI Péniel",                 classe: "CE1", parentName: "M./Mme SOVI",                gender: "M" },
  { id: "CE1-010", password: "naelle",        fullName: "TOSSAVI Naelle",              classe: "CE1", parentName: "Mme/M. TOSSAVI",             gender: "F" },
  // ─── CE2 ──────────────────────────────────────────────────────────────────
  { id: "CE2-001", password: "matheo",        fullName: "HOUNSINOU Mathéo",            classe: "CE2", parentName: "M./Mme HOUNSINOU",           gender: "M" },
  { id: "CE2-002", password: "timeo",         fullName: "HOUNSINOU Timéo",             classe: "CE2", parentName: "M./Mme HOUNSINOU",           gender: "M" },
  { id: "CE2-003", password: "mouradshaine",  fullName: "GUERGUISSE Mourad Shaïne",    classe: "CE2", parentName: "M./Mme GUERGUISSE",          gender: "M" },
  { id: "CE2-004", password: "dilane",        fullName: "AGBLO AGONDJIHOSSOU Dilane",  classe: "CE2", parentName: "M./Mme AGBLO AGONDJIHOSSOU", gender: "M" },
  { id: "CE2-005", password: "silvio",        fullName: "DOSSA Silvio",                classe: "CE2", parentName: "M./Mme DOSSA",               gender: "M" },
  { id: "CE2-006", password: "vanessa",       fullName: "DEHOTIN Vanessa",             classe: "CE2", parentName: "Mme/M. DEHOTIN",             gender: "F" },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const checkSession = () => {
      try {
        const sessionData = sessionStorage.getItem('auth_session');
        if (sessionData) {
          const { studentId, timestamp } = JSON.parse(sessionData);
          const now = Date.now();
          const maxAge = 60 * 60 * 1000;
          if (now - timestamp < maxAge) {
            const foundStudent = STUDENTS_DATA.find(s => s.id === studentId);
            if (foundStudent) {
              setStudent(foundStudent);
              setIsAuthenticated(true);
            }
          } else {
            sessionStorage.removeItem('auth_session');
          }
        }
      } catch (error) {
        console.error('Erreur de session:', error);
        sessionStorage.removeItem('auth_session');
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const foundStudent = STUDENTS_DATA.find(
        s => s.id.toLowerCase() === identifier.toLowerCase() && s.password.toLowerCase() === password.toLowerCase()
      );
      if (foundStudent) {
        sessionStorage.setItem('auth_session', JSON.stringify({ studentId: foundStudent.id, timestamp: Date.now() }));
        setStudent(foundStudent);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('auth_session');
    sessionStorage.removeItem('hasSeenSplash');
    setStudent(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, student, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
