import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TrackOrder() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("customer"));

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
            const res = await fetch(`/api/orders/user/${id}`, {
                headers: {
                    // Fixed spacing and spelling for standard Authorization header
                    Authorization: `Bearer ${localStorage.getItem("customerToken")}`
                }
            });

            const data = await res.json();
            setOrders(data.orders || []);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // Feature 2: Cancel Order Handler
    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
            return;
        }

        try {
            const res = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem("customerToken")}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                // Update local state to reflect cancellation immediately
                setOrders(orders.map(order => 
                    order._id === orderId ? { ...order, status: 'Cancelled' } : order
                ));
            } else {
                alert(data.message || "Failed to cancel order");
            }
        } catch (err) {
            console.error("Cancel order error:", err);
            alert("An error occurred while cancelling the order.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("customer");
        localStorage.removeItem("customerToken");
        navigate("/");
        // Note: For Feature 4, ensuring Navbar detects this requires updating Context or triggering an event, 
        // which we will do when we edit Navbar.jsx.
    };

    if (loading) {
        return (
            <div className="text-center py-20 text-xl text-pink-600 font-semibold">
                Loading your orders...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-8">

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-pink-600">
                    My Orders
                </h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-5 py-2 rounded-xl hover:bg-red-600 transition-colors shadow-md"
                >
                    Logout
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="text-center text-gray-500 text-xl bg-pink-50 py-12 rounded-3xl border border-pink-100">
                    No Orders Found
                </div>
            ) : (
                orders.map(order => (
                    <div
                        key={order._id}
                        className="bg-white rounded-3xl shadow-md border border-pink-100 p-6 mb-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 md:gap-0">
                            <div>
                                <h2 className="font-bold text-gray-800">
                                    Order ID
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    {order._id}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                    order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                                    'bg-pink-100 text-pink-600'
                                }`}>
                                    {order.status}
                                </span>

                                {/* Feature 2: Cancel Order Button */}
                                {['New', 'Accepted'].includes(order.status) && (
                                    <button
                                        onClick={() => handleCancelOrder(order._id)}
                                        className="px-4 py-2 bg-white border border-red-200 text-red-500 rounded-full text-sm font-semibold hover:bg-red-50 transition-colors shadow-sm"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>

                        <hr className="my-5 border-pink-50"/>

                        {order.orderItems.map(item => (
                            <div
                                key={item.product?._id || item.product}
                                className="flex justify-between items-center py-3"
                            >
                                {/* Feature 3: Product Images in Order History */}
                                <div className="flex items-center gap-4">
                                    {item.product?.imageUrl || item.product?.image ? (
                                        <img 
                                            src={item.product.imageUrl || item.product.image} 
                                            alt={item.name} 
                                            className="w-16 h-16 object-cover rounded-xl shadow-sm border border-gray-100"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {item.name}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            Qty : {item.quantity}
                                        </p>
                                    </div>
                                </div>

                                <div className="font-medium text-gray-700">
                                    ₹{item.price}
                                </div>
                            </div>
                        ))}

                        <hr className="my-5 border-pink-50"/>

                        <div className="grid md:grid-cols-2 gap-6 bg-pink-50/50 p-5 rounded-2xl">
                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="text-gray-500">Total:</span> <strong className="text-pink-600 text-base">₹{order.totalAmount}</strong>
                                </p>
                                <p>
                                    <span className="text-gray-500">Payment:</span> <strong className="text-gray-700">{order.paymentMethod}</strong>
                                </p>
                                <p>
                                    <span className="text-gray-500">Payment Status:</span> <strong className="text-gray-700">{order.paymentStatus}</strong>
                                </p>
                            </div>

                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="text-gray-500">Name:</span> <strong className="text-gray-700">{order.customerName}</strong>
                                </p>
                                <p>
                                    <span className="text-gray-500">Phone:</span> <strong className="text-gray-700">{order.customerPhone}</strong>
                                </p>
                                <p>
                                    <span className="text-gray-500">Address:</span> <strong className="text-gray-700">{order.shippingAddress}</strong>
                                </p>
                            </div>
                        </div>

                        {/* Feature 1: Customer Notes (Special Instructions) */}
                        {order.specialInstructions && (
                            <div className="mt-5 p-4 bg-yellow-50/80 border border-yellow-200 rounded-2xl">
                                <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1">
                                    Special Instructions
                                </h4>
                                <p className="text-sm text-yellow-700 leading-relaxed">
                                    {order.specialInstructions}
                                </p>
                            </div>
                        )}

                    </div>
                ))
            )}
        </div>
    );
}