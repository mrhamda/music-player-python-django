import { useState } from "react";

export default function Following() {
  const followingUsers = [
    {
      name: "test1",
      id: 1,
      avatar:
        "https://media.istockphoto.com/id/517188688/photo/mountain-landscape.jpg?s=612x612&w=0&k=20&c=A63koPKaCyIwQWOTFBRWXj_PwCrR4cEoOw2S9Q7yVl8=",
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div
      style={{
        flexGrow: 1,
        marginLeft: 0,
        fontSize: 20,
      }}
      className="h-[100vh] dark:bg-gray-700 p-4 py-25 "
    >
      {/* Playlist Header */}
      <div className="flex flex-col items-center mb-6 px-2 sm:px-0 relative">
        <section className="w-80">
          <header className="h-32 bg-gradient-to-r bg-gray-800">
            <div className="flex text-white justify-center px-2 py-5 relative">
              <p className="text-lg justify-self-center uppercase font-bold">
                Find Following
              </p>
            </div>
            <div className="flex w-70 bg-gray-700 h-10 items-center mx-5 rounded-3xl px-3">
              <svg
                className="w-6 h-6 text-blue-200"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="{1.5}"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                placeholder="Enter your following"
                className="bg-inherit placeholder:text-blue-200 px-2 pb-1 text-sm focus:outline-0 text-white"
                onChange={(e) => {
                  setSearchQuery(e.currentTarget.value);
                }}
              />
            </div>
          </header>
          <section className="bg-gray-800 py-4 px-5 pb-0">
            {followingUsers
              .filter((user) =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((user) => (
                <div
                  className="flex justify-between items-center pb-4"
                  key={user.id}
                >
                  <div className="flex items-center">
                    <div className="bg-slate-300 rounded-full border-4 border-gray-600">
                      <img
                        className="h-12 w-12 rounded-full"
                        src={user.avatar}
                      />
                    </div>
                    <p className="font-bold text-white pl-2 text-sm">
                      {user.name}
                    </p>
                  </div>
                  <button
                    className="h-9 w-20 bg-gradient-to-r text-black rounded-3xl text-xs bg-white font-bold shadow-xl border cursor-pointer hover:opacity-60"
                    id="unfollow"
                  >
                    Unfollow
                  </button>
                </div>
              ))}
          </section>
        </section>
      </div>

      <div className="h-[50rem]"></div>
    </div>
  );
}
