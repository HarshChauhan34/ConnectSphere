import { useCallback, useEffect, useState } from "react";
import { getMe, loginUser, registerUser } from "../services/authService";
import { AuthContext } from "./AuthContextValue";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);

  const [loading, setLoading] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
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

      const oldUser = JSON.parse(localStorage.getItem("user"));

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
