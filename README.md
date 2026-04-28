# ConnectSphere - MERN Social Media Platform

ConnectSphere is a full-stack social media platform built with a React + Vite frontend and an Express + MongoDB backend.

It includes authentication, profiles, follow/unfollow, posts, likes, comments, notifications, direct messages, and real-time updates using Socket.IO.

## Tech Stack

### Frontend
- React 19
- Vite 8
- Tailwind CSS 4
- React Router
- Axios
- Socket.IO Client
- React Hot Toast
- Lucide React

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- Socket.IO
- JWT authentication
- Multer + Cloudinary (image upload)
- Nodemailer (password reset emails)
- Helmet, CORS, Rate Limit, Morgan

## Project Structure

```text
social-media-platform/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    server.js
  frontend/
    public/
    src/
      assets/
      components/
      context/
      layouts/
      pages/
      routes/
      services/
      utils/
    index.html
    vite.config.js
```

## Features

- User registration/login (email or username)
- JWT-protected API routes
- Profile view and edit (bio/avatar)
- Follow/unfollow users
- Post creation (image or text), like/unlike, delete
- Comment add/list/delete
- Home feed and explore feed behaviors
- Notifications (like/comment/follow) with real-time push
- Direct messaging with conversation list and unread counts
- Forgot/reset password flow via email token

## API Overview

Base backend URL: `/api`

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `PUT /auth/reset-password/:token`
- `GET /auth/me`

- `GET /users`
- `GET /users/search`
- `GET /users/:id`
- `PUT /users/profile/update`
- `PUT /users/follow/:id`

- `POST /posts`
- `GET /posts/feed`
- `GET /posts/explore`
- `GET /posts/user/:id`
- `PUT /posts/like/:id`
- `DELETE /posts/:id`

- `POST /comments/:postId`
- `GET /comments/:postId`
- `DELETE /comments/:id`

- `GET /notifications`
- `PUT /notifications/read`
- `DELETE /notifications/:id`

- `GET /messages/conversations`
- `GET /messages/unread-count`
- `GET /messages/:userId`
- `POST /messages/:userId`

## Environment Variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/connectsphere
JWT_SECRET=your_jwt_secret

# Comma-separated client origins for CORS and reset links
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP (required for forgot/reset password emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password_or_smtp_password
SMTP_FROM=your_email@example.com
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Local Setup

### 1) Install dependencies

From project root:

```bash
npm install
```

Then install app dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Start backend

```bash
cd backend
npm run dev
```

### 3) Start frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

Frontend default: `http://localhost:5173`
Backend default: `http://localhost:5000`

## Scripts

### Backend
- `npm run dev` - start with nodemon
- `npm start` - start production server

### Frontend
- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run lint` - run ESLint

## Socket.IO Notes

- Backend tracks online users in memory (`onlineUsers` map).
- Client emits `addUser` after connect.
- Real-time events include `newNotification` and `newMessage`.

## Deployment Notes

- Set `CLIENT_URL` in backend to your deployed frontend URL(s).
- Set `VITE_API_URL` and `VITE_SOCKET_URL` in frontend for deployed backend.
- Ensure MongoDB, Cloudinary, and SMTP env values are configured in deployment.

## Known Notes

- Backend has graceful shutdown handlers for process signals/errors.
- Frontend includes request/response interceptors for auth token and network errors.

## License

ISC (as currently configured in backend `package.json`).
