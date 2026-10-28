# 🥬 FreshCart - Full-Stack MERN Grocery Delivery App

A responsive, production-ready full-stack web prototype for a local **Grocery Delivery Application** built using the **MERN** stack (React.js, Node.js, Express.js, MongoDB/Mongoose) and styled with modern **Tailwind CSS**.

---

## 🚀 Key Features

### 1. User Authentication & Role-Based Access Control (RBAC)
- **Three Distinct Roles**:
  - **Customer**: Browse catalog, filter categories, search items, manage cart, place simulated orders, and track order status in real time.
  - **Vendor / Admin**: Inventory control (CRUD operations on products), stock level monitoring, low-stock warnings, and order fulfillment.
  - **Delivery Agent**: View assigned delivery dispatches, call customers, navigate to delivery drop addresses, and transition statuses from `Packed` &rarr; `Out for Delivery` &rarr; `Delivered`.
- **JWT Authentication**: Passwords hashed with `bcryptjs`, issued with 30-day JWT tokens stored securely on the client.
- **Top Quick-Demo Bar**: Built-in 1-click testing buttons to instantly switch between Customer, Admin, and Delivery Agent roles without having to re-type login credentials.

### 2. Customer Dashboard & Product Catalog
- **Category Filtering**: High-frequency grocery categories:
  - 🍎 *Fruits & Veggies*
  - 🥛 *Dairy & Eggs*
  - 🥖 *Bakery*
  - 🍪 *Snacks & Munchies*
  - 🧼 *Household Essentials*
- **Real-Time Search & Sorting**: Instant keyword lookup across product names and descriptions with sorting options:
  - *Popularity / Bestsellers*
  - *Price: Low to High*
  - *Price: High to Low*
  - *Customer Rating*
- **Dynamic Stock Guard**: Disables checkout for zero-stock items and displays alert tags (`Only X left!`) when stock is critical.

### 3. Cart Management & Simulated Checkout Flow
- **Interactive Steppers**: Add/remove items, increment/decrement quantities with automatic stock validation.
- **Free Delivery Progress Indicator**: Visual bar encouraging customers to reach the free-delivery threshold (₹500 / $30).
- **Simulated Payment Gateway**:
  - **UPI / QR Code**: Interactive mock QR display and UPI VPA verification.
  - **Credit / Debit Card**: Card format validation, cardholder name, MM/YY expiry, and CVV checks.
  - **Cash on Delivery (COD)**: Doorstep cash settlement instructions.
  - Real-time animated processing spinner and confirmation feedback.

### 4. Live Multi-Step Order Tracking
- **Visual 4-Stage Lifecycle**:
  1. `Pending`: Order placed by customer.
  2. `Packed`: Items inspected and bagged by vendor warehouse.
  3. `Out for Delivery`: Fleet partner dispatched with dropoff details.
  4. `Delivered`: Verified doorstep handover.
- Full timeline history tracking timestamps, remarks, and user actors.

### 5. Vendor & Admin Inventory Management
- **Analytics KPIs**: Catalog count, low stock alert counter, total orders, and paid revenue.
- **Full Inventory CRUD**: Add new grocery products with custom units, prices, discounts, stock, and photos; edit existing items; and delete discontinued goods.
- **Order Dispatch Board**: Filter orders by status and manually advance fulfillment.

### 6. Delivery Partner Fleet Portal
- View active dispatches with customer drop address, pincode, landmark, and telephone link.
- Actionable buttons to accept dispatches and mark deliveries complete.

---

## 🛠 Tech Stack & Architecture

- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js (REST API architecture)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Environment**: Configured with automatic seeding and proxy support

---

## 📂 Project Structure

