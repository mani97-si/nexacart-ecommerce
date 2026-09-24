# NexaCart – Invoqe Internship Task 1

A portfolio-ready MERN full-stack e-commerce application with JWT authentication, product discovery, cart, wishlist, checkout, reviews, order tracking, and an admin dashboard.

## Stack
MongoDB, Mongoose, Express.js, React.js, Node.js, JavaScript, HTML/CSS, JWT, bcrypt, Axios.

## Features
- Optional JWT login with automatic account creation for new emails; logout clears only the current session
- User profile
- Product search, category filters and sorting
- Product details with gallery, stock and ratings
- Cart and wishlist
- Checkout and order history
- Order tracking/status timeline
- Product reviews and ratings
- Admin dashboard with statistics and sales analytics
- Admin product/category/user/order management
- Responsive premium UI with skeletons, toast messages, empty/error states and animations
- Seed data: 20 products and 6 categories; user accounts are created automatically on first login

## Setup
1. Install Node.js 18+ and MongoDB.
2. Copy `.env.example` to `server/.env` and update values. Also create `client/.env` with `VITE_API_URL=http://localhost:5000/api`.
3. From the project root:
   `npm install`
   `npm run install-all`
4. Seed the database:
   `npm run seed`
5. Start both apps:
   `npm run dev`

Client: http://localhost:5173
Server: http://localhost:5000

## Authentication behavior
- Browsing the store does not require an account.
- Enter any email + password on the login page. If the email is new, a customer account is created automatically; no email verification is required.
- If the email already exists, the password must match that account. This prevents one user from accessing another user's data by entering their email.
- JWT identifies the current user. Cart, wishlist, orders, reviews, and profile data are scoped to that user's MongoDB ID.
- Logging out clears only the current browser session; logging in again with the same email restores that user's server-side data.

## API
- `/api/auth`
- `/api/products`
- `/api/categories`
- `/api/cart`
- `/api/wishlist`
- `/api/orders`
- `/api/reviews`
- `/api/users`
- `/api/admin`

All protected routes use `Authorization: Bearer <JWT>`.

## Notes
Payments are represented by a safe demo checkout flow; no real payment gateway or external AI service is used.
