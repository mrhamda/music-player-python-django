"use client";
import { faEllipsisH, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useProjectContext } from "../context/ProjectContext";

export default function MusicSingle() {
  const {
    currentPageData,
    user,
    setCurrentPageData,
    playlists,
    getCookie,
    fetchUserPlaylists,
    musicPlaying,
    setMusicPlaying,
    setPlaying,
    playing,
  } = useProjectContext();

  const myMockPlaylist = Object.values(playlists);

  const mockPlaylist = [
    {
      title: currentPageData[0].song.name,
      artist: currentPageData[0].user.name,
      image: currentPageData[0].song.image,
      audio: currentPageData[0].song.audio,
      id: currentPageData[0].song.id,
      owner_id: currentPageData[0].song.owner_id,
      owner: currentPageData[0].song.owner,
    },
    {
      title: "Ghost Town",
      artist: "Kanye West",
      image:
        "https://upload.wikimedia.org/wikipedia/en/0/03/Kanye_West_-_Ye.png",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      title: "Sunflower",
      artist: "Post Malone, Swae Lee",
      image:
        "https://upload.wikimedia.org/wikipedia/en/1/1d/Post_Malone_and_Swae_Lee_-_Sunflower.png",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
  ];

  const [currentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDropDownMenu, setShowDropDownMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [alert, setAlert] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const song = mockPlaylist[currentIndex];

  async function addToFavorites() {
    const formdata = new FormData();

    formdata.append("user_id", String(user!.id));
    formdata.append("song_id", String(song.id));

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
        setShowMenu(false);
        setShowDropDownMenu(false);
      } else {
        console.log(resJson);
      }
    } catch (e) {
      console.log(e);
    }
  }

  // FIX WHEN ENDING IT GOES TO NEXT MUSICE SINGLE

  async function addToPlaylist(songID: any, playlistID: any) {
    const formData = new FormData();

    formData.append("playlist_id", playlistID);
    formData.append("song_id", songID);

    console.log(playlistID);

    const res = await fetch("/api/add_song_to_playlist/", {
      method: "POST",
      body: formData,
      headers: {
        "X-CSRFToken": getCookie("csrftoken") ?? "",
      },
      credentials: "include",
    });

    const resJson = await res.json();

    if (res.ok) {
      setAlert("Successfully added to list");
      setShowMenu(false);
      setShowDropDownMenu(false);

      fetchUserPlaylists();

      setTimeout(() => {
        setAlert("");
      }, 5000);
    }

    console.log(resJson);
  }

  // const playPause = () => {
  //   if (!audioRef.current) return;
  //   if (isPlaying) {
  //     audioRef.current.pause();
  //   } else {
  //     audioRef.current.play();
  //   }
  //   setIsPlaying((prev) => !prev);
  // };

  // const prevSong = () => {
  //   setCurrentIndex(
  //     (prev) => (prev - 1 + mockPlaylist.length) % mockPlaylist.length
  //   );
  //   setIsPlaying(false);
  //   setShowMenu(false);
  // };

  // const nextSong = () => {
  //   setCurrentIndex((prev) => (prev + 1) % mockPlaylist.length);
  //   setIsPlaying(false);
  //   setShowMenu(false);
  // };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (isPlaying) audio.play();
  }, [currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setCurrentPageData([{ target: "musicesingle", song: musicPlaying }]);
      setIsPlaying(true);
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("#dropdown-menu")) {
        setShowMenu(false);
        setShowDropDownMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    console.log("musicPlaying");

    if (musicPlaying && song) {
      if (musicPlaying.id === song.id) {
        setIsPlaying(playing);
      } else {
        console.log("SETTED IT TO FALSE");
        setIsPlaying(false);
      }
    }
  }, []);

  useEffect(() => {
    setIsPlaying(playing);

    if (musicPlaying && song) {
      if (musicPlaying.id === song.id) {
        setIsPlaying(playing);
      } else {
        console.log("SETTED IT TO FALSE");
        setIsPlaying(false);
      }
    }
  }, [playing]);

  useEffect(() => {
    console.log("SELECTED SONG", currentPageData[0].song);

    console.log("USER", user);
  }, []);

  return (
    <div className="h-[100vh] dark:bg-gray-700 p-4 py-10">
      {alert && (
        <div className="fixed top-6 inset-x-0 flex justify-center z-50 px-4">
          <div className="bg-green-500 text-white rounded-md shadow-lg max-w-xs w-full px-3 py-2 text-sm flex items-start justify-between gap-3">
            <span className="break-words flex-1">{alert}</span>
            <button
              onClick={() => setAlert("")}
              className="text-white hover:text-gray-200"
            >
              <FontAwesomeIcon icon={faTimes} size="sm" />
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center mb-6 px-2 sm:px-20 relative">
        <div className="bg-gray-800 p-8 rounded-lg shadow-md w-80 relative">
          <div>
            <img
              src={song.image}
              alt={song.title}
              className="w-64 h-64 mx-auto rounded-lg mb-4 shadow-lg shadow-gray-600"
            />
            <div id="dropdown-menu" className="absolute top-7 right-10 ">
              <button
                onClick={() => {
                  setShowMenu((prev) => !prev);
                  setShowDropDownMenu(false);
                }}
                className="cursor-pointer w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center p-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                <FontAwesomeIcon
                  icon={faEllipsisH}
                  className="text-white text-sm"
                />
              </button>
              {showMenu && (
                <div className="mt-2 right-0 dark:bg-gray-700 text-white rounded shadow-lg absolute z-10 w-40 p-2">
                  {user!.id === currentPageData[0].song.owner && (
                    <button
                      onClick={() => {
                        setCurrentPageData([
                          {
                            target: "editsong",
                            song: currentPageData[0].song,
                          },
                        ]);
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-600 text-sm cursor-pointer"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={(e: FormEvent) => {
                      e.preventDefault();
                      addToFavorites();
                    }}
                    className="block w-full text-left px-3 py-3 hover:bg-gray-600 text-sm cursor-pointer"
                  >
                    Add to favorites
                  </button>

                  <button
                    onClick={async () => {
                      const artistUser = await visitArtist(
                        currentPageData[0].user.id
                      );

                      if (artistUser !== null) {
                        setCurrentPageData([
                          { target: "profile", user: artistUser },
                        ]);
                      }
                    }}
                    className="block w-full text-left px-3 py-3 hover:bg-gray-600 text-sm cursor-pointer"
                  >
                    View artist
                  </button>

                  <button
                    onClick={() => {
                      setShowDropDownMenu((prev) => !prev);
                    }}
                    className="flex items-center justify-between w-full px-3 py-2 hover:bg-gray-600 text-sm cursor-pointer"
                  >
                    Add to Playlist
                    <svg
                      className={`w-3 h-3 ms-3 rtl:rotate-180 transition-transform ${
                        showDropDownMenu ? "rotate-90" : ""
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
                </div>
              )}
              {showDropDownMenu && (
                <div className="mt-2 right-0  top-25  rounded  absolute z-10 w-40 p-2">
                  <div
                    className="z-20 bg-white rounded-lg shadow-md w-40 dark:bg-gray-700 absolute top-0 right-full mr-1 border border-gray-300 dark:border-gray-600 text-sm max-w-full overflow-y-auto "
                    role="menu"
                    style={{ minWidth: "9rem" }} // smaller minWidth (144px)
                  >
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search playlists..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                      />
                    </div>
                    <ul className="max-h-35 text-gray-700 dark:text-gray-200">
                      {myMockPlaylist
                        .filter(
                          (playlist) =>
                            playlist.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) &&
                            playlist.owner === user?.id
                        )
                        .map((playlist) => (
                          <li key={playlist.id}>
                            <button
                              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-full text-left"
                              role="menuitem"
                              onClick={() => {
                                addToPlaylist(
                                  currentPageData[0].song.id,
                                  playlist.id
                                );

                                setShowMenu(false);
                                setShowDropDownMenu(false);
                              }}
                            >
                              <img
                                src={playlist.img}
                                alt={playlist.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              {playlist.name}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <h2 className="text-xl font-semibold text-center text-white">
            {song.title}
          </h2>
          <p className="text-gray-400 text-sm text-center">{song.artist}</p>

          <div className="mt-6 flex justify-center items-center">
            {/* <button
              className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
              onClick={prevSong}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="w-4 h-4 text-black"
                fill="currentColor"
              >
                <path
                  d="M6 4v16l12-8z"
                  transform="scale(-1,1) translate(-24,0)"
                />
              </svg>
            </button> */}

            <button
              onClick={() => {
                const _song: any = song;

                const _songCleaned: any = {
                  name: _song.title,
                  audio: _song.audio,
                  id: _song.id,
                  image: _song.image,
                  owner: _song.artist,
                  owner_id: _song.owner_id,
                };

                console.log(_song);

                setMusicPlaying(_songCleaned);

                if (!playing) {
                  setPlaying((prev) => !prev);
                  setIsPlaying((prev) => !prev);
                } else {
                  if (playing == true && musicPlaying.id == song.id) {
                    setPlaying((prev) => !prev);
                    setIsPlaying((prev) => !prev);
                  } else {
                    setPlaying(() => true);
                    setIsPlaying(true);
                  }
                }
              }}
              className="p-4 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none mx-4 text-black"
            >
              {isPlaying ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-black"
                  fill="currentColor"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-black"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* <button
              className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
              onClick={nextSong}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="w-4 h-4 text-black"
                fill="currentColor"
              >
                <path d="M6 4v16l12-8z" />
              </svg>
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
