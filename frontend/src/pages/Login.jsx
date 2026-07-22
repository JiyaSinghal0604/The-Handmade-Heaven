import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            toast.success("Login Successful!");

            navigate("/track-order");

        } catch (err) {
            toast.error(err.message || "Login failed");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">

            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8">

                <h1 className="text-3xl font-bold text-pink-600 text-center mb-2">
                    Welcome Back 🌸
                </h1>

                <p className="text-gray-500 text-center mb-8">
                    Login to track your orders.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-3 rounded-xl border"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-3 rounded-xl border"
                    />

                    <button
                        disabled={loading}
                        className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <div className="text-center mt-6">

                    Don't have an account?

                    <Link
                        to="/register"
                        className="text-pink-600 font-semibold ml-2"
                    >
                        Register
                    </Link>

                </div>

            </div>

        </div>
    );
}