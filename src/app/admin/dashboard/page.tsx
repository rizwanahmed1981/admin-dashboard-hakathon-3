'use client'

import ProtectedRoute from "@/app/component/protectedRoute";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import Image from 'next/image'
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";




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

    const filteredOreder = filter === "All" ? orders : orders.filter((order) => order.status === filter)

    const toggleOrderDetails = (orderId: string) => {
        setSelectedOrderId((prev) => (prev === orderId ? null : orderId))

        const handleDelete = async (orderId: string) => {
            const result = await
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                })
            if (!result.isConfirmed) return

            try {
                await client.delete(orderId)
                setOrders((prevOrder) => prevOrder.filter((order) => order._id !== orderId))
                Swal.fire('Deleted!', 'Your order has been deleted.', 'success')
            }
            catch (error) {
                console.error("Error deleting order", error)
                Swal.fire('Error!', 'Something went wrong while deleting the order.', 'error')
            }
        }

        const handleStatusChange = async (orderId: string, newStatus: string) => {
            try {
                await client
                    .patch(orderId)
                    .set({ statud: newStatus })
                    .commit()

                setOrders((prevOrder) => prevOrder.map((order) => order._id === orderId ? {
                    ...order,
                    status: newStatus,

                } : order)
                )
                if (newStatus === "dispatch") {
                    Swal.fire("order dispatched", "your Order has been Dispatched", "success")
                }
                else if (newStatus === "success") {
                    Swal.fire("succes", "your Order has been Delivered", "success")
                }
            }
            catch (error) {
                Swal.fire('Error!', 'Something went wrong while updating the order status.', 'error')
            }
        }
    }
    function handleStatus(_id: string, value: string): void {
        throw new Error("function not implemented");
    }
    function handleDelete(_id: string) {
        throw new Error("Function not implemented.");
    }

    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen bg-grey-100">
                <nav className="bg-green-600 text-blue p-4 shadow-lg flex justify-between">
                    <h2 className="text-2xl">
                        ADMIN DASHBOARD
                    </h2>
                    <div className="flex space-x-4">
                        {["All", "pending", "success", "dispatch"].map((status) => (
                            <button key={status}
                                className={`px-4 py-2 rounded-lg transition-all ${filter === status ? "bg-green-700 text-red font-bold" : "text-gray-700"}`} onClick={() => setFilter(status)}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}

                            </button>
                        ))}

                    </div>
                </nav>
                <div className="flex-1 p-6 overflow-y-auto">
                    <h2 className="text-2xl font-bold text-center">
                        Orders
                    </h2>
                    <div className="overflow-y-auto bg-white rounded-lg shadow-lg">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Customer Name</th>
                                    <th>Phone</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-grey-200">
                                {filteredOreder.map((order) => (
                                    <React.Fragment key={order._id}>
                                        <tr
                                            className="cursor-pointer hover:bg-red-100 transition-all"
                                            onClick={() => toggleOrderDetails(order._id)}>
                                            <td>
                                                {order._id}
                                            </td>
                                            <td>
                                                {order.firstName} {order.lastName}
                                            </td>
                                            <td>
                                                {order.address}
                                            </td>
                                            <td>
                                                {new Date(order.orderDate).toLocaleDateString()}
                                            </td>
                                            <td>
                                                {order.total}
                                            </td>
                                        </tr>
                                        <td>
                                            <select value={order.status || ""} onChange={(e) => handleStatus(order._id, e.target.value)}
                                                className="bg-grey-100 p-1 rounded"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="success">Success</option>
                                                <option value="dispatch">Dispatched</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(order._id)
                                            }}
                                                className="bg-red-500 text-white rounded-lg px-3 py-1 hover:bg-red-700 transition"
                                            >
                                                Delete
                                            </button>
                                        </td>
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

        </ProtectedRoute>)




}