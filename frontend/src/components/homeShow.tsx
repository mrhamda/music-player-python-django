import { faLeftLong, faRightLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState, useEffect } from "react";
import { useProjectContext } from "../context/ProjectContext";

export default function HomeShow() {
  const recentlyPlayedRef = useRef<HTMLDivElement>(null);
  const recentlyLikedRef = useRef<HTMLDivElement>(null);
  const peopleFollowingRef = useRef<HTMLDivElement>(null); // new ref

  // Recently Played arrows
  const [, setShowLeftRP] = useState(false);
  const [, setShowRightRP] = useState(true);

  // Recently Liked arrows
  const [, setShowLeftRL] = useState(false);
  const [, setShowRightRL] = useState(true);

  // People Following arrows (new)
  const [, setShowLeftPF] = useState(false);
  const [, setShowRightPF] = useState(true);

  // Responsive item width and count
  const [itemWidth, setItemWidth] = useState(140 + 16); // 140px + 16px gap
  const [itemsToShow, setItemsToShow] = useState(3);

  const [searchQuery, setSearchQuery] = useState("");

  const { login, getCookie, fetchUserPlaylists, user, setCurrentPageData } =
    useProjectContext();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [recentlyLiked, setRecentlyLiked] = useState([]);

  const [following, setFollowing] = useState([]);

  const [songs, setSongs] = useState([]);

  const [filteredSongs, setFilteredSongs] = useState([]);

  const [playlists, setPlaylists] = useState([]);

  const [filteredPlaylists, setFilteredPlaylists] = useState([]);

  const [recentlyPlayed, setRecentlyPlayed] = useState<any>();

  async function setUserData() {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/current_user/", {
        credentials: "include",

        headers: {
          "Content-Type": "application/json",

          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const data = await res.json();

      if (data.error) {
        console.log("User is not logged in");

        window.location.href = "/login";
      } else {
        login({
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          id: data.id,
          about: data.about,
        });

        console.log(data);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  }

  async function loadUsers() {
    try {
      const res = await fetch("/api/get_all_users/");

      const resJson: any = await res.json();

      console.log("Users");

      setUsers(resJson.users);
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchRecentlyLiked() {
    try {
      const res = await fetch(`/api/recently_liked/?id=${user?.id}`);

      const resJson: any = await res.json();

      setRecentlyLiked(resJson.recently_liked);

      if (resJson.error) {
        console.log(resJson.error);
      }

      console.log(resJson.recently_liked);
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchFollowing(userID: number) {
    try {
      const res = await fetch(`/api/get_users_following/?id=${userID}`);

      const resJson = await res.json();

      setFollowing(resJson.users);

      if (!res.ok) {
        console.log(resJson.error);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchSongs() {
    try {
      const res = await fetch("/api/get_all_songs/");

      const resJson = await res.json();

      if (resJson.error) {
        console.log(resJson.error);
      } else {
        setSongs(resJson.songs);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchPlaylists() {
    try {
      const res = await fetch("/api/get_all_playlists/");

      const resJson = await res.json();

      console.log("playlists");

      console.log(resJson);

      setPlaylists(resJson.playlists);
    } catch (e) {
      console.log(e);
    }
  }

  async function returnRecentlyPlayed() {
    try {
      const res = await fetch(`/api/return_recently_played/?id=${user?.id}`);

      const resJson = await res.json();

      if (resJson.error) {
        console.log(resJson.error);
      } else {
        console.log("Recently plaged", resJson);
        setRecentlyPlayed(resJson.songs);
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    setUserData();

    fetchSongs();

    loadUsers();

    fetchPlaylists();
  }, []);

  useEffect(() => {
    if (user !== null) {
      fetchUserPlaylists();

      fetchRecentlyLiked();

      fetchFollowing(user.id);

      returnRecentlyPlayed();
    }
  }, [user]);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      if (width < 640) {
        setItemWidth(100 + 12);
        setItemsToShow(2);
      } else if (width < 1024) {
        setItemWidth(120 + 14);
        setItemsToShow(3);
      } else {
        setItemWidth(140 + 16);
        setItemsToShow(4);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollWidth = itemsToShow * itemWidth;

  const scroll = (
    ref: React.RefObject<HTMLDivElement>,
    direction: "left" | "right"
  ) => {
    if (!ref.current) return;
    const container = ref.current;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const scrollAmount = direction === "left" ? -scrollWidth : scrollWidth;

    let targetScrollLeft = container.scrollLeft + scrollAmount;
    if (targetScrollLeft < 0) targetScrollLeft = 0;
    if (targetScrollLeft > maxScrollLeft) targetScrollLeft = maxScrollLeft;

    container.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  };

  const updateArrows = (
    ref: React.RefObject<HTMLDivElement>,
    setLeft: (v: boolean) => void,
    setRight: (v: boolean) => void
  ) => {
    const el = ref.current;
    if (!el) return;

    const scrollLeft = el.scrollLeft;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;

    setLeft(scrollLeft > 0);
    setRight(scrollLeft < maxScrollLeft - 1); // small tolerance for float rounding
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateArrows(recentlyPlayedRef, setShowLeftRP, setShowRightRP);
    }, 100); // 100ms delay

    return () => clearTimeout(timeout);
  }, []);

  // Effect for Recently Played
  useEffect(() => {
    const rp = recentlyPlayedRef.current;
    if (rp) {
      const onScroll = () =>
        updateArrows(recentlyPlayedRef, setShowLeftRP, setShowRightRP);
      rp.addEventListener("scroll", onScroll);
      updateArrows(recentlyPlayedRef, setShowLeftRP, setShowRightRP);
      return () => rp.removeEventListener("scroll", onScroll);
    }
  }, [itemWidth, itemsToShow]);

  // Effect for Recently Liked
  useEffect(() => {
    const rl = recentlyLikedRef.current;
    if (rl) {
      const onScroll = () =>
        updateArrows(recentlyLikedRef, setShowLeftRL, setShowRightRL);
      rl.addEventListener("scroll", onScroll);
      updateArrows(recentlyLikedRef, setShowLeftRL, setShowRightRL);
      return () => rl.removeEventListener("scroll", onScroll);
    }
  }, [itemWidth, itemsToShow]);

  // Effect for People Following (new)
  useEffect(() => {
    const pf = peopleFollowingRef.current;
    if (pf) {
      const onScroll = () =>
        updateArrows(peopleFollowingRef, setShowLeftPF, setShowRightPF);
      pf.addEventListener("scroll", onScroll);
      updateArrows(peopleFollowingRef, setShowLeftPF, setShowRightPF);
      return () => pf.removeEventListener("scroll", onScroll);
    }
  }, [itemWidth, itemsToShow]);

  const searchLower = searchQuery.toLowerCase().trim();

  useEffect(() => {
    if (users.length > 0) {
      const filteredUsers = users.filter((user: any) =>
        user.name.toLowerCase().includes(searchLower)
      );

      setFilteredUsers(filteredUsers);
    }
  }, [users, searchLower]);

  // async function fetchSong(id: number) {
  //   try {
  //     const res = await fetch(`api/get-song/?id=${id}`);
  //     if (!res.ok) {
  //       throw new Error(`HTTP error! status: ${res.status}`);
  //     }
  //     const resJson = await res.json();
  //     console.log("SONG", resJson);
  //     return resJson;
  //   } catch (e) {
  //     console.error("Error fetching user:", e);
  //     return null; // or handle it however you like
  //   }
  // }

  // async function fetchUser(id: number) {
  //   try {
  //     const res = await fetch(`/api/get-user/?id=${id}`);

  //     const resJson = await res.json();

  //     if (!res.ok) {
  //       console.log(resJson.error);
  //     } else {
  //       return resJson.user;
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  async function fetchArtist(id: number) {
    try {
      const res = await fetch(`/api/get-user/?id=${id}`);

      const resJson = await res.json();

      if (!res.ok) {
        console.log(resJson.error);
      }

      console.log("resJson");

      console.log(resJson);

      return resJson.user;
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (playlists.length > 0) {
      const filteredPlaylists = playlists.filter((playlist: any) =>
        playlist.name.toLowerCase().includes(searchLower)
      );

      setFilteredPlaylists(filteredPlaylists);
    }
  }, [playlists, searchLower]);

  useEffect(() => {
    if (songs.length > 0) {
      const _filteredSongs: any = songs.filter((song: any) =>
        song.name.toLowerCase().includes(searchLower)
      );

      setFilteredSongs(_filteredSongs);
    }
  }, [songs, searchLower]);

  // FIXING SONG SEARCH!

  return (
    <div className="h-[100vh] dark:bg-gray-700 p-10 py-5">
      <div className="w-full max-w-4xl flex flex-col items-center mb-6 px-2 sm:px-0 relative">
        <div className="w-full mb-6 px-4">
          <input
            type="text"
            placeholder="Search by user or song name..."
            onChange={(e) => {
              setSearchQuery(e.currentTarget.value);
            }}
            className="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {searchQuery.trim() !== "" ? (
          <div className="search-results space-y-8 px-4 max-w-4xl mx-auto">
            {/* Users */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Users</h2>
              {filteredUsers.length === 0 ? (
                <p className="text-gray-400">No users found.</p>
              ) : (
                <div className="flex flex-wrap gap-4 justify-center">
                  {filteredUsers.length > 0 &&
                    filteredUsers.map((user: any) => (
                      <div
                        key={user.id}
                        className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition flex flex-col items-center"
                        style={{ width: itemWidth - 16, minWidth: 150 }}
                        onClick={() => {
                          setCurrentPageData([
                            { target: "profile", user: user },
                          ]);
                        }}
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="rounded-full object-cover mb-3"
                          style={{
                            width: itemWidth - 40,
                            height: itemWidth - 40,
                            minWidth: 110,
                            minHeight: 110,
                          }}
                        />
                        <h3 className="text-sm font-semibold text-white truncate text-center">
                          {user.name}
                        </h3>
                      </div>
                    ))}
                </div>
              )}
            </section>

            {/* Playlists */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                Playlists
              </h2>
              {filteredPlaylists.length === 0 ? (
                <p className="text-gray-400">No playlists found.</p>
              ) : (
                <div className="flex flex-wrap gap-4 justify-center">
                  {filteredPlaylists.map((playlist: any) => (
                    <div
                      key={playlist.id}
                      className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition flex flex-col items-center"
                      style={{ width: itemWidth - 16, minWidth: 150 }}
                      onClick={() => {
                        console.log(playlist);
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
                              user: {
                                name: playlist.owner_name,
                              },
                            },
                          },
                        ]);
                      }}
                    >
                      <img
                        src={playlist.img}
                        alt={playlist.name}
                        className="rounded-full object-cover mb-3"
                        style={{
                          width: itemWidth - 40,
                          height: itemWidth - 40,
                          minWidth: 110,
                          minHeight: 110,
                        }}
                      />
                      <h3 className="text-sm font-semibold text-white truncate text-center">
                        {playlist.name}
                      </h3>
                      <p className="text-xs text-gray-400 text-center truncate max-w-[120px]">
                        {playlist.songs.map((song: any) => (
                          <span>{song.name}, </span>
                        ))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Songs */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Songs</h2>
              {filteredSongs.length === 0 ? (
                <p className="text-gray-400">No songs found.</p>
              ) : (
                <div className="flex flex-wrap gap-4 justify-center">
                  {filteredSongs.map((song: any) => (
                    <div
                      key={song.id}
                      className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition flex flex-col items-center"
                      style={{ width: itemWidth - 16, minWidth: 150 }}
                      onClick={() => {
                        setCurrentPageData([
                          {
                            target: "musicsingle",
                            song: { ...song, image: song.img },
                            user: { name: song.owner_name, id: song.owner },
                          },
                        ]);
                      }}
                    >
                      <img
                        src={song.img}
                        alt={song.name}
                        className="rounded-full object-cover mb-3"
                        style={{
                          width: itemWidth - 40,
                          height: itemWidth - 40,
                          minWidth: 110,
                          minHeight: 110,
                        }}
                      />
                      <h3 className="text-sm font-semibold text-white truncate text-center">
                        {song.name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate text-center">
                        {song.owner_name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <>
            <div>
              {/* Recently Played */}
              {recentlyPlayed && recentlyPlayed.length > 0 && (
                <section className="w-full mb-8 relative">
                  <h2 className="text-xl font-semibold text-white mb-3 px-4 text-center">
                    Recently Played
                  </h2>
                  <button
                    onClick={() => scroll(recentlyPlayedRef, "left")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 shadow-md backdrop-blur-sm border border-white/20 transition duration-300 ease-in-out z-10 focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
                    aria-label="Scroll recently played left"
                    style={{ opacity: 1 }}
                  >
                    <FontAwesomeIcon icon={faLeftLong} size="lg" />
                  </button>

                  <div className="px-8">
                    <div
                      ref={recentlyPlayedRef}
                      className="flex items-center space-x-4 overflow-x-auto hide-scrollbar scroll-snap-x snap-mandatory"
                      style={{
                        width: itemsToShow * itemWidth,
                        scrollSnapType: "x mandatory",
                        scrollBehavior: "smooth",
                        margin: "0 auto",
                      }}
                    >
                      {recentlyPlayed.map((song: any) => (
                        <div
                          key={song.id}
                          className="flex-shrink-0 bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition scroll-snap-align-start flex flex-col items-center"
                          style={{
                            borderRadius: "1rem",
                            minWidth: itemWidth - 16,
                          }}
                          onClick={() => {
                            console.log("BEFORE TRANSFERING", song);
                            setCurrentPageData([
                              {
                                target: "musicsingle",
                                song: song,
                                user: {
                                  name: song.owner,
                                  id: song.owner_id,
                                },
                              },
                            ]);
                          }}
                        >
                          <img
                            src={song.image}
                            alt={song.name}
                            className="rounded-full object-cover mb-3"
                            style={{
                              width: itemWidth - 40,
                              height: itemWidth - 40,
                            }}
                          />
                          <h3 className="text-sm font-semibold text-white truncate text-center">
                            {song.name}
                          </h3>
                          <p className="text-xs text-gray-400 truncate text-center">
                            {song.owner}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => scroll(recentlyPlayedRef, "right")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 shadow-md backdrop-blur-sm border border-white/20 transition duration-300 ease-in-out z-10 focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
                    aria-label="Scroll recently played right"
                    style={{ opacity: 1 }}
                  >
                    <FontAwesomeIcon icon={faRightLong} size="lg" />
                  </button>
                </section>
              )}

              {/* Recently Liked */}
              {recentlyLiked.length > 0 && (
                <section className="w-full mb-8 relative">
                  <h2 className="text-xl font-semibold text-white mb-3 px-4 text-center">
                    Recently Liked
                  </h2>
                  <button
                    onClick={() => scroll(recentlyLikedRef, "left")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 shadow-md backdrop-blur-sm border border-white/20 transition duration-300 ease-in-out z-10 focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
                    aria-label="Scroll recently liked left"
                    style={{ opacity: 1 }}
                  >
                    <FontAwesomeIcon icon={faLeftLong} size="lg" />
                  </button>

                  <div className="px-8">
                    <div
                      ref={recentlyLikedRef}
                      className="flex items-center space-x-4 overflow-x-auto hide-scrollbar scroll-snap-x snap-mandatory"
                      style={{
                        width: itemsToShow * itemWidth,
                        scrollSnapType: "x mandatory",
                        scrollBehavior: "smooth",
                        margin: "0 auto",
                      }}
                    >
                      {recentlyLiked.map((song_item: any) => (
                        <div
                          key={song_item.id}
                          className="flex-shrink-0 bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition scroll-snap-align-start flex flex-col items-center"
                          style={{
                            borderRadius: "1rem",
                            minWidth: itemWidth - 16,
                          }}
                          onClick={async () => {
                            const { owner, owner_name, img, ...rest } =
                              song_item;

                            const song = {
                              ...rest,
                              owner_id: owner,
                              owner: owner_name,
                              image: img,
                            };

                            console.log("BEFORE TRANSFERING", song);

                            setCurrentPageData([
                              {
                                target: "musicsingle",
                                song: song,
                                user: {
                                  name: song.owner,
                                  id: song.owner_id,
                                },
                              },
                            ]);
                          }}
                        >
                          <img
                            src={song_item.img}
                            alt={song_item.name}
                            className="rounded-full object-cover mb-3"
                            style={{
                              width: itemWidth - 40,
                              height: itemWidth - 40,
                            }}
                          />
                          <h3 className="text-sm font-semibold text-white truncate text-center">
                            {song_item.name}
                          </h3>
                          <p className="text-xs text-gray-400 truncate text-center">
                            {song_item.owner_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => scroll(recentlyLikedRef, "right")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 shadow-md backdrop-blur-sm border border-white/20 transition duration-300 ease-in-out z-10 focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
                    aria-label="Scroll recently liked right"
                    style={{ opacity: 1 }}
                  >
                    <FontAwesomeIcon icon={faRightLong} size="lg" />
                  </button>
                </section>
              )}

              {/* People Following (New) */}
              {following.length > 0 && (
                <section className="w-full mb-8 relative">
                  <h2 className="text-xl font-semibold text-white mb-3 px-4 text-center">
                    People Following
                  </h2>
                  <button
                    onClick={() => scroll(peopleFollowingRef, "left")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 shadow-md backdrop-blur-sm border border-white/20 transition duration-300 ease-in-out z-10 focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
                    aria-label="Scroll people following left"
                    style={{ opacity: 1 }}
                  >
                    <FontAwesomeIcon icon={faLeftLong} size="lg" />
                  </button>

                  <div className="px-8">
                    <div
                      ref={peopleFollowingRef}
                      className="flex items-center space-x-4 overflow-x-auto hide-scrollbar scroll-snap-x snap-mandatory"
                      style={{
                        width: itemsToShow * itemWidth,
                        scrollSnapType: "x mandatory",
                        scrollBehavior: "smooth",
                        margin: "0 auto",
                      }}
                    >
                      {following.map(({ id, avatar, name }) => (
                        <div
                          key={id}
                          className="flex-shrink-0 bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition scroll-snap-align-start flex flex-col items-center"
                          style={{
                            borderRadius: "1rem",
                            minWidth: itemWidth - 16,
                          }}
                          onClick={async () => {
                            const artist = await fetchArtist(id);

                            if (artist !== null) {
                              setCurrentPageData([
                                { target: "profile", user: artist },
                              ]);
                            }
                          }}
                        >
                          <img
                            src={avatar}
                            alt={name}
                            className="rounded-full object-cover mb-3"
                            style={{
                              width: itemWidth - 40,
                              height: itemWidth - 40,
                            }}
                          />
                          <h3 className="text-sm font-semibold text-white truncate text-center">
                            {name}
                          </h3>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => scroll(peopleFollowingRef, "right")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 shadow-md backdrop-blur-sm border border-white/20 transition duration-300 ease-in-out z-10 focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
                    aria-label="Scroll people following right"
                    style={{ opacity: 1 }}
                  >
                    <FontAwesomeIcon icon={faRightLong} size="lg" />
                  </button>
                </section>
              )}
            </div>
          </>
        )}
      </div>
      <div className="h-[40rem]"></div>
    </div>
  );
}
