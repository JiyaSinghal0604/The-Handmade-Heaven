import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("customerToken");
        const customer = localStorage.getItem("customer");
        if (token && customer) {
            navigate("/track-order");
        }
    }, [navigate]);

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
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
            
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const text = await res.text();
            let data = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                throw new Error("Server response was not valid JSON. Please check backend status.");
            }

            if (!res.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Save token and user details according to your backend response
            localStorage.setItem("customerToken", data.token);
            localStorage.setItem("customer", JSON.stringify(data.user));

            toast.success("Login Successful! 🌸");
            navigate("/track-order");

        } catch (err) {
            toast.error(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
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

                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />

                    <button
                        disabled={loading}
                        className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-all disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="text-center mt-6 text-sm text-gray-600">
                    Don't have an account?
                    <Link
                        to="/register"
                        className="text-pink-600 font-semibold ml-2 hover:underline"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
}