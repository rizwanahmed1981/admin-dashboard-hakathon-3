export default {
    name: "order",
    title: "Order",
    type: "document",
    fields: [
        {
            name: "firstName",
            title: "First Name",
            type: "string",
        },
        {
            name: "lastName",
            title: "Last Name",
            type: "string",
        }, {
            name: "email",
            title: "Email",
            type: "string",
        },
        {
            name: "phone",
            title: "Phone Number",
            type: "string",
        },
        {
            name: "address",
            title: "Address",
            type: "string",
        },
        {
            name: "zipCode",
            title: "Zip Code",
            type: "string",
        },
        {
            name: "city",
            title: "City",
            type: "string",
        },
        {
            name: "cartItems",
            title: "Cart Items",
            type: "array",
            of: [{ type: "reference", to: { type: "product" } }]

        },
        {
            name: "total",
            title: "Total",
            type: "number",
        },
        {
            name: "status",
            title: "Order Status",
            type: "string",
            options: {
                list: [
                    { title: "Pending", value: "pending" },
                    { title: "Processing", value: "processing" },
                    { title: "Shipped", value: "shipped" },
                    { title: "Delivered", value: "delivered" },
                    { title: "Cancelled", value: "cancelled" },
                ],
                layout: 'radio',
            },
            initialValue: "pending"
        }
    ]
}