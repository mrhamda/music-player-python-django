import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

type User = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  about: string;
};

type UserContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  currentPageData: any[];
  setCurrentPageData: (
    dataArray: object[] | ((prev: any[]) => object[])
  ) => void;

  setPlaylists: (updater: (prev: any[]) => any[]) => void;
  playlists: any[];
  getCookie: (name: string) => string | null;
  fetchUserPlaylists: () => void;
  addToPlaylist: (songID: any, playlistID: any) => void;
  removeFromPlaylist: (songID: any, playlistID: any) => void;
  formatTimeFromSecToMin: (sec: number) => string;

  setMusicListPlaying: (updater: (prev: any[]) => any[]) => void;
  musicListPlaying: any[];

  musicPlaying: any;

  setMusicPlaying: (updater: (prev: any) => any) => void;

  playing: boolean;

  setPlaying: (updater: (prev: any) => any) => void;
  // setPlaylistIndexTo: (amount: number) => any;

  currentListIndexMusic: number;

  setCurrentListIndexMusic: (updater: (prev: number) => number) => void;
  setNewList: () => void;

  removeExisitingPlaylist: (playlist_id: number) => void;

  addRecentlySong: (userID: number, songID: number) => void;
  favoriteID: number;
};

export const ProjectContext = createContext<UserContextType | undefined>(
  undefined
);

interface UserProviderProps {
  children: ReactNode;
}

function getCookie(name: string): string | null {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));

  return cookieValue ? decodeURIComponent(cookieValue.split("=")[1]) : null;
}

async function logoutUser() {
  const csrfToken = getCookie("csrftoken");

  try {
    const res = await fetch("/api/logout/", {
      method: "POST",
      headers: {
        "X-CSRFToken": csrfToken ?? "",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (res.ok) {
      window.location.href = "/login/";
    } else {
      console.error("Logout failed:", await res.text());
    }
  } catch (error) {
    console.error("Network or server error:", error);
  }
}

const formatTimeFromSecToMin = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const ProjectProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);

  const [currentPageData, setCurrentPageDataState] = useState<any[]>([]);

  const [musicPlaying, setMusicPlaying] = useState<any>(null);
  const [musicListPlaying, setMusicListPlaying] = useState<any[]>([]);

  const [playing, setPlaying] = useState(false);

  const [currentListIndexMusic, setCurrentListIndexMusic] = useState(0);

  const login = (newUser: User) => {
    setUser(newUser);
  };
  const favoriteID = 1000000;

  const logout = () => {
    setUser(null);
    logoutUser();
  };

  async function setNewList() {
    try {
      const res = await fetch("/api/get_random_list/");

      const resJson = await res.json();

      console.log("SETTING NEW LIST");

      const formated: any = { songs: resJson };

      setCurrentListIndexMusic(0);
      // setPlaylistIndexTo(0);

      setMusicListPlaying(formated);
      console.log("formated", formated);
      setMusicPlaying(formated.songs[0]);
    } catch (e) {
      console.log(e);
    }
  }

  // async function setPlaylistIndexTo(amount: number) {
  //   try {
  //     const formData = new FormData();

  //     formData.append("id", String(user?.id));
  //     formData.append("amount", String(amount));

  //     const res = await fetch("/api/set_playlist_index/", {
  //       method: "POST",
  //       body: formData,
  //       credentials: "include",
  //       headers: {
  //         "X-CSRFToken": getCookie("csrftoken") ?? "",
  //       },
  //     });

  //     const resJson = await res.json();

  //     if (res.ok) {
  //       setCurrentListIndexMusic(amount);
  //     }

  //     if (resJson.error) {
  //       console.log(resJson.error);
  //     } else {
  //       console.log(resJson.message);
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  async function removeFromPlaylist(songID: any, playlistID: any) {
    const formData = new FormData();

    formData.append("playlist_id", playlistID);
    formData.append("song_id", songID);

    console.log(playlistID);

    const res = await fetch("/api/remove_song_from_playlist/", {
      method: "POST",
      body: formData,
      headers: {
        "X-CSRFToken": getCookie("csrftoken") ?? "",
      },
      credentials: "include",
    });

    const resJson = await res.json();

    if (res.ok) {
      console.log("Successfully removed from list");
    }

    fetchUserPlaylists();

    console.log(resJson);
  }

  async function fetchUserPlaylists() {
    try {
      const res = await fetch(`/api/get-user-playlist/?id=${user?.id}`, {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",

          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const data = await res.json();

      if (data.error) {
        console.log(data.error);
      } else {
        setPlaylists(data.playlists);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  }

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
      console.log("Successfully added to list");
      fetchUserPlaylists();
    }

    console.log(resJson);
  }

  async function removeExisitingPlaylist(playlist_id: number) {
    const formData = new FormData();

    formData.append("user_id", String(user?.id));

    formData.append("playlist_id", String(playlist_id));

    try {
      const res = await fetch("/api/remove_existing_playlist/", {
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

  async function addRecentlySong(userID: number, songID: number) {
    try {
      const formData = new FormData();

      formData.append("user_id", String(userID));
      formData.append("song_id", String(songID));

      const res = await fetch("/api/add_recently_played/", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
        credentials: "include",
      });

      const resJson = await res.json();

      console.log("addRecentlySong", resJson);
    } catch (e) {
      console.log(e);
    }
  }

  const setCurrentPageData = (
    dataArray: object[] | ((prev: any[]) => object[])
  ) => {
    if (typeof dataArray === "function") {
      setCurrentPageDataState((prev) => dataArray(prev));
    } else {
      setCurrentPageDataState(dataArray);
    }
  };

  useEffect(() => {
    if (user !== null) {
      localStorage.setItem(`current_index_${user.id}`, JSON.stringify(currentListIndexMusic))
    }
  }, [currentListIndexMusic]);

  async function setPlayingPlaylistInDatabase() {
    localStorage.setItem(`music_list_${user?.id}`, JSON.stringify(musicListPlaying));
  }

  useEffect(() => {
    if (user !== null && (musicListPlaying as any).id !== favoriteID) {
      setPlayingPlaylistInDatabase();
    }

    console.log("The current musice list playing", musicListPlaying);
  }, [musicListPlaying]);

  return (
    <ProjectContext.Provider
      value={{
        user,
        login,
        logout,
        currentPageData,
        setCurrentPageData,
        getCookie,
        playlists,
        setPlaylists,
        fetchUserPlaylists,
        addToPlaylist,
        removeFromPlaylist,
        formatTimeFromSecToMin,
        musicPlaying,
        setMusicPlaying,
        musicListPlaying,
        setMusicListPlaying,
        playing,
        setPlaying,
        // setPlaylistIndexTo,
        currentListIndexMusic,
        setCurrentListIndexMusic,
        setNewList,
        removeExisitingPlaylist,
        addRecentlySong,
        favoriteID,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = (): UserContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
