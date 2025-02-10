'use client'

import ProtectedRoute from "@/app/component/protectedRoute";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import Image from 'next/image'
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";




interface Order {
    _id: string;
    firstName: string;
    lastName: string;
    phone: number;
    email: string;
    address: string;
    zipCode: string;
    city: string;
    total: number;
    discount: number;
    orderDate: string;
    status: string | null;
    cartItems: {
        map(arg0: (item: any) => any): React.ReactNode | Iterable<React.ReactNode>; title: string, image: string
    }
}


export default function AdminDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([])
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
    const [filter, setFilter] = useState("All")

    useEffect(() => {
        client.fetch(
            `*[_type == "order"]{
                _id,
                firstName,
                lastName,
                phone,
                email,
                address,
                zipCode,
                city,
                total,
                discount,
                orderDate,
                status,
                cartItems[]->{
                title,
                productImage
                }

            }`
        )
            .then((data) => setOrders(data))
            .catch((error) => console.log("error fetching product", error))
    }, [])

    const filteredOrders = filter.toLowerCase() === "all"
        ? orders
        : orders.filter((order) => {
            const orderStatus = order.status?.toLowerCase() || "pending";
            return orderStatus === filter.toLowerCase();
        });

    const toggleOrderDetails = (orderId: string) => {
        setSelectedOrderId((prev) => (prev === orderId ? null : orderId))
    }

    const handleStatus = async (orderId: string, newStatus: string) => {
        try {
            // Update the status in Sanity
            await client
                .patch(orderId)
                .set({ status: newStatus.toLowerCase() }) // Ensure consistent case
                .commit();

            // Update local state
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId
                        ? { ...order, status: newStatus.toLowerCase() }
                        : order
                )
            );

            // Show success message based on status
            if (newStatus === "dispatch") {
                Swal.fire({
                    title: "Order Dispatched",
                    text: "Order has been marked as dispatched",
                    icon: "success"
                });
            } else if (newStatus === "success") {
                Swal.fire({
                    title: "Order Delivered",
                    text: "Order has been marked as delivered",
                    icon: "success"
                });
            } else if (newStatus === "pending") {
                Swal.fire({
                    title: "Order Pending",
                    text: "Order has been marked as pending",
                    icon: "info"
                });
            }
        } catch (error) {
            console.error("Error updating status:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to update order status",
                icon: "error"
            });
        }
    };

    const handleDelete = async (orderId: string) => {
        try {
            // Show confirmation dialog
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
            });

            // If user confirms deletion
            if (result.isConfirmed) {
                // Delete from Sanity
                await client.delete(orderId);

                // Update local state
                setOrders((prevOrders) =>
                    prevOrders.filter(order => order._id !== orderId)
                );

                // Show success message
                Swal.fire({
                    title: "Deleted!",
                    text: "Order has been deleted successfully",
                    icon: "success"
                });

                // Close order details if it was open
                if (selectedOrderId === orderId) {
                    setSelectedOrderId(null);
                }
            }
        } catch (error) {
            console.error("Error deleting order:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to delete the order",
                icon: "error"
            });
        }
    };

    const handleSignOut = () => {
        try {
            // Clear admin authentication data
            localStorage.removeItem("adminToken");
            localStorage.removeItem("isAdmin");

            // Show success message
            Swal.fire({
                title: "Signed Out",
                text: "You have been successfully signed out",
                icon: "success",
                timer: 1500
            }).then(() => {
                // Redirect to login page
                router.push("/admin");
            });
        } catch (error) {
            console.error("Error signing out:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to sign out",
                icon: "error"
            });
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex flex-col min-h-screen bg-gray-100">
                {/* Responsive Navigation */}
                <nav className="bg-green-600 p-4 shadow-lg">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <h2 className="text-xl md:text-2xl text-white font-bold">
                            ADMIN DASHBOARD
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            {/* Status Filter Buttons */}
                            <div className="flex flex-wrap justify-center gap-2">
                                {["All", "pending", "dispatch", "success"].map((status) => (
                                    <button
                                        key={status}
                                        className={`px-3 py-1 md:px-4 md:py-2 rounded-lg transition-all text-sm md:text-base ${filter.toLowerCase() === status.toLowerCase()
                                                ? "bg-green-700 text-white font-bold"
                                                : "bg-white text-gray-700 hover:bg-green-50"
                                            }`}
                                        onClick={() => setFilter(status)}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 rounded-full">
                                            {orders.filter(order =>
                                                (order.status?.toLowerCase() || "pending") === status.toLowerCase()
                                            ).length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all text-sm md:text-base"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="flex-1 p-4 md:p-6 overflow-x-auto">
                    <h2 className="text-xl md:text-2xl font-bold text-center mb-6">
                        {filter === "All" ? "All Orders" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Orders`}
                    </h2>

                    {/* Responsive Table */}
                    <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
                        <div className="min-w-full">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="hidden md:table-cell px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                        <th className="hidden md:table-cell px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <React.Fragment key={order._id}>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-3 md:px-6 py-4 text-xs md:text-sm whitespace-nowrap">
                                                    {order._id.slice(-6)}
                                                </td>
                                                <td className="px-3 md:px-6 py-4 text-xs md:text-sm whitespace-nowrap">
                                                    {order.firstName} {order.lastName}
                                                </td>
                                                <td className="hidden md:table-cell px-6 py-4 text-sm whitespace-nowrap">
                                                    {order.phone}
                                                </td>
                                                <td className="hidden md:table-cell px-6 py-4 text-sm whitespace-nowrap">
                                                    {new Date(order.orderDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-3 md:px-6 py-4 text-xs md:text-sm whitespace-nowrap">
                                                    ${order.total}
                                                </td>
                                                <td className="px-3 md:px-6 py-4 text-xs md:text-sm whitespace-nowrap">
                                                    <select
                                                        value={order.status || "pending"}
                                                        onChange={(e) => handleStatus(order._id, e.target.value)}
                                                        className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${order.status === 'success'
                                                                ? 'bg-green-100 text-green-800'
                                                                : order.status === 'dispatch'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="dispatch">Dispatched</option>
                                                        <option value="success">Delivered</option>
                                                    </select>
                                                </td>
                                                <td className="px-3 md:px-6 py-4 text-xs md:text-sm whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleDelete(order._id)}
                                                        className="bg-red-500 text-white px-2 md:px-3 py-1 rounded-lg hover:bg-red-600 transition-all text-xs md:text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                            {selectedOrderId === order._id && (
                                                <tr>
                                                    <td colSpan={7} className="px-3 md:px-6 py-4 bg-gray-50">
                                                        <div className="text-xs md:text-sm space-y-2">
                                                            <h3 className="font-bold">Order Details</h3>
                                                            <p>Phone: <strong>{order.phone}</strong></p>
                                                            <p>Email: <strong>{order.email}</strong></p>
                                                            <p>City: <strong>{order.city}</strong></p>
                                                            <div className="mt-4">
                                                                {order.cartItems.map((item: any) => (
                                                                    <div key={item._id} className="flex items-center gap-2 mb-2">
                                                                        <span>{item.title}</span>
                                                                        {item.productImage && (
                                                                            <Image
                                                                                src={urlFor(item.productImage).url()}
                                                                                alt={item.title}
                                                                                width={50}
                                                                                height={50}
                                                                                className="rounded"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}