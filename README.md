# 📚 BookNook – Books & Stationery

A premium, responsive online bookstore and stationery e-commerce website built using **HTML5, CSS3, and Vanilla JavaScript**.

BookNook provides a modern digital bookstore experience where users can discover books and stationery products, explore categories, manage their wishlist and cart, complete a simulated checkout, and manage their account.

## 🌐 Live Demo

🔗 https://booknook-books-stationery.vercel.app/

## 🎥 Project Demo

▶️ https://youtu.be/W7r8oeI1NRg

## 📄 Project Report

The complete project report is available in this repository:

📑 **[BookNook Project Report](./BookNook_Project_Report.pdf)**

---

## ✨ Features

### 🏠 Homepage
- Premium bookstore-inspired landing page
- Curated categories
- Featured books and stationery
- Bestseller section
- New arrivals
- Author highlights
- Reader testimonials
- Newsletter subscription

### 📚 Product Catalog
- Books and stationery catalog
- Real-time product search
- Category filtering
- Subcategory filtering
- Product-type filtering
- Price-range filtering
- Customer-rating filtering
- Language filtering
- Sorting options
- Active filter chips
- Empty search/filter states

### 📖 Product Details
- Product quick view
- Detailed product information
- Book specifications
- ISBN, publisher, pages and language
- Customer reviews
- Related products
- Quantity selection
- Wishlist functionality
- Gift-wrapping option

### ❤️ Wishlist
- Add/remove products from wishlist
- Persistent wishlist using LocalStorage
- Wishlist counter
- Wishlist section inside the account dashboard

### 🛒 Shopping Cart
- Add products to cart
- Increase/decrease quantity
- Remove products
- Clear cart
- Live subtotal calculation
- GST calculation
- Shipping calculation
- Gift-wrap charges
- Free-shipping progress indicator
- Coupon support

### 🎟️ Coupon System
Supported promotional coupons include:

- `BOOK10`
- `READMORE20`
- `WELCOME5`

### 💳 Checkout
A multi-step simulated checkout experience including:

1. Contact Information
2. Shipping Address
3. Payment Method
4. Order Review

Supported payment methods:

- Card
- UPI
- Net Banking
- Cash on Delivery

The checkout also supports:
- Indian state selection
- Standard and Express delivery
- Gift notes
- Saved addresses
- Order ID generation
- Order confirmation
- Simulated order tracking

### 👤 Account Dashboard
- Login/Register simulation
- Profile information
- Reading goal tracker
- Order history
- Order tracking
- Saved addresses
- Wishlist
- Sign out functionality

### 📱 Responsive Design
BookNook is designed for:

- Desktop
- Laptop
- Tablet
- Mobile devices

The interface includes responsive navigation, mobile menu, responsive catalog layouts, mobile filters, responsive product cards, checkout layouts and modal interfaces.

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| HTML5 | Website structure and semantic markup |
| CSS3 | Responsive design, layouts, animations and visual styling |
| JavaScript (ES6+) | Interactivity and application logic |
| LocalStorage | Client-side persistence |
| Google Fonts | Playfair Display & Plus Jakarta Sans |
| Git & GitHub | Version control and project hosting |
| Vercel | Deployment |

### Architecture

The project intentionally follows a simple three-file frontend architecture:

```text
BookNook/
│
├── index.html
├── style.css
├── script.js
└── BookNook_Project_Report.pdf
No frontend framework or backend server is required.

💾 Data Persistence

BookNook uses the browser's LocalStorage to persist client-side application data such as:

Cart
Wishlist
User account
Orders
Saved addresses
Checkout information
Reading goals

This allows the simulated shopping experience to remain available across page refreshes.

🎨 Design System

BookNook follows a warm editorial bookstore aesthetic.

Visual Style
Forest green primary color
Warm cream background
Brass/golden accents
Editorial serif headings
Clean modern body typography
Rounded cards and controls
Subtle shadows
Spacious layouts
Premium bookstore-inspired presentation
Typography

Playfair Display
Used primarily for editorial headings and major titles.

Plus Jakarta Sans
Used for interface elements, body text and supporting content.

📂 Project Structure
index.html

Contains the complete website structure including:

Header and navigation
Homepage
Catalog
Product interfaces
About section
Contact section
Account interface
Cart drawer
Checkout modal
Authentication modal
Mobile navigation
style.css

Contains:

Complete design system
Responsive layouts
Product cards
Catalog filters
Cart styling
Checkout styling
Modal styling
Account dashboard styling
Mobile navigation
Mobile responsive breakpoints
Animations and transitions
script.js

Handles the application's interactive functionality including:

Product rendering
Search
Filtering
Sorting
Wishlist
Cart
Coupons
Checkout
Authentication simulation
Account dashboard
Orders
Order tracking
LocalStorage persistence
Navigation
Mobile navigation
Form validation
Toast notifications
🚀 Getting Started
1. Clone the repository
git clone https://github.com/adkumar2651/booknook-books-stationery.git
2. Open the project

Open the project folder in your preferred code editor.

3. Run the website

Simply open:

index.html

in a modern web browser.

No:

Node.js
npm
build tools
framework
backend
database

are required.

☁️ Deployment

The project is deployed using Vercel.

Live Website

https://booknook-books-stationery.vercel.app/

📸 Project Preview

The repository contains the complete project report with screenshots and visual documentation.

📑 View Project Report

🎓 Internship Project

Task: BookNook – Books & Stationery
Task ID: WD-EC-005
Student Code: DAS-EC-005

This project was developed as a frontend e-commerce implementation following the required three-file architecture.

👨‍💻 Author
Aditya Kumar Gupta

Frontend Developer | B.Tech CSE

🔗 GitHub:
https://github.com/adkumar2651

📜 License

This project was created for educational and portfolio purposes.
