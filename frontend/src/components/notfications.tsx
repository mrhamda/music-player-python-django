import { useState, useEffect, useRef } from "react";
import {
  faPlay,
  faEllipsisH,
  faClock,
  faTimes,
  faPause,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useProjectContext } from "../context/ProjectContext";

export default function Notfications() {
  const [alertV, setAlert] = useState("");

  // State for the playlist image dropdown (new)
  const [, setOpenPlaylistMenu] = useState(false);

  // States for songs dropdown
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [openNestedIndex, setOpenNestedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSongID, setCurrentSongID] = useState("");

  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const playlistRef = useRef<HTMLDivElement | null>(null);

  const [notfications, setNotfications] = useState<any>(null);

  const {
    user,
    formatTimeFromSecToMin,
    getCookie,
    addToPlaylist,
    fetchUserPlaylists,
    setCurrentPageData,
    playlists,
    setPlaying,
    setMusicPlaying,
    musicPlaying,
    playing,
    removeExisitingPlaylist,
  } = useProjectContext();

  const [playlistsCleaned, setPlaylistsCleaned] = useState(
    Object.values(playlists)
  );

  function toggleMenu(index: number) {
    if (openMenuIndex === index) {
      setOpenMenuIndex(null);
      setOpenNestedIndex(null);
      setSearchQuery("");
    } else {
      setOpenMenuIndex(index);
      setOpenNestedIndex(null);
      setSearchQuery("");
    }
  }

  useEffect(() => {
    setPlaylistsCleaned(Object.values(playlists));
  }, [playlists]);

  function toggleNestedDropdown(index: number) {
    setOpenNestedIndex((prev) => (prev === index ? null : index));
    setSearchQuery("");
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        playlistRef.current &&
        !playlistRef.current.contains(target)
      ) {
        setOpenMenuIndex(null);
        setOpenNestedIndex(null);
        setOpenPlaylistMenu(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDaysAgo = (dateString: string | Date) => {
    const published = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - published.getTime();

    if (diffTime < 0) return "just now"; // Optional: future dates

    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    }

    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    }

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  async function addToFavorites(songID: number) {
    const formdata = new FormData();

    formdata.append("user_id", String(user!.id));
    formdata.append("song_id", String(songID));

    try {
      const res = await fetch("/api/add_song_to_favorites/", {
        method: "POST",
        body: formdata,
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
        credentials: "include",
      });

      const resJson = await res.json();

      if (res.ok) {
        setAlert("Successfully added to favorites");

        setTimeout(() => {
          setAlert("");
        }, 5000);
      } else {
        console.log(resJson);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function relodNotifcations() {
    try {
      const res = await fetch(`/api/get_user_notifications/?id=${user?.id}`);

      const resJson = await res.json();

      console.log("notifcations", resJson);

      if (res.ok) {
        setNotfications(resJson.notifications);
        await deleteNotifcations();
      } else {
        console.log(resJson.error);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function visitArtist(id: number) {
    try {
      const res = await fetch(`/api/get-user/?id=${id}`);

      const resJson = await res.json();

      if (!res.ok) {
        console.log(resJson.error);
      } else {
        return resJson.user;
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function deleteNotifcations() {
    try {
      const res = await fetch(`/api/remove_user_notifications/?id=${user?.id}`);

      const resJson = await res.json();

      if (resJson.error) {
        console.log(resJson.error);
      }
    } catch (e) {
      console.log(e);
    }
  }
  useEffect(() => {
    relodNotifcations();
  }, []);

  async function addExisitingPlaylist(playlist_id: number) {
    const formData = new FormData();

    formData.append("user_id", String(user?.id));

    formData.append("playlist_id", String(playlist_id));

    try {
      const res = await fetch("/api/add_existing_playlist/", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const resJson = await res.json();

      if (res.ok) {
        fetchUserPlaylists();
      }

      console.log(resJson);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div
      style={{
        flexGrow: 1,
        marginLeft: 0,
        fontSize: 20,
      }}
      className="h-[100vh] dark:bg-gray-700 p-4 py-25 "
    >
      {alertV && (
        <div className="fixed top-6 inset-x-0 flex justify-center z-50 px-4">
          <div className="bg-green-500 text-white rounded-md shadow-lg max-w-xs w-full px-3 py-2 text-sm flex items-start justify-between gap-3">
            <span className="break-words flex-1">{alertV}</span>

            <button
              onClick={() => setAlert("")}
              className="text-white hover:text-gray-200"
            >
              <FontAwesomeIcon icon={faTimes} size="sm" />
            </button>
          </div>
        </div>
      )}
      {/* Playlist Header */}
      <div className="flex flex-col items-center mb-6 px-2 sm:px-0 relative">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center truncate max-w-full">
            What's new?
          </h2>
        </div>
      </div>

      {/* Search bar */}

      {/* Song List */}
      {notfications !== null &&
      Array.isArray(notfications) &&
      notfications.length > 0 ? (
        <ul
          className="space-y-4 relative flex flex-col px-2 sm:px-0"
          ref={dropdownRef}
        >
          {notfications !== null &&
            notfications.map((_note: any, index: number) => (
              <li
                key={index}
                className="bg-gray-900 rounded-lg p-5 mb-5 shadow-lg border border-gray-800 relative hover:shadow-xl transition-shadow duration-300"
              >
                {/* Title on its own row */}
                <p className="text-white font-bold text-xl mb-4">
                  {_note.title}
                </p>

                {/* Row with play button + image + song name + ellipsis */}
                <div className="flex items-center gap-5 max-w-full truncate">
                  {_note.song !== null &&
                    (musicPlaying?.id === _note.song.id ? (
                      playing ? (
                        <button
                          onClick={() => setPlaying(() => false)}
                          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition shrink-0"
                        >
                          <FontAwesomeIcon icon={faPause} className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setMusicPlaying(_note.song);
                            setPlaying(() => true);
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition shrink-0"
                        >
                          <FontAwesomeIcon icon={faPlay} className="w-3 h-3" />
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => {
                          setMusicPlaying(_note.song);
                          setPlaying(() => true);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition shrink-0"
                      >
                        <FontAwesomeIcon icon={faPlay} className="w-3 h-3" />
                      </button>
                    ))}

                  <img
                    src={
                      _note.song !== null
                        ? _note.song.image
                        : _note.playlist.image
                    }
                    alt={
                      _note.song !== null
                        ? _note.song.name
                        : _note.playlist.name
                    }
                    className="w-14 h-14 rounded-full object-cover shrink-0 ml-1 border-2 border-gray-700"
                    loading="lazy"
                  />

                  <div className="flex flex-col min-w-0 relative">
                    {/* Song name with ellipsis */}
                    <p
                      className="font-semibold text-white text-lg truncate pr-8 max-w-[14rem]"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {_note.song !== null
                        ? _note.song.name
                        : _note.playlist.name}
                    </p>

                    {/* Button positioned separately */}
                    <button
                      onClick={() => {
                        if (_note.song !== null) {
                          setCurrentSongID(_note.song.id);
                        }
                        toggleMenu(index);
                        setOpenPlaylistMenu((prev) => !prev);
                      }}
                      aria-expanded={openMenuIndex === index}
                      aria-controls={`dropdown-${index}`}
                      aria-haspopup="true"
                      id={`dropdown-button-${index}`}
                      type="button"
                      className="absolute right-0 top-0 text-gray-400 hover:text-white cursor-pointer transition-colors duration-200"
                      aria-label="More options"
                    >
                      <FontAwesomeIcon icon={faEllipsisH} />
                    </button>

                    {/* Duration below */}
                    <p className="text-gray-400 font-mono text-sm mt-1 truncate">
                      {_note.song !== null
                        ? formatTimeFromSecToMin(_note.song.duration)
                        : formatTimeFromSecToMin(
                            _note.playlist?.songs?.reduce(
                              (acc: number, song: any) =>
                                acc + (song?.duration || 0),
                              0
                            )
                          )}
                    </p>
                  </div>
                </div>

                {/* Artist name and days ago in a right aligned row below */}
                <div className="flex justify-end items-center gap-3 text-sm text-gray-400 mt-5 select-none truncate">
                  <img
                    className="rounded-full w-6 h-6 object-cover border-2 border-gray-700"
                    src={
                      _note.song !== null
                        ? _note.song.owner_data.avatar
                        : _note.playlist.owner_data.avatar
                    }
                    alt={`${
                      _note.song !== null
                        ? _note.song.owner_data.name
                        : _note.playlist.owner_data.name
                    } avatar`}
                  />
                  <p className="truncate italic">
                    {_note.song !== null
                      ? _note.song.owner_data.name
                      : _note.playlist.owner_data.name}
                  </p>
                  <p className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faClock} className="text-gray-500" />
                    <span>{getDaysAgo(_note.created_at)}</span>
                  </p>
                </div>

                {/* Dropdown menu */}
                {openMenuIndex === index && (
                  <div
                    id={`dropdown-${index}`}
                    className="z-10 bg-white rounded-lg shadow-lg w-48 dark:bg-gray-700 absolute right-0 top-full mt-2 border border-gray-300 dark:border-gray-600 text-sm max-w-full"
                    role="menu"
                    aria-labelledby={`dropdown-button-${index}`}
                    style={{ minWidth: "12rem" }}
                  >
                    <ul className="py-1 text-gray-700 dark:text-gray-200">
                      {_note.song !== null ? (
                        <>
                          <li role="none">
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                              role="menuitem"
                              onClick={() => {
                                addToFavorites(_note.song.id);

                                toggleMenu(index);

                                setOpenPlaylistMenu((prev) => !prev);
                              }}
                            >
                              Add to likes
                            </a>
                          </li>
                          <li role="none">
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                              role="menuitem"
                              onClick={() => {
                                setCurrentPageData([
                                  {
                                    target: "musicsingle",
                                    song: {
                                      ..._note.song,
                                      image: _note.song.image,
                                    },
                                    user: {
                                      name: _note.song.owner_data.name,
                                      id: _note.song.owner_data.id,
                                    },
                                  },
                                ]);

                                toggleMenu(index);

                                setOpenPlaylistMenu((prev) => !prev);
                              }}
                            >
                              Visit Song
                            </a>
                          </li>
                          <li role="none" className="relative">
                            <button
                              id={`doubleDropdownButton-${index}`}
                              type="button"
                              onClick={() => {
                                toggleNestedDropdown(index);
                              }}
                              className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white stext-sm"
                              aria-expanded={openNestedIndex === index}
                              aria-controls={`doubleDropdown-${index}`}
                              role="menuitem"
                            >
                              Add to playlist
                              <svg
                                className={`w-3 h-3 ms-3 rtl:rotate-180 transition-transform ${
                                  openNestedIndex === index ? "rotate-90" : ""
                                }`}
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 6 10"
                              >
                                <path
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="m1 9 4-4-4-4"
                                />
                              </svg>
                            </button>

                            {openNestedIndex === index && (
                              <div
                                id={`doubleDropdown-${index}`}
                                className="z-20 bg-white rounded-lg shadow-lg w-44 dark:bg-gray-700 absolute top-0 right-full mr-1 border border-gray-300 dark:border-gray-600 text-sm max-w-full overflow-y-auto"
                                role="menu"
                                aria-labelledby={`doubleDropdownButton-${index}`}
                                style={{ minWidth: "11rem" }}
                              >
                                <div className="p-3">
                                  <input
                                    type="text"
                                    placeholder="Search playlists..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                      setSearchQuery(e.target.value)
                                    }
                                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                                    aria-label="Search playlists"
                                  />
                                </div>
                                <ul className="max-h-35 text-gray-700 dark:text-gray-200">
                                  {playlistsCleaned
                                    .filter((playlist) => {
                                      return (
                                        playlist.name
                                          .toLowerCase()
                                          .includes(
                                            searchQuery.toLowerCase()
                                          ) && playlist.owner === user!.id
                                      );
                                    })
                                    .map((_playlist) => (
                                      <li key={_playlist.id}>
                                        <button
                                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-full text-left"
                                          role="menuitem"
                                          onClick={() => {
                                            addToPlaylist(
                                              currentSongID,
                                              _playlist.id
                                            );
                                            setAlert(
                                              "Successfully added to list"
                                            );

                                            setTimeout(() => {
                                              setAlert("");
                                            }, 5000);

                                            fetchUserPlaylists();

                                            setOpenPlaylistMenu(false);

                                            toggleMenu(index);

                                            setOpenPlaylistMenu(
                                              (prev) => !prev
                                            );
                                          }}
                                        >
                                          <img
                                            src={_playlist.img}
                                            alt={_playlist.name}
                                            className="w-6 h-6 rounded-full object-cover"
                                          />
                                          {_playlist.name}
                                        </button>
                                      </li>
                                    ))}
                                  {playlistsCleaned.filter((playlist) =>
                                    playlist.name
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase())
                                  ).length === 0 && (
                                    <li className="px-3 py-2 text-gray-400 dark:text-gray-500">
                                      No playlists found
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </li>
                        </>
                      ) : (
                        <li role="none">
                          <a
                            href="#"
                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            role="menuitem"
                            onClick={async () => {
                              toggleMenu(index);
                              setOpenPlaylistMenu((prev) => !prev);

                              const alreadyExists = playlistsCleaned.some(
                                (pl) => pl.id === _note.playlist.id
                              );

                              if (!alreadyExists) {
                                addExisitingPlaylist(_note.playlist.id);
                                setAlert("Added playlist!");
                              } else {
                                removeExisitingPlaylist(_note.playlist.id);
                                setAlert("Removed playlist!");
                              }
                            }}
                          >
                            {playlistsCleaned.some(
                              (pl) => pl.id === _note.playlist.id
                            )
                              ? "Remove playlist"
                              : "Add playlist"}
                          </a>
                        </li>
                      )}

                      <li role="none">
                        <a
                          href="#"
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          role="menuitem"
                          onClick={async () => {
                            const artistUser = await visitArtist(
                              _note.song !== null
                                ? _note.song.owner_data.id
                                : _note.playlist.owner_data.id
                            );

                            if (artistUser !== null) {
                              setCurrentPageData([
                                { target: "profile", user: artistUser },
                              ]);
                            }
                            toggleMenu(index);

                            setOpenPlaylistMenu((prev) => !prev);
                          }}
                        >
                          Visit Artist
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            ))}
        </ul>
      ) : (
        <p className="x-3 py-2 text-gray-400 dark:text-gray-500">
          No notifcations
        </p>
      )}

      <div className="h-[50rem]"></div>
    </div>
  );
}
