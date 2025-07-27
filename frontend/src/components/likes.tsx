import { useState, useEffect, useRef } from "react";
import {
  faPlay,
  faEllipsisH,
  faHeart,
  faTimes,
  faPause,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useProjectContext } from "../context/ProjectContext";

export default function Likes() {
  const {
    user,
    formatTimeFromSecToMin,
    playlists,
    addToPlaylist,
    getCookie,
    setCurrentPageData,
    playing,
    setMusicListPlaying,
    musicListPlaying,
    setPlaying,
    currentListIndexMusic,
    setCurrentListIndexMusic,
    setMusicPlaying,
    musicPlaying,
    favoriteID,
  } = useProjectContext();

  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [openNestedIndex, setOpenNestedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [songSearchQuery, setSongSearchQuery] = useState("");

  const [favoritesPlaylist, setFavoritesPlaylist] = useState([]);

  const [currentSongsID, setCurrentSongsID] = useState(0);

  const [filteredSongs, setFilteredSongs] = useState([]);

  const [totalTime, setTotalTime] = useState(0);

  const [alertV, setAlert] = useState("");

  const dropdownWrapperRef = useRef<HTMLDivElement | null>(null);

  const playlistsCleaned = Object.values(playlists);

  // const playlistData = currentPageData[0].playlist;

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

  async function fetchFavorites() {
    try {
      const res = await fetch(`api/get_user_favorites/?id=${user!.id}`);

      const resJson = await res.json();

      if (res.ok) {
        setFavoritesPlaylist(resJson.songs);
      } else {
        console.log(resJson);
      }

      console.log(resJson.songs);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    fetchFavorites();
  }, []);

  function toggleNestedDropdown(index: number) {
    setOpenNestedIndex((prev) => (prev === index ? null : index));
    setSearchQuery("");
  }

  async function removeFromFavorites(songID: number) {
    const formData = new FormData();

    formData.append("user_id", String(user?.id));
    formData.append("song_id", String(songID));

    try {
      const res = await fetch("/api/remove_song_from_favorites/", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const resJson: any = await res.json();

      console.log(resJson);

      if (res.ok) {
        fetchFavorites();
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownWrapperRef.current &&
        !dropdownWrapperRef.current.contains(event.target as Node)
      ) {
        setOpenMenuIndex(null);
        setOpenNestedIndex(null);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setTotalTime(0);

    favoritesPlaylist.forEach((x: any) => {
      setTotalTime((prev) => (prev += x.duration));
    });

    if (favoritesPlaylist.length !== 0) {
      setFilteredSongs(
        favoritesPlaylist.filter(
          (song: any) =>
            song.name.toLowerCase().includes(songSearchQuery.toLowerCase()) ||
            song.owner_name
              .toLowerCase()
              .includes(songSearchQuery.toLowerCase())
        )
      );
    }
  }, [favoritesPlaylist, songSearchQuery]);

  return (
    <div
      style={{ flexGrow: 1, marginLeft: 0, fontSize: 20 }}
      className="h-[100vh] dark:bg-gray-700 p-4 py-25"
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
      <div className="flex flex-col items-center mb-6 px-2 sm:px-0 relative">
        <div className="relative  bg-black w-[275px] h-[275px] flex justify-center items-center mb-5 rounded-full">
          <FontAwesomeIcon
            icon={faHeart}
            className="w-36 h-36 sm:w-48 sm:h-48 rounded-lg object-cover mb-4 mt-5 text-white "
            style={{
              fontSize: "15rem",
            }}
          />
          <button
            className="absolute top-0 left-full ml-2 p-1 text-white cursor-pointer hover:opacity-60"
            aria-label="More options"
            aria-controls="playlist-dropdown"
            type="button"
          ></button>
        </div>

        <div className="flex items-center justify-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center truncate max-w-full">
            Likes
          </h2>

          {musicListPlaying &&
          playing &&
          (musicListPlaying as any).id === favoriteID ? (
            <button
              onClick={() => setPlaying(() => false)}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition shrink-0"
            >
              <FontAwesomeIcon icon={faPause} className="w-3 h-3" />
            </button>
          ) : totalTime ? (
            <button
              onClick={() => {
                if (
                  !musicListPlaying ||
                  (musicListPlaying as any).id !== favoriteID
                ) {
                  console.log("FAVORITESPLAYLIST", favoritesPlaylist);
                  const mappedSong = favoritesPlaylist.map((item: any) => ({
                    audio: item.audio,
                    duration: item.duration,
                    name: item.name,
                    id: item.id,
                    visibility: item.visibility,
                    image: item.img,
                    owner: item.owner_name,
                    owner_id: item.owner_id,
                  }));

                  const playlistWithNoType: any = {
                    songs: mappedSong,
                    id: favoriteID,
                  };

                  setMusicListPlaying(playlistWithNoType);
                  setMusicPlaying(playlistWithNoType.songs[0]);
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

        {totalTime > 0 && (
          <div className="flex items-center justify-center gap-3">
            <p className="text-xl sm:text-1xl font-bold text-white text-center truncate max-w-full">
              {formatTimeFromSecToMin(totalTime)}
            </p>
          </div>
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
      <div ref={dropdownWrapperRef}>
        <ul className="space-y-4 relative flex flex-col px-2 sm:px-0">
          {totalTime <= 0 && (
            <li className="text-gray-400 text-center py-4">No songs found.</li>
          )}

          {totalTime > 0 &&
            filteredSongs.map((song: any, index) => (
              <li
                key={index}
                className={`flex items-center justify-between border-b border-gray-700 pb-2 relative rounded-lg transition-colors duration-300 hover:bg-gray-800 ${
                  index === currentListIndexMusic &&
                  (musicListPlaying as any).id == favoriteID
                    ? "bg-gray-800 shadow-inner ring-1 ring-gray-600"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3 max-w-[70%] sm:max-w-full truncate">
                  {index === currentListIndexMusic &&
                    (playing && musicPlaying && musicPlaying.id == song.id ? (
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
                          if (favoriteID == song.id) {
                            setCurrentListIndexMusic(() => index);
                          } else {
                            const mappedSong = favoritesPlaylist.map(
                              (item: any) => {
                                return {
                                  audio: item.audio,
                                  duration: item.duration,
                                  name: item.name,
                                  id: item.id,
                                  visibility: item.visibility,
                                  image: item.img,
                                  owner: item.owner_name,
                                  owner_id: item.owner_id,
                                };
                              }
                            );
                            setMusicListPlaying({
                              songs: mappedSong,
                              id: favoriteID,
                            } as any);
                            setCurrentListIndexMusic(() => index);
                            setPlaying(() => true);
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
                        if (favoriteID == song.id) {
                          setCurrentListIndexMusic(() => index);
                          setPlaying(() => true);
                        } else {
                          const mappedSong = favoritesPlaylist.map(
                            (item: any) => {
                              return {
                                audio: item.audio,
                                duration: item.duration,
                                name: item.name,
                                id: item.id,
                                visibility: item.visibility,
                                image: item.img,
                                owner: item.owner_name,
                                owner_id: item.owner_id,
                              };
                            }
                          );
                          setMusicListPlaying({
                            songs: mappedSong,
                            id: favoriteID,
                          } as any);
                          setCurrentListIndexMusic(() => index);
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
                      src={song.img}
                      alt=""
                    />
                    <div className="flex flex-col overflow-hidden">
                      <p
                        className="font-semibold text-white truncate"
                        style={{ fontSize: "1rem" }}
                      >
                        {song.name}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {song.owner_name}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {formatTimeFromSecToMin(song.duration)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative shrink-0">
                  <button
                    onClick={() => {
                      toggleMenu(index);
                      setCurrentSongsID(song.id);
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
                            onClick={() => removeFromFavorites(currentSongsID)}
                          >
                            Remove from likes
                          </a>
                        </li>
                        <li role="none">
                          <a
                            href="#"
                            className="block px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            role="menuitem"
                            onClick={async () => {
                              const artist = await visitArtist(song.owner);

                              if (artist !== null) {
                                setCurrentPageData([
                                  { target: "profile", user: artist },
                                ]);
                              }
                            }}
                          >
                            Go to artist
                          </a>
                        </li>
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
                              className="z-20 bg-white rounded-lg shadow-md w-40 dark:bg-gray-700 absolute top-0 right-full mr-1 border border-gray-300 dark:border-gray-600 text-sm max-w-full overflow-y-auto"
                              role="menu"
                              aria-labelledby={`doubleDropdownButton-${index}`}
                              style={{ minWidth: "9rem" }}
                            >
                              <div className="p-2">
                                <input
                                  type="text"
                                  placeholder="Search playlists..."
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                  className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                                />
                              </div>
                              <ul className="max-h-35 text-gray-700 dark:text-gray-200">
                                {playlistsCleaned
                                  .filter((p) =>
                                    p.name
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase())
                                  )
                                  .map((playlist) => (
                                    <li key={playlist.id}>
                                      <button
                                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-full text-left"
                                        role="menuitem"
                                        onClick={() => {
                                          addToPlaylist(
                                            currentSongsID,
                                            playlist.id
                                          );

                                          setAlert(
                                            "Successfully added to list"
                                          );

                                          setTimeout(() => {
                                            setAlert("");
                                          }, 5000);

                                          toggleMenu(index);
                                          toggleNestedDropdown(index);
                                        }}
                                      >
                                        <img
                                          className="w-6 h-6 rounded-full object-cover"
                                          src={playlist.img}
                                          alt={playlist.name}
                                        />
                                        {playlist.name}
                                      </button>
                                    </li>
                                  ))}
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
      </div>

      <div className="h-[50rem]"></div>
    </div>
  );
}
