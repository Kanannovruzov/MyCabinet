import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setApiAuth, clearApiAuth } from '@/services/api';

type AuthState = {
  session: string | null;
  pin: string | null;
};

type AuthContextType = AuthState & {
  setAuth: (session: string, pin: string) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  pin: null,
  setAuth: () => {},
  clearAuth: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, pin: null });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet(['session', 'pin']).then(pairs => {
      const session = pairs[0][1];
      const pin = pairs[1][1];
      if (session && pin) {
        setApiAuth(pin, session);
        setState({ session, pin });
      }
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  return (
    <AuthContext.Provider
      value={{
        ...state,
        setAuth: (session, pin) => {
          setApiAuth(pin, session);
          setState({ session, pin });
          AsyncStorage.multiSet([['session', session], ['pin', pin]]);
        },
        clearAuth: () => {
          clearApiAuth();
          setState({ session: null, pin: null });
          AsyncStorage.multiRemove(['session', 'pin']);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
