import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";
import type { User } from "~/types/user";

export interface Auth {
  user: User;
  isAuth: boolean;
  logout: () => void;
  login: () => void;
}

const DefaultUser: User = {
  displayName: "Visitante",
  email: "",
  uid: "",
  photoURL: "",
};

const DefaultAuth = {
  user: DefaultUser,
  isAuth: false,
};

const AuthContext = createContext(DefaultAuth as Auth);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User>(DefaultUser);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (googleUser) => {
      if (googleUser) {
        setUser(googleUser);
        setIsAuth(true);
      } else {
        setUser(DefaultUser);
        setIsAuth(false);
      }
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth,
        logout: () => {
          signOut(auth).finally(() => {
            setUser(DefaultUser);
            setIsAuth(false);
          });
        },
        login: () => {
          signInWithPopup(auth, googleProvider)
            .then((result) => {
              setUser(result.user);
              setIsAuth(true);
            })
            .catch((error) => {
              console.error("Erro no login:", error.message);
              alert("Erro no login");
            });
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
