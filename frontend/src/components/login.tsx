import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useProjectContext } from "../context/ProjectContext";

export function Login() {
  const passwordRef = useRef<HTMLInputElement>(null);

  const { getCookie } = useProjectContext();
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");

  useEffect(() => {
    if (showPassword && passwordRef.current) {
      passwordRef.current.type = "text";
    } else if (!showPassword && passwordRef.current) {
      passwordRef.current.type = "password";
    }
  }, [showPassword]);

  async function login(e: FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/login/", {
      method: "POST",
      credentials: "include",

      body: JSON.stringify({
        password: password,
        email: email,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken") ?? "",
      },
    });

    const data: any = await res.json();

    if (!res.ok) {
      setErr(data.error);
    }

    if (data.message === "User logged in successfully.") {
      window.location.href = "/";
    }

    console.log(data);
  }

  useEffect(() => {
    const emailInput = document.querySelector<HTMLInputElement>(
      'input[name="email"]'
    );
    const passwordInput = document.querySelector<HTMLInputElement>(
      'input[name="password"]'
    );

    // Wait for browser to autofill
    setTimeout(() => {
      if (emailInput && emailInput.value) setEmail(emailInput.value);
      if (passwordInput && passwordInput.value)
        setPassword(passwordInput.value);
    }, 100); // Small delay to let autofill happen
  }, []);

  return (
    <div>
      <div className="bg-gray-50">
        <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
          <div className="max-w-[480px] w-full">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h1 className="text-slate-900 text-center text-3xl font-semibold">
                Sign in
              </h1>
              <form
                className="mt-12 space-y-6"
                onSubmit={(e) => {
                  login(e);
                }}
              >
                <div>
                  <label className="text-slate-900 text-sm font-medium mb-2 block">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <input
                      name="email"
                      type="text"
                      required
                      defaultValue={email}
                      className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 pr-8 rounded-md outline-blue-600"
                      placeholder="Enter email"
                      onChange={(e) => {
                        setEmail(e.currentTarget.value);
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#bbb"
                      stroke="#bbb"
                      className="w-4 h-4 absolute right-4"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="10"
                        cy="7"
                        r="6"
                        data-original="#000000"
                      ></circle>
                      <path
                        d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z"
                        data-original="#000000"
                      ></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="text-slate-900 text-sm font-medium mb-2 block">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      onLoad={(e) => {
                        setPassword(e.currentTarget.value);
                      }}
                      ref={passwordRef}
                      name="password"
                      type="password"
                      required
                      className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 pr-8 rounded-md outline-blue-600"
                      placeholder="Enter password"
                      onChange={(e) => {
                        setPassword(e.currentTarget.value);
                      }}
                    />
                    <div>
                      <svg
                        onClick={() => {
                          setShowPassword(!showPassword);
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#bbb"
                        stroke="#bbb"
                        className="w-5 h-5 absolute right-3 top-1/2 cursor-pointer select-none -translate-y-1/2"
                        viewBox="0 0 128 128"
                      >
                        <path
                          d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"
                          data-original="#000000"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm">
                    <a
                      href="jajvascript:void(0);"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Forgot your password?
                    </a>
                  </div>
                </div>
                <div
                  className="text-red-500 py-5 font-bold"
                  style={{ fontSize: "0.8rem" }}
                >
                  {err}
                </div>

                <div className="!mt-12">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 text-[15px] font-medium tracking-wide rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer"
                  >
                    Sign in
                  </button>
                </div>
                <p className="text-slate-900 text-sm !mt-6 text-center">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:underline ml-1 whitespace-nowrap font-semibold"
                  >
                    Register here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
