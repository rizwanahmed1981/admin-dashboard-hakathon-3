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
            <div className="flex flex-col h-screen bg-grey-100">
                <nav className="bg-green-600 text-blue p-4 shadow-lg flex justify-between items-center">
                    <h2 className="text-2xl">
                        ADMIN DASHBOARD
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="flex space-x-4">
                            {["All", "pending", "dispatch", "success"].map((status) => (
                                <button
                                    key={status}
                                    className={`px-4 py-2 rounded-lg transition-all ${filter.toLowerCase() === status.toLowerCase()
                                        ? "bg-green-700 text-white font-bold"
                                        : "bg-white text-gray-700 hover:bg-green-50"
                                        }`}
                                    onClick={() => setFilter(status)}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                    <span className="ml-2 px-2 py-1 text-sm bg-gray-200 rounded-full">
                                        {orders.filter(order =>
                                            (order.status?.toLowerCase() || "pending") === status.toLowerCase()
                                        ).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                        >
                            Sign Out
                        </button>
                    </div>
                </nav>
                <div className="flex-1 p-6 overflow-y-auto">
                    <h2 className="text-2xl font-bold text-center mb-6">
                        {filter === "All" ? "All Orders" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Orders`}
                    </h2>
                    <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <React.Fragment key={order._id}>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                {order._id}
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.firstName} {order.lastName}
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.address}
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(order.orderDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.total}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={order.status || "pending"}
                                                    onChange={(e) => handleStatus(order._id, e.target.value)}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'success'
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
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(order._id);
                                                    }}
                                                    className="bg-red-500 text-white rounded-lg px-3 py-1 hover:bg-red-700 transition"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                        {selectedOrderId === order._id && (
                                            <tr>
                                                <td className="bg-gray-50 p-4 transition-all" colSpan={7}>
                                                    <h3 className="font-bold ">Order Deatils</h3>
                                                    <p>Phone: <strong>{order.phone}</strong></p>
                                                    <p>Email: <strong>{order.email}</strong></p>
                                                    <p>City: <strong>{order.city}</strong></p>
                                                    {
                                                        order.cartItems.map((item) => (
                                                            <li className="flex items-center" key={order._id}>
                                                                {item.title}
                                                                {item.productImage && (
                                                                    <Image
                                                                        src={urlFor(item.productImage).url()}
                                                                        alt={item.title}
                                                                        width={100}
                                                                        height={100}
                                                                    />
                                                                )}
                                                            </li>
                                                        ))
                                                    }
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
        </ProtectedRoute>
    );
}