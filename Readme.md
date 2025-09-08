# Streamify Backend 

A **production-ready backend** for a social media platform that combines features of **YouTube (videos, subscriptions, likes, comments)** and **Twitter (tweet-like short posts)**.  
Built with **Node.js, Express, MongoDB, and Cloudinary**, this project demonstrates scalable backend architecture, secure authentication, and advanced aggregation pipelines.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication (Access + Refresh tokens)
- Secure password hashing with bcrypt
- Role-based access control (users, creators)

### 👤 User Management
- Signup, login, logout
- Update profile, avatar upload (Cloudinary)
- Subscribe/unsubscribe to channels

### 🎥 Video Features
- Upload & stream videos (Cloudinary)
- Like/Dislike videos
- Comment system with CRUD
- Watch history & playlists
- Aggregation pipelines for:
  - Total views
  - Channel statistics (subscribers, likes, videos)

### 🐦 Tweet Features
- Post, update, delete tweets
- Like/unlike tweets
- Fetch tweets by user/channel

### 📊 Analytics
- Aggregation pipelines for channel insights:
  - Total subscribers
  - Total videos
  - Total views
  - Total likes
- Trending videos based on views/likes

---

## 🛠️ Tech Stack

- **Backend Framework**: Node.js, Express.js  
- **Database**: MongoDB (Mongoose ODM)  
- **Authentication**: JWT, bcrypt, cookies  
- **File Storage**: Cloudinary (for videos & images)  
- **Utilities**: Aggregation pipelines, async handlers  
- **Pagination**: mongoose-aggregate-paginate-v2  
- **Testing**: Postman  

---

## 📂 Project Structure

