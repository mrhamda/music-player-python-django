import {
  faArrowLeft,
  faArrowRight,
  faBell,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useProjectContext } from "../context/ProjectContext";

export function Navbar() {
  const [isProfileStats, setProfileState] = useState(false);
  const [notifications, setNotfications] = useState(false);

  const { setCurrentPageData, user, logout, playlists } = useProjectContext();

  async function relodNotifcations() {
    try {
      const res = await fetch(`/api/get_user_notifications/?id=${user?.id}`);

      const resJson = await res.json();

      console.log("notifcations", resJson);

      if (res.ok) {
        setNotfications(resJson.notifications);
      } else {
        console.log(resJson.error);
      }
    } catch (e) {
      console.log(e);
    }
  }
  useEffect(() => {
    if (user !== null) {
      relodNotifcations();
    }
  }, [user]);

  return (
    <nav className="border-b border-gray-700 bg-gray-900 fixed w-full z-50 top-0">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between relative">
        {/* Left: Logo */}
        <a
          href="https://flowbite.com/"
          className="flex items-center space-x-3 rtl:space-x-reverse z-10"
        >
          {/* <span className="text-2xl font-semibold whitespace-nowrap text-white">
            ER
          </span> */}
        </a>

        {/* Center: Desktop Navigation */}
        <div>
          {/* Left corner arrows, side by side */}

          {false && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-row space-x-4 z-50">
              <button
                type="button"
                onClick={() => {
                  window.history.back();
                }}
                className={`text-gray-300 hover:text-white dark:text-gray-400 dark:hover:text-white cursor-pointer pointer-events-auto ${
                  window.history.length > 1
                    ? "opacity-40 cursor-not-allowed"
                    : ""
                }`}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
              </button>
              <button
                type="button"
                onClick={() => {
                  window.history.forward();
                }}
                className={`text-gray-300 hover:text-white dark:text-gray-400 dark:hover:text-white cursor-pointer pointer-events-auto `}
              >
                <FontAwesomeIcon icon={faArrowRight} className="text-lg" />
              </button>
            </div>
          )}

          {/* Center content */}
          <div>
            {/* Left corner arrows, horizontally aligned and vertically centered */}

            {/* Centered home icon, vertically centered */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 md:block">
              <ul className="flex space-x-4 md:space-x-8 font-medium text-white">
                <li>
                  <a
                    className="block py-1 px-2 text-sm md:text-base bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 
                    cursor-pointer md:dark:text-blue-500"
                    aria-current="page"
                    onClick={() => {
                      setCurrentPageData([{ target: "homeshow" }]);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faHome}
                      className="text-sm md:text-base"
                    />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Icons and Hamburger */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse gap-2 relative z-10 ml-10">
          <button
            type="button"
            className="relative flex text-gray-500 bg-gray-800 rounded-full w-8 h-8 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 items-center justify-center"
            aria-label="Notifications"
            onClick={() => {
              setCurrentPageData([{ target: "notifcations" }]);
            }}
          >
            <FontAwesomeIcon className="w-6 h-6 cursor-pointer" icon={faBell} />

            {notifications && (notifications as any).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                {(notifications as any).length}
              </span>
            )}
          </button>

          {/* Profile button */}
          <button
            type="button"
            className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            aria-expanded={isProfileStats}
            onClick={() => {
              setProfileState(!isProfileStats);
            }}
            aria-label="User menu"
          >
            {user?.avatar !== "" && (
              <img
                className="w-8 h-8 rounded-full cursor-pointer"
                src={user?.avatar}
                alt="user photo"
              />
            )}
          </button>
        </div>

        {/* Profile dropdown */}
        {isProfileStats && (
          <div
            className="z-50 absolute top-full right-4 mt-2 w-48 text-base list-none divide-y divide-gray-100 rounded-lg shadow-lg bg-gray-800 "
            role="menu"
          >
            <div className="px-4 py-3">
              <span className="block text-sm text-white"> {user?.name}</span>
              <span className="block text-sm text-gray-300 truncate">
                {user?.email}
              </span>
            </div>
            <ul className="py-2" aria-labelledby="user-menu-button" role="none">
              <li>
                <a
                  onClick={() => {
                    setCurrentPageData([{ target: "settings" }]);
                    setProfileState(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 cursor-pointer"
                  role="menuitem"
                >
                  Settings
                </a>
              </li>
              <li>
                <a
                  onClick={async () => {
                    setCurrentPageData([
                      {
                        target: "profile",
                        user: user,
                        playlists: playlists,
                      },
                    ]);
                    setProfileState(false);
                  }}
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                  role="menuitem"
                >
                  Profile
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    setCurrentPageData([{ target: "makesong" }]);
                    setProfileState(false);
                  }}
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                  role="menuitem"
                >
                  Upload song
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    logout();
                    setProfileState(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                  role="menuitem"
                >
                  Sign out
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
