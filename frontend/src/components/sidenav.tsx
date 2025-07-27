import { faHeart, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { AudioPlayer } from "./audioplayer";
import { useProjectContext } from "../context/ProjectContext";

export function Sidenav() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const {
    setCurrentPageData,
    playlists,
    musicPlaying,
    user,
    getCookie,
    favoriteID,
  } = useProjectContext();

  const [items, setItems] = useState<any[]>([]);

  async function fetchPlaylistUser() {
    try {
      const playlistsArray = Object.values(playlists);

      const playlistsWithUsers = await Promise.all(
        playlistsArray.map(async (playlist) => {
          const res = await fetch(`/api/get-user/?id=${playlist.owner}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const resJson = await res.json();

          console.log("RESJSON PURE");

          console.log(resJson);

          console.log("PLAYLIST PURE");

          console.log(playlist);
          return {
            img: playlist.img,
            name: playlist.name,
            user: resJson.user,
            id: playlist.id,
            visibility: playlist.visibility,
            songs: playlist.songs,
          };
        })
      );

      console.log("playlistsWithUsers");

      console.log(playlistsWithUsers);

      setItems(playlistsWithUsers);
    } catch (e) {
      console.error(e);
    }
  }

  async function addArtistAsPlaylist(artist_id: number) {
    const formData = new FormData();

    formData.append("artist_id", String(artist_id));
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
    } catch (e) {
      console.log(e);
    }
  }
  useEffect(() => {
    if (playlists !== null) {
      fetchPlaylistUser();
    }
  }, [playlists]);

  const [hoverPosition, setHoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // State to store current sidebar and button widths
  const [sidebarWidth, setSidebarWidth] = useState(100);
  const [buttonSize, setButtonSize] = useState(48);
  const [imgSize, setImgSize] = useState(64);

  // Detect window width and adjust sizes
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 1025) {
        // Mobile size
        setSidebarWidth(60);
        setButtonSize(32);
        setImgSize(40);
      } else {
        // Desktop default
        setSidebarWidth(95);
        setButtonSize(44);
        setImgSize(60);
      }
    }

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <div className="fixed ">
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Fixed Sidebar */}
          <div
            style={{
              width: sidebarWidth,
              padding: 16,
              overflowY: "auto",
              position: "fixed",
              top: 0,
              left: 0,
              display: "flex",
              flexDirection: "column",
              gap: 24,
              marginTop: 56,
            }}
            className={`bg-gray-900 ${musicPlaying ? "h-[80vh]" : "h-[100vh]"}`}
          >
            <div className="flex flex-col gap-4 items-center">
              <button
                style={{
                  width: buttonSize,
                  height: buttonSize,
                  backgroundColor: "#1f2937",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
                className="hover:opacity-60"
                onClick={() => {
                  setCurrentPageData([
                    {
                      target: "likes",
                      playlist: {
                        id: favoriteID,
                      },
                    },
                  ]);
                }}
              >
                <FontAwesomeIcon icon={faHeart} />
              </button>
              <button
                style={{
                  width: buttonSize,
                  height: buttonSize,
                  backgroundColor: "#1f2937",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
                className="hover:opacity-60"
                onClick={() => {
                  setCurrentPageData([{ target: "makeplaylist" }]);
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>

            {items !== null &&
              items.length !== 0 &&
              items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-4 items-center"
                  onMouseEnter={(e) => {
                    setHoveredIndex(index);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoverPosition({
                      top: rect.top + rect.height / 2,
                      left: rect.right + 10,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    setHoverPosition(null);
                  }}
                  onClick={async () => {
                    console.log(item);
                    if (item.name === item.owner_name) {
                      await addArtistAsPlaylist(item.user.id);
                    }
                    setCurrentPageData([
                      {
                        target: "playlist",
                        playlist: {
                          owner: item.user.id,
                          id: item.id,
                          name: item.name,
                          image: item.img,
                          visibility: item.visibility,
                          songs: item.songs,
                          user: item.user,
                        },
                      },
                    ]);
                  }}
                >
                  <div
                    style={{
                      width: imgSize,
                      height: imgSize,
                      borderRadius: "50%",
                      overflow: "hidden",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <img
                      src={item.img}
                      alt="Playlist/Artist"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              ))}

            <div className="py-3"></div>
          </div>

          {/* Floating Popout outside scroll */}
          {hoveredIndex !== null && hoverPosition && (
            <div
              style={{
                position: "fixed",
                top: hoverPosition.top,
                left: hoverPosition.left,
                backgroundColor: "#121212",
                color: "white",
                padding: "8px 12px",
                borderRadius: "9999px",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
                zIndex: 1000,
                fontSize: 12,
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <strong>{items[hoveredIndex].name}</strong> —{" "}
              {items[hoveredIndex].user.name}
            </div>
          )}
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