```text
grocery-delivery-app/
├── package.json                 # Root script definitions
├── README.md                    # Setup and technical documentation
├── server/
│   ├── package.json             # Express & Mongoose dependencies
│   ├── .env                     # Server environment variables
│   ├── server.js                # Express app entry, routes & auto-seed check
│   ├── config/
│   │   └── db.js                # Mongoose database connection
│   ├── models/
│   │   ├── User.js              # User schema with bcrypt password hashing
│   │   ├── Product.js           # Grocery product schema & inventory counts
│   │   └── Order.js             # Order schema, address, payment, and status history
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT protection & role authorization
│   │   └── errorMiddleware.js   # Not-found and general error handlers
│   ├── controllers/
│   │   ├── authController.js    # Register, login, profile endpoints
│   │   ├── productController.js # Search, filter, sort & CRUD handlers
│   │   └── orderController.js   # Order creation, inventory decrement & status updates
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth
│   │   ├── productRoutes.js     # /api/products
│   │   └── orderRoutes.js       # /api/orders
│   └── seeds/
│       └── seedData.js          # Initial catalog items & demo credentials
└── client/
    ├── package.json             # React, Vite, Tailwind & Lucide dependencies
    ├── vite.config.js           # Port 3000 config & proxy to backend
    ├── tailwind.config.js       # Custom emerald grocery brand styling
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx             # React DOM entry
        ├── App.jsx              # Main layout & page routing
        ├── index.css            # Tailwind directives & transitions
        ├── context/
        │   ├── AuthContext.jsx  # Global auth state & 1-click test roles
        │   └── CartContext.jsx  # Cart state & real-time total calculations
        ├── services/
        │   └── api.js           # Centralized API fetcher with token injection
        ├── utils/
        │   └── formatters.js    # Currency (₹), date, and status color badges
        ├── components/
        │   ├── Navbar.jsx       # Responsive header with cart counter & role pills
        │   ├── QuickDemoBar.jsx # 1-click role switcher banner & reset button
        │   ├── ProductCard.jsx  # Product card with image, badges & cart steppers
        │   ├── PaymentModal.jsx # Simulated UPI / Card / COD payment modal
        │   ├── StatusBadge.jsx  # Dynamic status chips with icons
        │   └── Footer.jsx       # Guarantees and links
        └── pages/
            ├── Home.jsx         # Hero, category pills, search bar & product grid
            ├── Cart.jsx         # Cart items, address form, and checkout
            ├── Orders.jsx       # Live visual 4-step progress tracker
            ├── AdminDashboard.jsx # Inventory table, add/edit modal, orders
            ├── DeliveryDashboard.jsx # Delivery partner dispatch tasks
            ├── Login.jsx        # Login page with validation & demo pills
            └── Signup.jsx       # Registration with role selection
```

---

## 🔑 Pre-Configured Demo Accounts

For immediate evaluation, the database is pre-seeded with these demo accounts:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@freshcart.com` | `password123` | Browses catalog, places orders, tracks delivery |
| **Vendor / Admin** | `admin@freshcart.com` | `password123` | Edits inventory, adds products, advances orders |
| **Delivery Agent** | `delivery@freshcart.com` | `password123` | Picks up packages, confirms doorstep delivery |

> 💡 **Tip**: You can also switch roles anytime with **1 click** using the **Quick Demo Switcher** bar at the very top of the app interface.

---

## 🏃 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on `mongodb://127.0.0.1:27017`

### 1. Backend Setup
```bash
cd server
npm install
npm run seed     # Seeds default users, 20 grocery products, and sample orders
npm run dev      # Starts Express server on http://localhost:5000
```

### 2. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:3000
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create account (Customer, Admin, or Delivery)
- `POST /api/auth/login` - Sign in and receive JWT token
- `GET /api/auth/me` - Get current authenticated user profile (`Bearer <token>`)

### Products & Inventory (`/api/products`)
- `GET /api/products` - List products (supports query params: `?category=...&keyword=...&sort=...`)
- `GET /api/products/:id` - Single product details
- `POST /api/products` - Create new product (*Admin only*)
- `PUT /api/products/:id` - Update product details/stock (*Admin only*)
- `DELETE /api/products/:id` - Delete product (*Admin only*)
- `GET /api/products/categories/summary` - Aggregate category counts

### Orders & Tracking (`/api/orders`)
- `POST /api/orders` - Place order (decrements inventory stock, calculates fees & tax)
- `GET /api/orders/my-orders` - Fetch orders for logged-in customer
- `GET /api/orders` - Fetch all store orders (*Admin & Delivery Agent*)
- `GET /api/orders/:id` - Single order details
- `PUT /api/orders/:id/status` - Advance order status and append history log (*Admin & Delivery Agent*)
- `POST /api/seed` - Reset and re-seed database with default catalog
