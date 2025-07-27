import { Key, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMusic,
  faList,
  faPlay,
  faBookOpen,
  faPlus,
  faMinus,
  faPause,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useProjectContext } from "../context/ProjectContext";

// Mock variables

export default function ProfileWithTabs() {
  const [activeTab, setActiveTab] = useState("about");

  const {
    currentPageData,
    user,
    getCookie,
    setCurrentPageData,
    setMusicPlaying,
    setPlaying,
    musicPlaying,
    playing,
    setCurrentListIndexMusic,
    setMusicListPlaying,
    fetchUserPlaylists,
    removeExisitingPlaylist,
  } = useProjectContext();

  const [songs, setSongs] = useState([]);

  const profileUser = currentPageData[0].user;

  const [playlistActual, setPlaylistActual] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const [hasAddedArtist, setHasAddedAritst] = useState(false);

  const [artistPlaylistID, setArtistPlaylistID] = useState<number>();

  async function doesItHaveArtist() {
    const formData = new FormData();

    try {
      formData.append("user_id", String(user?.id));
      formData.append("artist_id", String(profileUser.id));

      const res = await fetch("/api/does_it_have_artist/", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const resJson = await res.json();

      setHasAddedAritst(resJson.has_playlist);
      setArtistPlaylistID(resJson.playlist_id);
      console.log(resJson);
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchAllSongs() {
    try {
      const res = await fetch(`/api/get_user_songs/?id=${profileUser.id}`);

      const resJson = await res.json();

      setSongs(resJson.songs);

      console.log(resJson.songs);

      console.log(songs);
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchPlaylists() {
    try {
      const res = await fetch(`/api/get_user_profile/?id=${profileUser?.id}`);

      const resJson = await res.json();

      const _playlists: any = Object.values(resJson.playlists);

      setPlaylistActual(_playlists);

      console.log(profileUser?.id);

      console.log("playlists");
      console.log(resJson);

      console.log(resJson.playlists);
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchFollowers() {
    try {
      const res = await fetch(`/api/get_user_followers/?id=${profileUser?.id}`);

      const resJson = await res.json();

      setFollowerCount(resJson.followers_count);
    } catch (e) {
      console.log(e);
    }
  }

  async function toggleFollwing() {
    try {
      const formData = new FormData();

      formData.append("user_id", String(user?.id));
      formData.append("follow_id", String(profileUser.id));

      const res = await fetch("/api/toggle_follow/", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const resJson = await res.json();

      setIsFollowing(!isFollowing);

      console.log(resJson);
    } catch (e) {
      console.log(e);
    }
  }

  async function loadIsFollowing() {
    try {
      const formData = new FormData();

      formData.append("user_id", String(user?.id));
      formData.append("follow_id", String(profileUser.id));

      const res = await fetch("/api/is_following/", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const resJson = await res.json();

      if (resJson.status === "following") {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }

      console.log(resJson);
    } catch (e) {
      console.log(e);
    }
  }

  async function addArtistAsPlaylist() {
    const formData = new FormData();

    formData.append("artist_id", String(profileUser.id));
    formData.append("user_id", String(user!.id));

    try {
      const res = await fetch(`/api/add_artist_as_playlist/`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const resJson = await res.json();

      console.log("ADD ARTIST");

      console.log(resJson);

      fetchUserPlaylists();

      setArtistPlaylistID(resJson.playlist_id);

      setHasAddedAritst(true);
    } catch (e) {
      console.log(e);
    }
  }

  async function getArtist(id: number) {
    try {
      const res = await fetch(`/api/get-user/?id=${id}`);

      const resJson = await res.json();
      if (resJson.error) {
        console.log(resJson.error);
      } else {
        const artist_user = resJson.user;

        return artist_user;
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    loadIsFollowing();
    doesItHaveArtist();
  }, []);

  useEffect(() => {
    console.log("hasAddedArtist");

    console.log(hasAddedArtist);
  }, [hasAddedArtist]);

  useEffect(() => {
    if (profileUser.id !== null) {
      fetchAllSongs();

      fetchPlaylists();

      fetchFollowers();
    }
  }, [profileUser.id]);

  return (
    <div className="h-[100vh] dark:bg-gray-700 p-10 py-5">
      <div className="flex flex-col items-center mb-6 px-2 sm:px-0 relative">
        <div className="max-w-2xl w-full mx-10 sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm bg-gray-800 text-white shadow-xl rounded-lg">
          <div className="relative rounded-t-lg h-32 overflow-hidden flex justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-600 mt-5">
              <img
                className="w-full h-full object-cover object-center"
                src={profileUser.avatar}
                alt="Profile Avatar"
              />

              {!hasAddedArtist ? (
                <button
                  className="absolute top-2 left-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-blue-700 p-4"
                  title="Add"
                  onClick={() => {
                    addArtistAsPlaylist();
                    fetchPlaylists();
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              ) : (
                <button
                  className="absolute top-2 left-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-blue-700 p-4"
                  title="Add"
                  onClick={() => {
                    console.log(artistPlaylistID, "artistPlaylistID");
                    removeExisitingPlaylist(artistPlaylistID as any);
                    setHasAddedAritst(false);
                    fetchPlaylists();
                  }}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
              )}
            </div>
          </div>

          <div className="text-center mt-2">
            <h2 className="font-semibold">{profileUser.name}</h2>
          </div>

          <ul className="py-4 mt-2 text-gray-700 flex items-center justify-around">
            <li className="flex flex-col items-center">
              <FontAwesomeIcon icon={faMusic} className="text-white" />
              {songs.length > 0 ? (
                <div className="text-white">{songs.length}</div>
              ) : (
                <div className="text-white">0</div>
              )}
            </li>
            <li className="flex flex-col items-center">
              <svg
                className="w-4 fill-current text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M7 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0 1c2.15 0 4.2.4 6.1 1.09L12 16h-1.25L10 20H4l-.75-4H2L.9 10.09A17.93 17.93 0 0 1 7 9zm8.31.17c1.32.18 2.59.48 3.8.92L18 16h-1.25L16 20h-3.96l.37-2h1.25l1.65-8.83zM13 0a4 4 0 1 1-1.33 7.76 5.96 5.96 0 0 0 0-7.52C12.1.1 12.53 0 13 0z" />
              </svg>
              <div className="text-white">{followerCount}</div>
            </li>
            <li className="flex flex-col items-center">
              <FontAwesomeIcon icon={faList} className="text-white" />
              {playlistActual.length > 0 ? (
                <div className="text-white">{playlistActual.length}</div>
              ) : (
                <div className="text-white">0</div>
              )}
            </li>
          </ul>

          {user?.id !== profileUser.id && (
            <div className="p-4 border-t mx-8 mt-2">
              {isFollowing ? (
                <button
                  className="w-1/2 block mx-auto text-center rounded-full bg-red-400 hover:shadow-lg font-semibold text-white px-6 py-2 hover:opacity-60 cursor-pointer"
                  onClick={() => {
                    toggleFollwing();
                    setFollowerCount((prev) => prev - 1);
                  }}
                >
                  Unfollow
                </button>
              ) : (
                <button
                  className="w-1/2 block mx-auto rounded-full bg-green-600 hover:shadow-lg font-semibold text-white px-6 py-2 hover:opacity-60 text-center cursor-pointer"
                  onClick={() => {
                    toggleFollwing();
                    setFollowerCount((prev) => prev + 1);
                  }}
                >
                  Follow
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div>
          {/* Tab buttons container */}
          <div className="max-w-2xl w-full mx-5 mt-4 bg-gray-700 rounded-lg shadow-inner   text-white font-semibold select-none gap-4 flex justify-center">
            {["about", "playlist", "music"].map((tab) => (
              <button
                key={tab}
                className={`flex-1 py-3 hover:bg-gray-600 transition-colors cursor-pointer ${
                  activeTab === tab ? "bg-gray-600" : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "music" && (
                  <FontAwesomeIcon icon={faMusic} className="mr-2" />
                )}
                {tab === "playlist" && (
                  <FontAwesomeIcon icon={faList} className="mr-2" />
                )}
                {tab === "about" && (
                  <FontAwesomeIcon icon={faBookOpen} className="mr-2" />
                )}
              </button>
            ))}
          </div>
        </div>
        {/* Tab content */}
        <div className="max-w-2xl w-full mx-auto mt-4 p-6 bg-gray-800 rounded-lg text-white min-h-[120px] shadow-lg">
          {activeTab === "about" && (
            <div>
              <p>{currentPageData[0].user.about}</p>
            </div>
          )}

          {activeTab === "playlist" && (
            <div className="space-y-4">
              {playlistActual.length > 0 &&
                playlistActual
                  .filter(
                    (x: any) =>
                      (x.visibility === true || x.owner === user?.id) &&
                      x.name !== user?.name
                  )
                  .map((playlist: any, i: Key | null | undefined) => (
                    <div
                      key={i}
                      className="group flex items-center bg-gray-700 p-2 rounded-lg shadow"
                    >
                      <div
                        className="flex items-center flex-1 hover:opacity-60 cursor-pointer"
                        onClick={() => {
                          setCurrentPageData([
                            {
                              target: "playlist",
                              playlist: {
                                owner: playlist.owner,
                                id: playlist.id,
                                name: playlist.name,
                                image: playlist.img,
                                visibility: playlist.visibility,
                                songs: playlist.songs,
                                user: { name: playlist.owner_name },
                              },
                            },
                          ]);
                        }}
                      >
                        {playlist.visibility == false ? (
                          <div className="relative w-16 h-16">
                            <img
                              src={playlist.img}
                              alt={playlist.name}
                              className="rounded-lg w-full h-full object-cover opacity-40"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faEyeSlash}
                                className="text-white text-xl"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-16 h-16">
                            <img
                              src={playlist.img}
                              alt={playlist.name}
                              className="rounded-lg w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="ml-4">
                          <div className="font-semibold">{playlist.name}</div>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          )}

          {activeTab === "music" && (
            <div className="space-y-4">
              {songs
                .filter(
                  (x: any) =>
                    x.visibility === true ||
                    x.owner === user?.id ||
                    x.owner_id === user?.id
                )
                .map((track: any, i: number) => (
                  <div
                    key={i}
                    className="group flex items-center bg-gray-700 p-2 rounded-lg shadow"
                  >
                    {/* Play/Pause Controls */}
                    {!musicPlaying || musicPlaying.id !== track.id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const songs_filtered = songs.filter(
                            (_s: any) => _s.visibility === true
                          );
                          const playlist: any = { songs: songs_filtered };
                          setPlaying(() => true);
                          setMusicPlaying(track);
                          setMusicListPlaying(playlist);
                          setCurrentListIndexMusic(() => i);
                        }}
                        className="p-4 hover:opacity-100"
                      >
                        <FontAwesomeIcon
                          icon={faPlay}
                          className="cursor-pointer hover:opacity-55"
                        />
                      </button>
                    ) : playing ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaying(() => false);
                        }}
                        className="p-4 hover:opacity-100"
                      >
                        <FontAwesomeIcon
                          icon={faPause}
                          className="cursor-pointer hover:opacity-55"
                        />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaying(() => true);
                        }}
                        className="p-4 hover:opacity-100"
                      >
                        <FontAwesomeIcon
                          icon={faPlay}
                          className="cursor-pointer hover:opacity-55"
                        />
                      </button>
                    )}

                    {/* Song Info */}
                    <div
                      className="flex items-center flex-1 hover:opacity-60 cursor-pointer"
                      onClick={async () => {
                        const artist = await getArtist(track.owner_id);
                        if (artist !== null) {
                          setCurrentPageData([
                            {
                              target: "musicsingle",
                              user: artist,
                              song: {
                                image: track.image,
                                audio: track.audio,
                                name: track.name,
                                user: artist,
                                owner: track.owner_id,
                                id: track.id,
                                visibility: track.visibility,
                                owner_id: track.owner_id,
                              },
                            },
                          ]);
                        }
                      }}
                    >
                      {track.visibility === false ? (
                        <div className="relative w-16 h-16">
                          <img
                            src={track.image}
                            alt={track.name}
                            className="rounded-lg w-full h-full object-cover opacity-40"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={faEyeSlash}
                              className="text-white text-xl"
                            />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={track.image}
                          alt={track.name}
                          className="rounded-lg w-16 h-16 object-cover"
                        />
                      )}

                      <div className="ml-4">
                        <div className="font-semibold">{track.name}</div>
                        <div className="text-sm text-gray-300">
                          Duration: {Math.floor(track.duration / 60)} mins
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      <div className="h-[40rem]"></div>
    </div>
  );
}
