import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;