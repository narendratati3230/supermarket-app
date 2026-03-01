# 🛒 FreshMart - Production Supermarket App

A full-featured, production-ready supermarket web app built with React. WCAG 2.1 AA compliant, fully responsive and mobile-friendly.

## 🚀 Quick Start

```bash
cd supermarket-app
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Header.jsx/.css
│   ├── Footer.jsx/.css
│   ├── ProductCard.jsx/.css
│   └── CartSidebar.jsx/.css
├── context/           # React Context providers
│   ├── AuthContext.jsx     # Authentication state
│   ├── CartContext.jsx     # Shopping cart state
│   └── ToastContext.jsx    # Notification system
├── data/
│   └── products.js    # Product catalog (24 items, 8 categories)
├── hooks/
│   └── useToast.js    # Toast notification hook
├── pages/             # Route-level page components
│   ├── Home.jsx/.css
│   ├── Shop.jsx/.css
│   ├── Login.jsx + Auth.css
│   ├── Register.jsx
│   ├── Checkout.jsx/.css
│   ├── Orders.jsx/.css
│   └── Profile.jsx/.css
├── styles/
│   └── globals.css    # CSS variables, base styles, animations
├── App.jsx            # Root component with routing
└── index.js           # Entry point
```

## ✨ Features

### 🛍️ Shopping
- Browse 24 products across 8 categories
- Search with real-time filtering
- Sort by price, rating, name
- Add to cart with live count badge

### 🔐 Authentication
- Register with full validation + password strength meter
- Login with email/password
- Demo account (click "Try Demo Account" on login)
- Persistent sessions via localStorage
- Protected routes for checkout/orders/profile

### 🛒 Cart
- Slide-in cart sidebar
- Quantity controls
- Persisted across sessions
- Item count badge animation

### 💳 Payment (Ready for Stripe)
- Multi-step checkout (Cart → Delivery → Payment → Confirm)
- Card number/expiry/CVV formatting
- Order confirmation with ID
- Order history stored per user
- **To connect real Stripe**: Replace card form with `<CardElement>` from `@stripe/react-stripe-js` and add your `REACT_APP_STRIPE_PUBLIC_KEY` to `.env`

### 👤 Profile
- View/edit personal information
- Order history summary
- Total spend tracking

## ♿ Accessibility (WCAG 2.1 AA)
- Skip to main content link
- Semantic HTML (main, nav, aside, article, section)
- ARIA roles, labels, and live regions
- aria-invalid on form fields with errors
- Keyboard navigable (focus-visible styles)
- Sufficient color contrast ratios
- Screen reader friendly cart and product cards

## 📱 Responsive Design
- Mobile-first CSS with CSS custom properties
- Collapsible mobile nav with hamburger menu
- Horizontal scroll categories on mobile
- Stacked grid on small screens

## 🔧 Stripe Integration

1. Install: `npm install @stripe/stripe-js @stripe/react-stripe-js`
2. Create `.env`:
   ```
   REACT_APP_STRIPE_PUBLIC_KEY=pk_live_YOUR_KEY_HERE
   ```
3. Wrap your app in `<Elements stripe={stripePromise}>` 
4. Replace the card form in `Checkout.jsx` with `<CardElement>` from Stripe
5. Create a backend endpoint to create `PaymentIntents` and return the `client_secret`
6. Call `stripe.confirmCardPayment(clientSecret)` before placing the order

## 🏗️ Production Build

```bash
npm run build
```

Deploy the `build/` folder to Netlify, Vercel, or any static host.

## 📦 Dependencies

- `react` & `react-dom` v18
- `react-router-dom` v6
- `@stripe/stripe-js` + `@stripe/react-stripe-js` (for real payments)
- Google Fonts: Playfair Display + DM Sans
