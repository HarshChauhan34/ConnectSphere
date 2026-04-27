import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="mx-auto min-h-screen w-full max-w-[975px] border-x border-neutral-800 bg-black pb-24 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;