import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent, useState } from "react";
import { useProjectContext } from "../context/ProjectContext";

export default function MakePlaylist() {
  const { user, getCookie, setCurrentPageData, fetchUserPlaylists } =
    useProjectContext();

  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [playlistName, setPlaylistName] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(false);

  const [err, setErr] = useState<string>("");

  async function CreatePlaylist(e: FormEvent) {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", playlistName);
    if (imageFile) formData.append("image", imageFile);
    formData.append("visibility", String(isPublic));
    if (user) formData.append("id", String(user?.id));

    try {
      const res = await fetch("/api/create-playlist/", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const resJson = await res.json();

      if (!res.ok) {
        setErr(resJson.error);

        if (
          resJson.error ==
          "UNIQUE constraint failed: backend_playlist.owner_id, backend_playlist.name"
        ) {
          setErr(
            "You already have a playlist with that name please choose another name"
          );
        }
      } else if (res.ok) {
        const imagePath = resJson.imagePath;
        const id = resJson.id;
        const ownerID = resJson.owner;
        fetchUserPlaylists();

        setCurrentPageData([
          {
            target: "playlist",
            user: user,
            playlist: {
              image: imagePath,
              songs: resJson.songs,
              name: playlistName,
              visibility: isPublic,
              userID: user!.id,
              id: id,
              owner: ownerID,
              user: user,
            },
          },
        ]);
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
      className="h-[100vh] dark:bg-gray-700 p-4 py-25 px-10 "
    >
      {/* Playlist Header */}
      <form
        className="flex justify-center"
        onSubmit={CreatePlaylist}
        encType="multipart/form-data"
      >
        <div className="flex flex-col gap-6 mb-6 px-4 sm:px-6 w-full max-w-md bg-gray-900 p-6 rounded-xl shadow-lg text-white font-sans">
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

          <p className="text-red-500" style={{ fontSize: "1rem" }}>
            {err}
          </p>

          <div className="flex justify-center">
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-colors duration-300 cursor-pointer">
              Add
              <FontAwesomeIcon icon={faPlus} />
            </button>

            <button
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-colors duration-300 cursor-pointer ml-5"
              onClick={(e: FormEvent) => {
                e.preventDefault();
                setCurrentPageData([
                  {
                    target: "",
                    user: user,
                  },
                ]);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      <div className="h-[35rem]"></div>
    </div>
  );
}
