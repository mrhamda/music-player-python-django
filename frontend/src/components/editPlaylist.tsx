import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent, useEffect, useState } from "react";
import { useProjectContext } from "../context/ProjectContext";

export default function EditPlaylist() {
  const { currentPageData, getCookie, setCurrentPageData, fetchUserPlaylists } =
    useProjectContext();

  const playlist = currentPageData[0].playlist;

  const [image, setImage] = useState<string | null>(playlist.image);
  const [imageName, setImageName] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [playlistName, setPlaylistName] = useState<string>(playlist.name);
  const [isPublic, setIsPublic] = useState<boolean>(playlist.visibility);

  const [err, setErr] = useState<String | null>("");

  const [_playlist, setPlaylist] = useState(null);

  async function fetchSongs(playlist_id: number) {
    try {
      const res = await fetch(`/api/get_playlist/?id=${playlist_id}`, {
        method: "GET",
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
        credentials: "include",
      });
      const resJson = await res.json();

      resJson.user = {
        id: resJson.owner,
        name: resJson.owner_name,
      };

      setPlaylist(resJson);

      console.log(resJson);
    } catch (e) {
      console.log(e);
    }
  }

  async function editPlaylist(e: FormEvent) {
    e.preventDefault();

    const formData = new FormData();

    formData.append("_method", "PUT");

    if (imageFile) formData.append("image", imageFile);

    formData.append("name", playlistName);

    formData.append("id", currentPageData[0].playlist.id);

    formData.append("visibility", String(isPublic));

    try {
      const res = await fetch("/api/update-playlist/", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const resJson = await res.json();

      console.log(resJson);

      if (!res.ok) {
        setErr(resJson.error);
      } else if (res.ok) {
        const imagePath = resJson.image;

        const updated = {
          ...playlist,
          visibility: isPublic,
          image: imagePath,
        };
        console.log("updated");

        console.log(updated);

        fetchUserPlaylists();

        let playlistDirected: any = _playlist;

        playlistDirected!.image = imagePath;
        playlistDirected!.name = playlistName;
        playlistDirected!.visibility = isPublic;

        setCurrentPageData([
          {
            target: "playlist",
            playlist: _playlist,
          },
        ]);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function deletePlaylist(e: FormEvent) {
    e.preventDefault();

    const formData = new FormData();

    formData.append("_method", "DELETE");

    formData.append("id", currentPageData[0].playlist.id);

    try {
      const res = await fetch("/api/delete-playlist/", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const resJson = await res.json();

      console.log(resJson);

      if (!res.ok) {
        return setErr(resJson.error);
      }

      fetchUserPlaylists();

      setCurrentPageData([{ target: "homeshow" }]);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    fetchSongs(playlist.id);
  }, []);
  return (
    <div
      style={{
        flexGrow: 1,
        marginLeft: 0,
        fontSize: 20,
      }}
      className="h-[100vh] dark:bg-gray-700 p-4 py-25 px-10 "
    >
      {/* Playlist Header */}
      <div className="flex justify-center">
        <form
          onSubmit={editPlaylist}
          className="flex flex-col gap-6 mb-6 px-4 sm:px-6 w-full max-w-md bg-gray-900 p-6 rounded-xl shadow-lg text-white font-sans"
          encType="multipart/form-data"
        >
          {/* Image upload */}
          <div className="flex flex-col items-center gap-3">
            <label className="text-sm font-medium tracking-wide text-gray-300">
              Playlist Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImage(URL.createObjectURL(file));
                  setImageName(file.name);
                  setImageFile(file);
                }
              }}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
                 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
            {image && (
              <img
                src={image}
                alt="Playlist"
                className="w-28 h-28 rounded-full border-2 border-blue-500 object-cover shadow-md mt-2"
              />
            )}
            {imageName && (
              <p className="mt-1 text-xs text-gray-400 italic select-text">
                Image: {imageName}
              </p>
            )}
          </div>

          {/* Playlist name */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Playlist Name
            </label>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Enter playlist name"
              className="w-full rounded-md bg-gray-800 text-white px-4 py-2 placeholder-gray-500
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Visibility toggle */}
          <div className="w-full flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              Visibility
            </label>
            <div
              onClick={() => setIsPublic((prev) => !prev)}
              className={`relative inline-flex items-center cursor-pointer w-14 h-7 bg-gray-700 rounded-full
                  transition-colors duration-300 ease-in-out ${
                    isPublic ? "bg-green-600" : "bg-gray-700"
                  }`}
              role="switch"
              aria-checked={isPublic}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setIsPublic((prev) => !prev);
              }}
            >
              <span
                className={`inline-block w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ease-in-out
                    ${isPublic ? "translate-x-7" : "translate-x-1"}`}
              />
            </div>
          </div>
          <div className="flex justify-between">
            <div>
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-colors duration-300 cursor-pointer">
                <FontAwesomeIcon icon={faEdit} />
              </button>

              <button
                onClick={deletePlaylist}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-colors duration-300 cursor-pointer ml-5"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>

            <button
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-colors duration-300 cursor-pointer ml-5"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPageData([{ target: "homeshow" }]);
              }}
            >
              Cancel
            </button>
          </div>

          <p className="text-red-600" style={{ fontSize: "1rem" }}>
            {err}
          </p>
        </form>
      </div>

      <div className="h-[10rem]"></div>
    </div>
  );
}
