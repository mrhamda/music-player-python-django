import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent, useState } from "react";
import { useProjectContext } from "../context/ProjectContext";

export default function MakeSong() {
  const { getCookie, setCurrentPageData, user } = useProjectContext();

  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [audio, setAudio] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>("");
  const [songName, setSongName] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(false);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [err, setErr] = useState<string | null>("");

  async function createSong(e: FormEvent) {
    e.preventDefault();

    setErr("");

    const formData = new FormData();

    if (imageFile) formData.append("image", imageFile);
    if (audioFile) formData.append("audio", audioFile);
    if (songName) formData.append("name", songName);
    if (isPublic) formData.append("visibility", String(isPublic));
    if (user) formData.append("id", String(user.id));

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    try {
      const res: any = await fetch("/api/create-song/", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-CSRFToken": getCookie("csrftoken") ?? "",
        },
      });

      const resJson = await res.json();

      if (!res.ok) {
        console.error(
          "Fetch error, status:",
          res.status,
          "response json:",
          resJson
        );
        setErr(resJson.error || "Something went wrong.");
      } else {
        setCurrentPageData([
          {
            target: "musicsingle",
            user: user,
            song: {
              image: resJson.imagePath,
              audio: resJson.audioPath,
              name: songName,
              user: user,
            },
          },
        ]);
      }

      console.log(resJson);
    } catch (e) {
      console.error("Network error:", err);
      setErr("Network error occurred. Please try again.");
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
      <div className="flex justify-center">
        <form
          onSubmit={createSong}
          className="flex flex-col gap-6 mb-6 px-4 sm:px-6 w-full max-w-md bg-gray-900 p-6 rounded-xl shadow-lg text-white font-sans"
        >
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

          {/* Audio upload */}
          <div className="flex flex-col items-center gap-3 w-full">
            <label className="text-sm font-medium tracking-wide text-gray-300">
              Song Audio (MP3)
            </label>
            <input
              type="file"
              accept="audio/mp3,audio/mpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setAudio(URL.createObjectURL(file));
                  setAudioName(file.name);
                  setAudioFile(file);
                }
              }}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
       file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 cursor-pointer"
            />
            {audioName && (
              <p className="mt-1 text-xs text-gray-400 italic select-text">
                Audio: {audioName}
              </p>
            )}
            {audio && (
              <div className="w-full mt-2 bg-gray-800 rounded-lg shadow-inner border border-gray-700 p-2 flex items-center">
                <audio
                  controls
                  className="w-full appearance-none"
                  style={{
                    outline: "none",
                    filter: "invert(1) saturate(3)", // makes controls white-ish for some browsers
                  }}
                >
                  <source src={audio} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
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

          <p className="text-red-600" style={{ fontSize: "1rem" }}>
            {err}
          </p>

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
          <div className="flex justify-center gap-5">
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-colors duration-300 cursor-pointer flex items-center gap-2">
              <FontAwesomeIcon icon={faPlus} />
              Add Song
            </button>

            <button
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-colors duration-300 cursor-pointer"
              onClick={() => {
                setCurrentPageData([{ target: "" }]);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="h-[30rem]"></div>
    </div>
  );
}
