import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TrackOrder() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            navigate("/login");
            return;
        }

        fetchOrders(user._id);

        const interval = setInterval(() => {
            fetchOrders(user._id);
        }, 10000);

        return () => clearInterval(interval);

    }, []);

    const fetchOrders = async (id) => {
        try {

            const res = await fetch(`/api/orders/user/${id}`);

            const data = await res.json();
            console.log(data);

            setOrders(data.orders || []);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20 text-xl">
                Loading your orders...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-8">

            <h1 className="text-4xl font-bold text-pink-600 mb-8">
                My Orders
            </h1>

            {orders.length === 0 ? (
                <div className="text-center text-gray-500 text-xl">
                    No Orders Found
                </div>
            ) : (

                orders.map(order => (

                    <div
                        key={order._id}
                        className="bg-white rounded-3xl shadow-lg border p-6 mb-6"
                    >

                        <div className="flex justify-between">

                            <div>

                                <h2 className="font-bold">
                                    Order ID
                                </h2>

                                <p className="text-gray-500">
                                    {order._id}
                                </p>

                            </div>

                            <div>

                                <span className="px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-semibold">
                                    {order.status}
                                </span>

                            </div>

                        </div>

                        <hr className="my-4"/>

                        {order.orderItems.map(item => (

                            <div
                                key={item.product}
                                className="flex justify-between py-2"
                            >

                                <div>

                                    <p className="font-semibold">
                                        {item.name}
                                    </p>

                                    <p className="text-gray-500">
                                        Qty : {item.quantity}
                                    </p>

                                </div>

                                <div>

                                    ₹{item.price}

                                </div>

                            </div>

                        ))}

                        <hr className="my-4"/>

                        <div className="grid md:grid-cols-2 gap-4">

                            <div>

                                <p>
                                    <strong>Total :</strong> ₹{order.totalAmount}
                                </p>

                                <p>
                                    <strong>Payment :</strong> {order.paymentMethod}
                                </p>

                                <p>
                                    <strong>Payment Status :</strong> {order.paymentStatus}
                                </p>

                            </div>

                            <div>

                                <p>
                                    <strong>Name :</strong> {order.customerName}
                                </p>

                                <p>
                                    <strong>Phone :</strong> {order.customerPhone}
                                </p>

                                <p>
                                    <strong>Address :</strong> {order.shippingAddress}
                                </p>

                            </div>

                        </div>

                    </div>

                ))

            )}

        </div>
    );
}