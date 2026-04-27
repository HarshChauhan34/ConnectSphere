import { useCallback, useEffect, useState } from "react";
import { getMe, loginUser, registerUser } from "../services/authService";
import { AuthContext } from "./AuthContextValue";

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());

  const [loading, setLoading] = useState(() => {
    const storedUser = getStoredUser();
    return Boolean(storedUser?.token);
  });

  const register = async (formData) => {
    const res = await registerUser(formData);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res;
  };

  const login = async (formData) => {
    const res = await loginUser(formData);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await getMe();

      const oldUser = getStoredUser();

      const updatedUser = {
        ...res.data.user,
        token: oldUser?.token,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch {
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onForcedLogout = () => {
      localStorage.removeItem("user");
      setUser(null);
      setLoading(false);
    };

    window.addEventListener("auth:logout", onForcedLogout);
    return () => window.removeEventListener("auth:logout", onForcedLogout);
  }, []);

  useEffect(() => {
    if (!user?.token) return;

    const timer = setTimeout(() => {
      void refreshUser();
    }, 0);

    return () => clearTimeout(timer);
  }, [refreshUser, user?.token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        register,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
