# MyTube Backend

A robust, scalable backend API for a YouTube-like video sharing platform built with **Node.js**, **Express.js**, and **MongoDB**. This project follows clean architecture principles with modular routing, middleware-based authentication, and cloud-based media storage.

---

## 🚀 Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js (ES Modules) |
| **Framework** | Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT (Access & Refresh Tokens) |
| **File Upload** | Multer + Cloudinary |
| **Password Hashing** | bcryptjs |
| **Validation** | Custom middleware |
| **Development** | Nodemon, Prettier |

---

## 📁 Project Structure

```
src/
├── app.js                 # Express app configuration
├── index.js               # Entry point - DB connection & server start
├── constants.js           # Application constants
├── controllers/           # Route handlers (business logic)
│   ├── user.controller.js
│   ├── video.controller.js
│   ├── playlist.controller.js
│   ├── subscription.controller.js
│   ├── comment.controller.js
│   ├── like.controller.js
│   ├── tweet.controller.js
│   ├── dashboard.controller.js
│   └── healthcheck.controller.js
├── middlewares/
│   ├── auth.middleware.js     # JWT verification
│   └── multer.middleware.js   # File upload handling
├── models/
│   ├── user.model.js
│   ├── video.model.js
│   ├── playlist.model.js
│   ├── subscription.model.js
│   ├── comment.model.js
│   ├── like.model.js
│   └── tweet.model.js
├── routes/
│   ├── user.routes.js
│   ├── video.routes.js
│   ├── playlist.routes.js
│   ├── subscription.routes.js
│   ├── comment.routes.js
│   ├── like.routes.js
│   ├── tweet.routes.js
│   ├── dashboard.routes.js
│   └── healthcheck.routes.js
├── utils/
│   ├── ApiError.js           # Custom error class
│   ├── ApiResponse.js        # Standardized response format
│   ├── asyncHandler.js       # Wrapper for async route handlers
│   └── cloudinary.js         # Cloudinary configuration
└── db/
    └── index.js              # MongoDB connection
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js ≥ 18.x
- MongoDB (local or Atlas)
- Cloudinary account (for media storage)

### 1. Clone & Install
```bash
git clone <repository-url>
cd my-tube-backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017
DB_NAME=videotube

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```

Server starts at `http://localhost:8000`

---

## 📚 API Endpoints

All API routes are prefixed with `/api/v1`

### 🏥 Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/healthcheck` | Check API health status |

---

### 👤 User Authentication & Profile
**Base Path:** `/api/v1/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Register new user (avatar + cover image upload) |
| `POST` | `/login` | ❌ | Login user |
| `POST` | `/logout` | ✅ | Logout user |
| `POST` | `/refresh-token` | ❌ | Refresh access token |
| `POST` | `/change-password` | ✅ | Change password |
| `GET` | `/current-user` | ✅ | Get current user profile |
| `PATCH` | `/update-account` | ✅ | Update account details |
| `PATCH` | `/avatar` | ✅ | Update user avatar |
| `PATCH` | `/cover-image` | ✅ | Update cover image |
| `GET` | `/c/:username` | ✅ | Get user channel profile |
| `GET` | `/history` | ✅ | Get watch history |

**Register Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "fullName": "John Doe"
}
```
*Files: `avatar` (optional), `coverImage` (optional) via multipart/form-data*

**Login Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

---

### 🎬 Video Management
**Base Path:** `/api/v1/videos` *(All routes require authentication)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all videos (with pagination) |
| `POST` | `/` | Publish a new video |
| `GET` | `/:videoId` | Get video by ID |
| `DELETE` | `/:videoId` | Delete a video |
| `PATCH` | `/:videoId` | Update video (thumbnail optional) |
| `PATCH` | `/toggle/publish/:videoId` | Toggle publish status |

**Publish Video Request:**
```json
{
  "title": "My Awesome Video",
  "description": "Video description here",
  "duration": 300,
  "isPublished": true
}
```
*Files: `videoFile` (required), `thumbnail` (optional) via multipart/form-data*

---

### 📋 Playlist Management
**Base Path:** `/api/v1/playlist` *(All routes require authentication)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | Create a new playlist |
| `GET` | `/:playlistId` | Get playlist by ID |
| `PATCH` | `/:playlistId` | Update playlist |
| `DELETE` | `/:playlistId` | Delete playlist |
| `PATCH` | `/add/:videoId/:playlistId` | Add video to playlist |
| `PATCH` | `/remove/:videoId/:playlistId` | Remove video from playlist |
| `GET` | `/user/:userId` | Get user's playlists |

**Create Playlist Request:**
```json
{
  "name": "My Favorites",
  "description": "Collection of my favorite videos"
}
```

---

