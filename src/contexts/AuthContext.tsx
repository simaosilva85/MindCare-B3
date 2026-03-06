import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    // Initialiser les utilisateurs de test s'il n'y en a pas
    const storedUsers = localStorage.getItem("users");
    if (!storedUsers) {
      const testUsers = [
        {
          id: "1",
          name: "Utilisateur Test",
          email: "user@test.com",
          password: "password123",
        },
      ];
      localStorage.setItem("users", JSON.stringify(testUsers));
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulation d'une requête API
      // À remplacer par un vrai appel à votre backend
      const storedUsers = JSON.parse(
        localStorage.getItem("users") || "[]"
      );
      const foundUser = storedUsers.find(
        (u: any) => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error("Email ou mot de passe incorrect");
      }

      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Validation basique
      if (!email || !password || !name) {
        throw new Error("Tous les champs sont requis");
      }

      if (password.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      }

      // Vérifier si l'email existe déjà
      const storedUsers = JSON.parse(
        localStorage.getItem("users") || "[]"
      );
      if (storedUsers.some((u: any) => u.email === email)) {
        throw new Error("Cet email est déjà utilisé");
      }

      // Créer le nouvel utilisateur
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // À hasher côté backend en production !
      };

      storedUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(storedUsers));

      // Connecter automatiquement après l'inscription
      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isLoggedIn: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }
  return context;
};
