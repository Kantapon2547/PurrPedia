# 🐾 Purrpedia – Cat Breed Knowledge Platform

## 📌 Project Overview

Purrpedia is a web-based platform designed for cat lovers to explore, discover, and contribute cat-related knowledge such as cat breeds and care tips.

The system centralizes scattered cat information into a single, structured, and community-driven knowledge platform with moderation control to ensure content quality.

---

## 🎯 Objectives

- Develop a centralized platform for cat-related knowledge
- Enable structured Wikipedia-style user contributions
- Provide personalized content recommendations
- Implement role-based access control (RBAC)
- Support full CRUD operations for cat-related content

---

## 👥 User Roles

### 1️⃣ Guest
- View public cat information
- Read-only access
- Cannot upload or edit content

### 2️⃣ Registered User
- Register / Login / Logout
- Manage personal profile
- Browse & search cat breeds and care tips
- Set preferences
- Receive personalized recommendations
- Create and edit own content
- Upload cat images
- Save favorite content

### 3️⃣ Admin
- Full system access
- Manage users
- Review and moderate submissions
- Approve / Reject / Edit / Delete content
- Perform all CRUD operations

---

## ✨ Core Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Secure login and logout
- Role-based access control

### 🐱 Cat Information Management
- Create, Read, Update, Delete (CRUD)
- Image upload support
- Structured cat breed and care content

### 📝 User Contribution System
- Wikipedia-style content submission
- Pending → Approved/Rejected workflow
- Admin moderation system

### 🎯 Personalized Recommendation
- Content suggestions based on user preferences
- Favorite content tracking

---

## 🔄 System Workflow

1. Guest visits platform and views public content
2. User registers or logs in
3. Registered user browses or submits content
4. New submissions are stored as **Pending**
5. Admin reviews submission
6. Approved content becomes publicly visible

---

## 🛠 Technology Stack

### Frontend
- HTML
- CSS
- JavaScript
- Next.js (React Framework)

### Backend
- Node.js
- Next.js API Routes

### Database
- MongoDB

### Authentication
- JSON Web Token (JWT)

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🚀 Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/purrpedia.git
cd purrpedia
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Run Development Server

```bash
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

## ❌ Out of Scope

- AI-based image recognition
- Online pet adoption system
- E-commerce payment integration
- Veterinary medical diagnosis system

---

## 📌 Future Improvements

- Advanced filtering & search
- Commenting system
- Rating system
- Dark mode
- Image optimization & CDN integration
