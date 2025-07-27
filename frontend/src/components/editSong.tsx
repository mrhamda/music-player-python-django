import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent, useState } from "react";
import { useProjectContext } from "../context/ProjectContext";

export default function EditSong() {
  const { currentPageData, setCurrentPageData, getCookie, user } =
    useProjectContext();

  const song = currentPageData[0].song;

  const [image, setImage] = useState<string | null>(song.image);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [imageName, setImageName] = useState<string>("");
  const [songName, setSongName] = useState<string>(song.name);
  const [isPublic, setIsPublic] = useState<boolean>(song.visibility);

  const [err, setErr] = useState<string | null>("");

  console.log(song.image);

  async function Update(e: FormEvent) {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("_method", "PUT");
      if (imageFile) formData.append("image", imageFile);
      formData.append("name", songName);
      formData.append("visibility", String(isPublic));
      formData.append("id", currentPageData[0].song.id);

      console.log(currentPageData[0].song);

      const res = await fetch(`/api/update-song/`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const resJson = await res.json();

      if (res.ok) {
        setCurrentPageData([{ target: "profile", user: user }]);
      } else {
        setErr(resJson.error);
      }

      console.log(resJson);
    } catch (e: any) {
      console.log(e);
    }
  }

  async function Delete(e: FormEvent) {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("_method", "DELETE");
      formData.append("id", currentPageData[0].song.id);

      const res = await fetch(`/api/delete-song/`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const resJson = await res.json();

      setCurrentPageData([{ target: "profile", user: user }]);

      console.log(resJson);
    } catch (e: any) {
      setErr(e);
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
        encType="multipart/form-data"
        onSubmit={Update}
        className="flex justify-center"
      >
        <div className="flex flex-col gap-6 mb-6 px-4 sm:px-6 w-full max-w-md bg-gray-900 p-6 rounded-xl shadow-lg text-white font-sans">
          {/* Image upload */}
          <div className="flex flex-col items-center gap-3">
            <label className="text-sm font-medium tracking-wide text-gray-300">
              Song Image
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
              Song Name
            </label>
            <input
              type="text"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
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

          <div className="flex  justify-between gap-5">
            <div className="flex gap-5">
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-colors duration-300 cursor-pointer flex items-center gap-2">
                <FontAwesomeIcon icon={faEdit} />
              </button>

              <button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-colors duration-300 cursor-pointer flex items-center gap-2"
                onClick={Delete}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>

            <button
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-colors duration-300 cursor-pointer"
              onClick={(e: FormEvent) => {
                e.preventDefault();

                setCurrentPageData([{ target: "", user: user }]);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      <div className="h-[30rem]"></div>
    </div>
  );
}
