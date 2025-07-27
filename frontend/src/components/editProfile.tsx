import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent, useState } from "react";
import { useProjectContext } from "../context/ProjectContext";

export default function EditProfile() {
  const { user, getCookie, login, setCurrentPageData } = useProjectContext();

  const [avatar, setAvatar] = useState<string | null>(user!.avatar);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [avatarName, setAvatarName] = useState<string>("");
  const [username, setUsername] = useState<string>(user!.name);
  const [about, setAboutMe] = useState<string>(user!.about);

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [err, setErr] = useState<string>("");

  async function updateUser(e: FormEvent) {
    e.preventDefault();

    setErr("");

    const formData = new FormData();

    formData.append("_method", "PUT");

    formData.append("username", username);
    formData.append("about", about);
    if (password) formData.append("password", password);
    if (confirmPassword) formData.append("cpassword", confirmPassword);
    if (avatarFile) formData.append("avatar", avatarFile);

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    try {
      const res: any = await fetch("/api/update-user/", {
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
        const userThis = {
          name: username,
          email: user!.email,
          avatar: avatar ?? "",
          id: user!.id,
          about: about,
        };
        login({
          name: username,
          email: user!.email,
          avatar: avatar ?? "",
          id: user!.id,
          about: about,
        });

        setCurrentPageData([{ target: "profile", user: userThis }]);
      }

      console.log(resJson);
    } catch (e) {
      console.error("Network error:", err);
      setErr("Network error occurred. Please try again.");
    }
  }

  return (
    <div
      style={{ flexGrow: 1, marginLeft: 0, fontSize: 20 }}
      className="h-[100vh] dark:bg-gray-700 p-4 py-5 px-10"
    >
      <div className="flex justify-center">
        <form
          className="flex flex-col gap-6 mb-6 px-4 sm:px-6 w-full max-w-md bg-gray-900 p-6 rounded-xl shadow-lg text-white font-sans"
          onSubmit={updateUser}
          encType="multipart/form-data"
        >
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-3">
            <label className="text-sm font-medium tracking-wide text-gray-300">
              Avatar
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setAvatar(URL.createObjectURL(file));
                  setAvatarName(file.name);

                  setAvatarFile(file);
                }
              }}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
                 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
            {avatar && (
              <img
                src={avatar}
                alt="Avatar"
                className="w-28 h-28 rounded-full border-2 border-blue-500 object-cover shadow-md mt-2"
              />
            )}
            {avatarName && (
              <p className="mt-1 text-xs text-gray-400 italic select-text">
                Image: {avatarName}
              </p>
            )}
          </div>

          {/* Username */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full rounded-md bg-gray-800 text-white px-4 py-2 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />

            <label className="block text-sm font-medium mb-1 text-gray-300">
              About me
            </label>
            <textarea
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Enter bio"
              className="w-full rounded-md bg-gray-800 text-white px-4 py-2 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition h-[10rem]"
            >
              {about}
            </textarea>
          </div>

          {/* Password */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Password (optional)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-md bg-gray-800 text-white px-4 py-2 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Confirm Password */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full rounded-md bg-gray-800 text-white px-4 py-2 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <p className="text-red-600" style={{ fontSize: "1rem" }}>
            {err}
          </p>

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-colors duration-300 cursor-pointer"
              type="submit"
            >
              <FontAwesomeIcon icon={faEdit} /> Save
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
      <div className="h-[35rem]"></div>
    </div>
  );
}
