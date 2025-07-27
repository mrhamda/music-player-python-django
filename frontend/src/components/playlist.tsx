import { useState, useEffect, useRef } from "react";
import {
  faPlay,
  faEllipsisH,
  faTimes,
  faPause,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useProjectContext } from "../context/ProjectContext";

export default function Playlist() {
  const {
    currentPageData,
    setCurrentPageData,
    getCookie,
    user,
    playlists,
    addToPlaylist,
    fetchUserPlaylists,
    removeFromPlaylist,
    formatTimeFromSecToMin,
    setMusicListPlaying,
    setCurrentListIndexMusic,
    musicListPlaying,
    currentListIndexMusic,
    setPlaying,
    playing,
    setMusicPlaying,
    musicPlaying,
    removeExisitingPlaylist,
  } = useProjectContext();

  const [playlistUser, setPlaylistUser] = useState<any>(null);

  const playlistData = currentPageData[0].playlist;

  const [playlistsCleaned, setPlaylistsCleaned] = useState(
    Object.values(playlists)
  );

  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    console.log(playlistData);
  }, []);

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

  async function fetchPlaylistOwner() {
    try {
      const res = await fetch(`/api/get-user/?id=${playlistData.owner}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const resJson = await res.json();

      setPlaylistUser(resJson.user);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    setTotalDuration(0);
    playlistData.songs.map((song: any) => {
      setTotalDuration((prev) => (prev += song.duration));
    });

    console.log("SONGS");
    console.log(playlistData.songs);
  }, [playlistData]);

  useEffect(() => {
    fetchPlaylistOwner();

    console.log("USER ID", user?.id);
    console.log("PLAYLIST OWNER", playlist);
  }, []);

  const playlist = {
    img: playlistData.image,
    name: playlistData.name,
    user: playlistUser,
    songs: playlistData.songs,
    id: playlistData.id,
    owner: playlistData.owner,
    visibility: playlistData.visibility,
  };

  useEffect(() => {
    setPlaylistsCleaned(Object.values(playlists));
  }, [playlists]);

  // State for the playlist image dropdown (new)
  const [openPlaylistMenu, setOpenPlaylistMenu] = useState(false);

  // States for songs dropdown
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [openNestedIndex, setOpenNestedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [songSearchQuery, setSongSearchQuery] = useState("");

  const [currentSongID, setCurrentSongID] = useState("");

  const [isExistingAdded, setIsExistingAdded] = useState(false);

  const [alertV, setAlert] = useState("");

  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const playlistRef = useRef<HTMLDivElement | null>(null);

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

  function toggleNestedDropdown(index: number) {
    setOpenNestedIndex((prev) => (prev === index ? null : index));
    setSearchQuery("");
  }

  // Toggle for playlist image menu
  function togglePlaylistMenu() {
    setOpenPlaylistMenu((prev) => !prev);
    // Close other menus
    setOpenMenuIndex(null);
    setOpenNestedIndex(null);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function addExisitingPlaylist() {
    const formData = new FormData();

    formData.append("user_id", String(user?.id));

    formData.append("playlist_id", String(playlist.id));

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

  async function isItAdded() {
    const formData = new FormData();

    formData.append("user_id", String(user?.id));

    formData.append("playlist_id", String(playlist.id));

    try {
      const res = await fetch("/api/is_existing_exist_on_me/", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const resJson = await res.json();

      if (resJson.message == "Does exist") {
        setIsExistingAdded(true);
      } else if (resJson.message == "Does not exist") {
        setIsExistingAdded(false);
      }

      console.log(resJson);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    isItAdded();
  }, [playlist]);

  useEffect(() => {
    if (playlist == null) {
      fetchUserPlaylists();
    }
  }, [playlists]);

  const filteredSongs = playlistData.songs.filter(
    (song: any) =>
      song.name.toLowerCase().includes(songSearchQuery.toLowerCase()) ||
      song.owner.toLowerCase().includes(songSearchQuery.toLowerCase())
  );

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
        <div className="relative inline-block" ref={playlistRef}>
          {(playlist as any).visibility == false ? (
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 mb-4">
              <img
                src={playlist.img}
                alt="Playlist Cover"
                className="w-full h-full rounded-lg object-cover"
              />
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 p-0.25 rounded-full w-5 h-5 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faEyeSlash}
                  className="text-xs text-white"
                />
              </div>
            </div>
          ) : (
            <img
              src={playlist.img}
              alt="Playlist Cover"
              className="w-36 h-36 sm:w-48 sm:h-48 rounded-lg object-cover mb-4"
            />
          )}

          <button
            className="absolute top-0 left-full ml-2 p-1 text-white cursor-pointer hover:opacity-60"
            aria-label="More options"
            onClick={togglePlaylistMenu}
            aria-expanded={openPlaylistMenu}
            aria-controls="playlist-dropdown"
            type="button"
          >
            <FontAwesomeIcon icon={faEllipsisH} />
          </button>

          {openPlaylistMenu && (
            <div
              id="playlist-dropdown"
              className="z-10 bg-white rounded-lg shadow-md w-48 dark:bg-gray-700 absolute  top-5 right-0  ml-2 border border-gray-300 dark:border-gray-600 text-sm max-w-full h-[12rem]"
              role="menu"
              aria-labelledby="playlist-dropdown-button"
              style={{ minWidth: "12rem" }}
            >
              <ul className="py-1 text-gray-700 dark:text-gray-200">
                {Number(playlistData.owner) === user!.id ? (
                  // Check if playlist is "artist playlist"
                  playlistData.image === user!.avatar &&
                  playlistData.name === user!.name ? (
                    // Artist playlist: only show Remove
                    <li role="none">
                      <a
                        href="#"
                        className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        role="menuitem"
                        onClick={() => {
                          removeExisitingPlaylist(playlistData.id);
                          setCurrentPageData([{ target: "" }]);
                        }}
                      >
                        Remove playlist
                      </a>
                    </li>
                  ) : (
                    // Normal playlist owned by user: show Edit option
                    <li role="none">
                      <a
                        href="#"
                        className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        role="menuitem"
                        onClick={() => {
                          setCurrentPageData([
                            {
                              target: "editplaylist",
                              playlist: {
                                id: playlistData.id,
                                owner: playlistData.owner,
                                name: playlistData.name,
                                image: playlistData.image,
                                visibility: playlistData.visibility,
                              },
                            },
                          ]);
                        }}
                      >
                        Edit playlist
                      </a>
                    </li>
                  )
                ) : // User does NOT own playlist
                isExistingAdded === false ? (
                  <li role="none">
                    <a
                      href="#"
                      className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      role="menuitem"
                      onClick={() => {
                        addExisitingPlaylist();
                        setOpenPlaylistMenu((prev) => !prev);
                      }}
                    >
                      Add playlist
                    </a>
                  </li>
                ) : (
                  <li role="none">
                    <a
                      href="#"
                      className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      role="menuitem"
                      onClick={() => {
                        removeExisitingPlaylist(playlistData.id);
                        setCurrentPageData([{ target: "" }]);
                      }}
                    >
                      Remove playlist
                    </a>
                  </li>
                )}
              </ul>

              <div className="pb-100"></div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center truncate max-w-full">
            {playlist.name}
          </h2>

          {playing && (musicListPlaying as any).id === playlist.id ? (
            <button
              onClick={() => {
                setPlaying(() => false);
              }}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition shrink-0"
            >
              <FontAwesomeIcon icon={faPause} className="w-3 h-3" />
            </button>
          ) : totalDuration ? (
            <button
              onClick={() => {
                const playlistwithNoType: any = playlist;

                if ((musicListPlaying as any).id !== playlist.id) {
                  setMusicListPlaying(playlistwithNoType);

                  setMusicPlaying(playlistData.songs[0]);

                  setCurrentListIndexMusic(() => 0);
                }

                setPlaying(() => true);
              }}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition shrink-0"
            >
              <FontAwesomeIcon icon={faPlay} className="w-3 h-3" />
            </button>
          ) : (
            <span></span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-gray-400 text-center truncate max-w-full mt-5">
          By {playlistData.user !== null && playlistData.user.name}
        </p>

        {totalDuration !== 0 && (
          <p className="text-xs sm:text-sm text-gray-400 text-center truncate max-w-full mt-5">
            {formatTimeFromSecToMin(totalDuration)} Mins
          </p>
        )}
      </div>

      {/* Search bar */}
      <div className="mb-4 px-2 sm:px-0">
        <input
          type="text"
          placeholder="Search songs..."
          value={songSearchQuery}
          onChange={(e) => setSongSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Song List */}
      <ul
        className="space-y-4 relative flex flex-col px-2 sm:px-0"
        ref={dropdownRef}
      >
        {filteredSongs.length === 0 && (
          <li className="text-gray-400 text-center py-4">No songs found.</li>
        )}

        {filteredSongs.map((song: any, index: any) => (
          <li
            key={index}
            className={`flex items-center justify-between border-b border-gray-700 pb-2 relative rounded-lg transition-colors duration-300 hover:bg-gray-800 ${
              index === currentListIndexMusic &&
              (musicListPlaying as any).id == playlist.id
                ? "bg-gray-800 shadow-inner ring-1 ring-gray-600"
                : ""
            }`}
          >
            <div className="flex items-center gap-3 max-w-[70%] sm:max-w-full truncate">
              {index === currentListIndexMusic &&
                (musicPlaying && playing && musicPlaying.id === song.id ? (
                  <button
                    onClick={() => {
                      setPlaying(() => false);
                    }}
                    className="text-gray-300 hover:text-white cursor-pointer shrink-0"
                  >
                    <FontAwesomeIcon icon={faPause} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if ((musicListPlaying as any).id == song.id) {
                        setCurrentListIndexMusic(index);
                      } else {
                        console.log("SETTING LIST", playlist);
                        setMusicListPlaying(playlist as any);
                        setCurrentListIndexMusic(index);
                        setPlaying(() => true);
                        setMusicPlaying(song);
                      }
                    }}
                    className="text-gray-300 hover:text-white cursor-pointer shrink-0"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                  </button>
                ))}

              {index !== currentListIndexMusic && (
                <button
                  onClick={() => {
                    if ((musicListPlaying as any).id == song.id) {
                      setCurrentListIndexMusic(index);
                      setPlaying(() => true);
                    } else {
                      setMusicListPlaying(playlist as any);
                      setCurrentListIndexMusic(index);
                      setMusicPlaying(song);

                      setPlaying(() => true);
                    }
                  }}
                  className="text-gray-300 hover:text-white cursor-pointer shrink-0"
                >
                  <FontAwesomeIcon icon={faPlay} />
                </button>
              )}

              <div className="flex items-center gap-3 w-full max-w-xs">
                <img
                  className="w-[3rem] h-[3rem] rounded-full object-cover flex-shrink-0"
                  src={song.image}
                  alt=""
                />
                <div className="flex flex-col overflow-hidden">
                  <p
                    className="font-semibold text-white truncate"
                    style={{ fontSize: "1rem" }}
                  >
                    {song.name}
                  </p>
                  <p className="text-sm text-gray-400 truncate">{song.owner}</p>
                  <p className="text-sm text-gray-400 truncate">
                    {" "}
                    {formatTimeFromSecToMin(song.duration)}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative shrink-0">
              <button
                onClick={() => {
                  toggleMenu(index);
                  setCurrentSongID(song.id);
                }}
                className="text-gray-300 hover:text-white cursor-pointer mr-5"
                aria-expanded={openMenuIndex === index}
                aria-controls={`dropdown-${index}`}
                aria-haspopup="true"
                id={`dropdown-button-${index}`}
                type="button"
              >
                <FontAwesomeIcon icon={faEllipsisH} />
              </button>

              {openMenuIndex === index && (
                <div
                  id={`dropdown-${index}`}
                  className="z-10 bg-white rounded-lg shadow-md w-48 dark:bg-gray-700 absolute right-0 mt-2 border border-gray-300 dark:border-gray-600 text-sm max-w-full"
                  role="menu"
                  aria-labelledby={`dropdown-button-${index}`}
                  style={{ minWidth: "12rem" }}
                >
                  <ul className="py-1 text-gray-700 dark:text-gray-200">
                    <li role="none">
                      <a
                        href="#"
                        className="block px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        role="menuitem"
                        onClick={() => {
                          addToFavorites(song.id);
                          togglePlaylistMenu();

                          setOpenPlaylistMenu(false);
                        }}
                      >
                        Add to likes
                      </a>
                    </li>

                    {playlist.owner === user?.id && (
                      <li role="none">
                        <a
                          className="block px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          role="menuitem"
                          onClick={() => {
                            removeFromPlaylist(currentSongID, playlist.id);

                            togglePlaylistMenu();

                            setOpenPlaylistMenu(false);

                            const filtered = (() => {
                              const playlist = playlistsCleaned.find(
                                (playlist) => playlist.id === playlistData.id
                              );

                              if (!playlist) return null;

                              return {
                                ...playlist,
                                songs: Array.isArray(playlist.songs)
                                  ? playlist.songs.filter(
                                      (song: any) => song.id !== currentSongID
                                    )
                                  : [],
                              };
                            })();

                            console.log("playlistsCleaned filtered");
                            console.log(filtered);

                            console.log("playlistsCleaned");
                            console.log(playlistsCleaned);

                            setCurrentPageData([
                              {
                                target: "playlist",
                                playlist: {
                                  owner: filtered.owner,
                                  id: filtered.id,
                                  name: filtered.name,
                                  image: filtered.img,
                                  visibility: filtered.visibility,
                                  songs: filtered.songs,
                                },
                              },
                            ]);
                          }}
                        >
                          Remove from playlist
                        </a>
                      </li>
                    )}

                    <li role="none" className="relative">
                      <button
                        id={`doubleDropdownButton-${index}`}
                        type="button"
                        onClick={() => toggleNestedDropdown(index)}
                        className="flex items-center justify-between w-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white text-sm"
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
                          className="z-20 bg-white rounded-lg shadow-md w-40 dark:bg-gray-700 absolute top-0 right-full mr-1 border border-gray-300 dark:border-gray-600 text-sm max-w-full overflow-y-auto "
                          role="menu"
                          aria-labelledby={`doubleDropdownButton-${index}`}
                          style={{ minWidth: "9rem" }} // smaller minWidth (144px)
                        >
                          <div className="p-2">
                            {/* <input
                              type="text"
                              placeholder="Search playlists..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                            /> */}
                          </div>
                          <ul className="max-h-35 text-gray-700 dark:text-gray-200">
                            {playlistsCleaned
                              .filter((playlist) => {
                                if (
                                  playlist.id !== playlistData.id &&
                                  playlist.owner === playlistData.owner
                                ) {
                                  return playlist.name
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase());
                                }
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
                                      setAlert("Successfully added to list");

                                      setTimeout(() => {
                                        setAlert("");
                                      }, 5000);

                                      fetchUserPlaylists();

                                      togglePlaylistMenu();

                                      setOpenPlaylistMenu(false);
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
                  </ul>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="h-[50rem]"></div>
    </div>
  );
}
