import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

function MainLayout() {
  const location = useLocation();
  const isMessagesRoute = location.pathname.startsWith("/messages");

  return (
    <div
      className={`${
        isMessagesRoute ? "h-dvh overflow-hidden" : "min-h-screen"
      } bg-black text-white`}
    >
      <Navbar />

      <main
        className={`mx-auto w-full border-x border-neutral-800 bg-black ${
          isMessagesRoute
            ? "h-[calc(100dvh-7rem)] max-w-[980px] overflow-hidden md:h-[calc(100dvh-4rem)] lg:h-dvh"
            : "min-h-screen max-w-[975px] pb-24 md:pb-6"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
