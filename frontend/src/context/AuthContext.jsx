import { createContext, useContext, useEffect, useState } from "react";
import { getMe, loginUser, registerUser } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  const [loading, setLoading] = useState(false);

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

  const refreshUser = async () => {
    try {
      setLoading(true);
      const res = await getMe();

      const oldUser = JSON.parse(localStorage.getItem("user"));

      const updatedUser = {
        ...res.data.user,
        token: oldUser?.token,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      refreshUser();
    }
  }, []);

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

export const useAuth = () => useContext(AuthContext);