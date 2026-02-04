# 🎨 Dominus – Frontend

**Angular • TypeScript • Tailwind CSS**

---

## 📌 Description

Dominus Frontend is a modern, scalable Single Page Application (SPA) built with Angular, designed to deliver a secure and seamless e-commerce experience for both customers and administrators.

This application is fully decoupled from the backend and communicates through RESTful APIs, allowing independent development, deployment, and scaling.

---
## Links

Full Site : https://ang-dominus.runasp.net/

## 🎯 Purpose

The frontend focuses on:

- Delivering a fast and responsive user experience
- Enforcing role-based UI access
- Supporting complete e-commerce workflows
- Providing a powerful admin dashboard with analytics
- Maintaining clean, maintainable, and scalable UI architecture

---

## ✨ Features

### 🛍️ User Features
- User registration and login
- Email OTP verification
- Browse Apple products by category
- Product search, filtering, and sorting
- Product detail pages with images
- Cart management (add, update, remove)
- Wishlist functionality
- Secure checkout flow
- Order history and order tracking

### 🛠️ Admin Features
- Admin-only authentication and routes
- Product and category management UI
- Inventory management screens
- Order management and status updates
- User management views
- Analytics dashboard with charts and summaries

---

## 🏗️ Architecture

The frontend follows a component-driven and modular architecture:

- Feature-based modules
- Reusable shared components
- Centralized API service layer
- Strong typing with TypeScript
- Lazy-loaded modules for performance

---

## 📂 Project Structure
src/
├── app/
│ ├── core/ # Guards, interceptors, global services
│ ├── shared/ # Reusable components & utilities
│ ├── modules/ # Feature modules (auth, products, admin)
│ ├── services/ # API communication layer
│ ├── models/ # Interfaces & data models
│ └── layouts/ # User & Admin layouts
└── styles/ # Tailwind CSS configuration

text

---

## 🔐 Authentication & Authorization

- JWT-based authentication
- Angular Route Guards for protected routes
- Role-based UI rendering (Admin / User)
- HTTP Interceptors for token handling
- Automatic handling of unauthorized access

---

## 🔄 API Integration

- RESTful API communication
- Centralized HTTP services
- Typed API responses using interfaces
- Consistent error handling strategy
- Backend-driven data flow

---


## 🎨 UI & Styling

- Tailwind CSS for utility-first styling
- Fully responsive design
- Mobile-first layout
- Clean and consistent UI components
- Optimized form validation and feedback

---

## 📊 Admin Dashboard

- Sales overview
- Order and revenue analytics
- Product performance charts
- User activity summaries

---

## ⚡ Performance

- Lazy loading of feature modules
- Optimized change detection
- Minimal DOM re-rendering
- Reusable components for efficiency

---

# 🚀 Quick Start Guide

## 📋 Prerequisites

### Required Software
- **Node.js** (v16 or higher)
- **Angular CLI** (v15 or higher)
- **npm** (v8 or higher)

### Installation

# Clone the repository
git clone [repository-url]

# Navigate to project directory
cd dominus-frontend

# Install dependencies
npm install

# Start development server
ng serve

# Open browser and navigate to
http://localhost:4200