### 🔔 Subscriptions
**Base Path:** `/api/v1/subscriptions` *(All routes require authentication)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/c/:channelId` | Get channels user is subscribed to |
| `POST` | `/c/:channelId` | Toggle subscription (subscribe/unsubscribe) |
| `GET` | `/u/:subscriberId` | Get channel's subscribers |

---

### 💬 Comments
**Base Path:** `/api/v1/comments` *(All routes require authentication)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/:videoId` | Get all comments for a video |
| `POST` | `/:videoId` | Add comment to video |
| `DELETE` | `/c/:commentId` | Delete a comment |
| `PATCH` | `/c/:commentId` | Update a comment |

**Add Comment Request:**
```json
{
  "content": "Great video!"
}
```

---

### ❤️ Likes
**Base Path:** `/api/v1/likes` *(All routes require authentication)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/toggle/v/:videoId` | Toggle like on video |
| `POST` | `/toggle/c/:commentId` | Toggle like on comment |
| `POST` | `/toggle/t/:tweetId` | Toggle like on tweet |
| `GET` | `/videos` | Get user's liked videos |
| `GET` | `/v/:videoId` | Get video like count |
| `GET` | `/c/:commentId` | Get comment like count |
| `GET` | `/t/:tweetId` | Get tweet like count |

---

### 🐦 Tweets (Short Posts)
**Base Path:** `/api/v1/tweets` *(All routes require authentication)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | Create a tweet |
| `GET` | `/user/:userId` | Get user's tweets |
| `PATCH` | `/:tweetId` | Update a tweet |
| `DELETE` | `/:tweetId` | Delete a tweet |

**Create Tweet Request:**
```json
{
  "content": "Just finished building this amazing feature! #coding"
}
```

---

### 📊 Dashboard & Analytics
**Base Path:** `/api/v1/dashboard` *(All routes require authentication)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stats` | Get channel statistics (views, subscribers, videos, etc.) |
| `GET` | `/videos` | Get channel's videos with analytics |

---

## 🔐 Authentication Flow

### Token Strategy
- **Access Token**: Short-lived (1 day), sent in Authorization header
- **Refresh Token**: Long-lived (10 days), stored in HTTP-only cookie

### Headers
```
Authorization: Bearer <access_token>
```

### Token Refresh
When access token expires, call `POST /api/v1/users/refresh-token` with the refresh token cookie to get a new access token.

---

## 📦 Media Upload (Cloudinary)

All media files (avatars, cover images, video thumbnails, video files) are uploaded to **Cloudinary** via Multer middleware.

### Supported File Types
- **Images**: JPEG, PNG, WebP (avatars, thumbnails, cover images)
- **Videos**: MP4, WebM, MOV (video files)

### Upload Limits
- JSON body: 16KB
- URL-encoded: 16KB
- Files: Handled by Multer (configured in `multer.middleware.js`)

---

## 🗄️ Database Models Overview

### User
- `username` (unique)
- `email` (unique)
- `password` (hashed)
- `fullName`
- `avatar` (Cloudinary URL)
- `coverImage` (Cloudinary URL)
- `watchHistory` (array of video refs)
- `refreshToken`

### Video
- `title`
- `description`
- `videoFile` (Cloudinary URL)
- `thumbnail` (Cloudinary URL)
- `duration`
- `views`
- `isPublished`
- `owner` (User ref)

### Playlist
- `name`
- `description`
- `videos` (array of Video refs)
- `owner` (User ref)

### Subscription
- `subscriber` (User ref)
- `channel` (User ref)

### Comment
- `content`
- `video` (Video ref)
- `owner` (User ref)

### Like
- `video` / `comment` / `tweet` (polymorphic)
- `likedBy` (User ref)

### Tweet
- `content`
- `owner` (User ref)

---

## 🛡️ Error Handling

Standardized error response format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [],
  "statusCode": 400
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## ✅ Success Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "statusCode": 200
}
```

---

## 🧪 Development

### Code Style
```bash
# Format code with Prettier
npx prettier --write .
```

### Git Hooks
Configured via `.prettierignore` and `.gitignore`

---

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 8000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `DB_NAME` | Yes | Database name |
| `ACCESS_TOKEN_SECRET` | Yes | JWT access token secret |
| `ACCESS_TOKEN_EXPIRY` | No | Access token expiry (default: 1d) |
| `REFRESH_TOKEN_SECRET` | Yes | JWT refresh token secret |
| `REFRESH_TOKEN_EXPIRY` | No | Refresh token expiry (default: 10d) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `CORS_ORIGIN` | Yes | Frontend origin for CORS |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

ISC License - see LICENSE file for details.

---

## 👨‍💻 Author

Built with ❤️ following **Chai Aur Code** YouTube channel tutorials by **Hitesh Choudhary**.

---

## 🔗 Useful Links

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [JWT.io](https://jwt.io/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)

---

*Last updated: August 2026*