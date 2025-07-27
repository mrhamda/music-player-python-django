import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProjectContext } from "../context/ProjectContext";

export function Register() {
  const [password, setPassword] = useState("");

  const [cPassword, setCpassword] = useState("");

  const [email, setEmail] = useState("");

  const [name, setName] = useState("");

  const [err, setErr] = useState("");

  const { getCookie } = useProjectContext();

  async function register(e: FormEvent) {
    e.preventDefault();

    const res = await fetch("api/register/", {
      method: "POST",
      credentials: "include",

      body: JSON.stringify({
        password: password,
        cPassword: cPassword,
        email: email,
        name: name,
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

    if (data.message === "User created successfully.") {
      window.location.href = "/login";
    }

    console.log(data);
  }

  useEffect(() => {
    const emailInput = document.querySelector<HTMLInputElement>(
      'input[name="email"]'
    );
    const nameInput =
      document.querySelector<HTMLInputElement>('input[name="name"]');

    const passwordInput = document.querySelector<HTMLInputElement>(
      'input[name="password"]'
    );

    const cPassword = document.querySelector<HTMLInputElement>(
      'input[name="cpassword"]'
    );

    // Wait for browser to autofill
    setTimeout(() => {
      if (emailInput && emailInput.value) setEmail(emailInput.value);

      if (passwordInput && passwordInput.value)
        setPassword(passwordInput.value);

      if (cPassword && cPassword.value) setCpassword(cPassword.value);

      if (nameInput && nameInput.value) setName(nameInput.value);
    }, 100); // Small delay to let autofill happen
  }, []);

  return (
    <div className="flex flex-col justify-center sm:h-screen p-4">
      <div className="max-w-md w-full mx-auto border border-gray-300 rounded-2xl p-8">
        <form onSubmit={register}>
          <div className="space-y-6">
            <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">
                Name
              </label>
              <input
                name="name"
                type="text"
                className="text-slate-900 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500"
                placeholder="Enter name"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>

            <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">
                Email
              </label>
              <input
                name="email"
                type="email"
                className="text-slate-900 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500"
                placeholder="Enter email"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">
                Password
              </label>
              <input
                name="password"
                type="password"
                className="text-slate-900 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500"
                placeholder="Enter password"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
            <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">
                Confirm Password
              </label>
              <input
                name="cpassword"
                type="password"
                className="text-slate-900 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500"
                placeholder="Enter confirm password"
                onChange={(e) => {
                  setCpassword(e.target.value);
                }}
              />
            </div>
          </div>

          <div
            className="text-red-500 py-5 font-bold"
            style={{ fontSize: "0.8rem" }}
          >
            {err}
          </div>

          <div className="mt-12">
            <button
              type="submit"
              className="w-full py-3 px-4 text-sm tracking-wider font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer"
            >
              Create an account
            </button>
          </div>
          <p className="text-slate-600 text-sm mt-6 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline ml-1 whitespace-nowrap font-semibold"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
