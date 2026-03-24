import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setApiAuth, clearApiAuth } from '@/services/api';

type AuthState = {
  session: string | null;
  pin: string | null;
  nameAz: string | null;
  nameEn: string | null;
  seamanId: string | null;
  photoUrl: string | null;
};

type AuthContextType = AuthState & {
  setAuth: (pin: string, extra?: { session?: string; nameAz?: string; nameEn?: string; seamanId?: string; photoUrl?: string }) => void;
  clearAuth: () => void;
};

const KEYS = ['session', 'pin', 'nameAz', 'nameEn', 'seamanId', 'photoUrl'] as const;

const AuthContext = createContext<AuthContextType>({
  session: null, pin: null, nameAz: null, nameEn: null, seamanId: null, photoUrl: null,
  setAuth: () => {},
  clearAuth: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null, pin: null, nameAz: null, nameEn: null, seamanId: null, photoUrl: null,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([...KEYS]).then(pairs => {
      const obj: Record<string, string | null> = {};
      pairs.forEach(([k, v]) => { obj[k] = v; });
      if (obj.pin) {
        setApiAuth(obj.pin, obj.session ?? obj.pin);
        setState({
          session: obj.session,
          pin: obj.pin,
          nameAz: obj.nameAz,
          nameEn: obj.nameEn,
          seamanId: obj.seamanId,
          photoUrl: obj.photoUrl,
        });
      }
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  return (
    <AuthContext.Provider
      value={{
        ...state,
        setAuth: (pin, extra = {}) => {
          const session = extra.session ?? pin;
          const newState: AuthState = {
            session,
            pin,
            nameAz: extra.nameAz ?? null,
            nameEn: extra.nameEn ?? null,
            seamanId: extra.seamanId ?? null,
            photoUrl: extra.photoUrl ?? null,
          };
          setApiAuth(pin, session);
          setState(newState);
          const pairs: [string, string][] = [];
          if (pin) pairs.push(['pin', pin]);
          if (session) pairs.push(['session', session]);
          if (extra.nameAz) pairs.push(['nameAz', extra.nameAz]);
          if (extra.nameEn) pairs.push(['nameEn', extra.nameEn]);
          if (extra.seamanId) pairs.push(['seamanId', extra.seamanId]);
          if (extra.photoUrl) pairs.push(['photoUrl', extra.photoUrl]);
          AsyncStorage.multiSet(pairs);
        },
        clearAuth: () => {
          clearApiAuth();
          setState({ session: null, pin: null, nameAz: null, nameEn: null, seamanId: null, photoUrl: null });
          AsyncStorage.multiRemove([...KEYS]);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
