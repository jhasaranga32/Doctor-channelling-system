# 🏥 MediChannel — Doctor Channelling Online Platform

A full-stack MERN application for doctor channelling with role-based user management.

---

## 👥 User Roles

| Role    | Can Register | Can Login | Created By |
|---------|-------------|-----------|------------|
| Patient | ✅ Public    | ✅        | Self       |
| Doctor  | ❌           | ✅        | Admin only |
| Staff   | ❌           | ✅        | Admin only |
| Admin   | ❌           | ✅        | Super Admin|

---

## 📁 Project Structure

```
doctor-channelling/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Login, register, profile, password
│   │   └── userController.js      # CRUD, stats, toggle status
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + authorize
│   │   ├── errorHandler.js        # Global error handler
│   │   └── validators.js          # express-validator rules
│   ├── models/
│   │   └── User.js                # Unified User model (all roles)
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   └── userRoutes.js          # /api/users/*
│   ├── seed.js                    # Demo data seeder
│   ├── server.js                  # Express app entry
│   ├── .env.example               # Environment variables template
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── auth/
        │   │   └── ProtectedRoute.js   # Role-based route guard
        │   └── dashboard/
        │       └── UserManagement.js   # Admin user table + create modal
        ├── context/
        │   └── AuthContext.js          # Global auth state
        ├── pages/
        │   ├── LoginPage.js            # Multi-role login
        │   ├── RegisterPage.js         # Patient self-registration (2-step)
        │   ├── PatientDashboard.js     # Patient portal
        │   ├── DoctorDashboard.js      # Doctor portal
        │   ├── StaffDashboard.js       # Staff portal
        │   └── AdminDashboard.js       # Admin portal + user mgmt
        ├── utils/
        │   └── api.js                  # Axios instance + API calls
        ├── App.js                      # Router + routes
        └── index.js
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### Backend Setup

```bash
cd doctor-channelling/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set your MongoDB URI and JWT secret:
#   MONGODB_URI=mongodb://localhost:27017/doctor_channelling
#   JWT_SECRET=your_super_secret_key_here

# (Optional) Seed demo data
node seed.js

# Start development server
npm run dev

# Server starts at: http://localhost:5000
```

---

### Frontend Setup

```bash
cd doctor-channelling/frontend

# Install dependencies
npm install

# Start development server
npm start

# App opens at: http://localhost:3000
```

---

## 🔑 Demo Credentials (after running seed.js)

| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@medichannel.lk      | admin123    |
| Doctor  | priya@medichannel.lk      | doctor123   |
| Doctor  | rahal@medichannel.lk      | doctor123   |
| Staff   | nimal@medichannel.lk      | staff123    |
| Staff   | kamani@medichannel.lk     | staff123    |
| Patient | amara@gmail.com           | patient123  |
| Patient | dinesh@gmail.com          | patient123  |

---

## 🌐 API Endpoints

### Auth (Public)
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| POST   | `/api/auth/register`          | Patient self-registration|
| POST   | `/api/auth/login`             | All roles login          |
| GET    | `/api/auth/me`                | Get current user (auth)  |
| PUT    | `/api/auth/update-profile`    | Update own profile (auth)|
| PUT    | `/api/auth/change-password`   | Change password (auth)   |
| POST   | `/api/auth/logout`            | Logout (auth)            |

### Users (Admin)
| Method | Endpoint                          | Description               |
|--------|-----------------------------------|---------------------------|
| GET    | `/api/users`                      | List users (filter/search)|
| GET    | `/api/users/stats`                | Dashboard statistics      |
| GET    | `/api/users/:id`                  | Get user by ID            |
| POST   | `/api/users/doctors`              | Create doctor             |
| POST   | `/api/users/staff`                | Create staff              |
| POST   | `/api/users/admins`               | Create admin (super admin)|
| PUT    | `/api/users/:id`                  | Update user               |
| PATCH  | `/api/users/:id/toggle-status`    | Activate/deactivate user  |
| DELETE | `/api/users/:id`                  | Delete user               |
| GET    | `/api/users/doctors/public`       | List doctors (public)     |

---

## 🔒 Security Features

- JWT authentication with configurable expiry
- Passwords hashed with bcrypt (12 salt rounds)
- Role-based access control (RBAC) on all protected routes
- Input validation with express-validator
- Cannot delete or deactivate your own account
- Only super admins can create other admin accounts

---

## 🛠 Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs  
**Frontend:** React 18, React Router v6, Axios, react-hot-toast  
**Validation:** express-validator  

---

## 📌 Next Steps to Extend

1. **Appointments Module** — Book, manage, cancel appointments
2. **Email Verification** — Send verification emails on registration
3. **Password Reset** — Forgot password with email token
4. **File Uploads** — Profile image upload with Cloudinary/S3
5. **Doctor Availability** — Weekly schedule management
6. **Notifications** — Email/SMS appointment reminders
7. **Payment Integration** — Online consultation fee payment
8. **Medical Records** — Patient prescription & history
