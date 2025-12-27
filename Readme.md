# 🎬 YouTube Clone – Backend API

A full-featured backend system for a YouTube-like platform built with **Node.js, Express, MongoDB, and Cloudinary**.  
Includes authentication, video management, likes, comments, playlists, subscriptions, tweets, and analytics.

---

## 🚀 Features

### 🔐 Authentication
- JWT-based authentication
- Access & Refresh tokens
- Secure middleware protection

### 📹 Video System
- Upload videos & thumbnails to Cloudinary  
- Publish / Unpublish videos  
- Update video details  
- Delete videos with Cloudinary cleanup  
- View count tracking  
- Video search, filter, pagination, and sorting  

### 💬 Comments
- Add, update, delete comments  
- Paginated comment listing  
- Owner detection & like detection  

### ❤️ Likes
- Like / Unlike videos  
- Like / Unlike comments  
- Like / Unlike tweets  
- Fetch all liked videos  

### 📁 Playlists
- Create playlists  
- Add / Remove videos  
- Update & Delete playlists  
- Fetch playlists with owner & video info  

### 👥 Subscriptions
- Subscribe / Unsubscribe channels  
- Get channel subscribers  
- Get subscribed channels  

### 🐦 Tweets
- Create, update, delete tweets  
- Fetch user tweets  

### 📊 Channel Analytics
- Total videos  
- Total views  
- Total subscribers  
- Total likes  

---

## 🧱 Tech Stack

- **Node.js**
- **Express**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Cloudinary**
- **Multer**
- **Aggregation Pipelines**

---

## 🗂 Project Structure

```
src/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── db/
└── app.js
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
MONGODB_URI=your_mongo_connection
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```
---
## 🧪 API Overview

| Module        | Description                           |
| ------------- | ------------------------------------- |
| Auth          | Login, Register, Refresh              |
| Videos        | Upload, Update, Delete, Publish, View |
| Comments      | Add, Update, Delete, List             |
| Likes         | Toggle video/comment/tweet like       |
| Playlists     | CRUD + Video Management               |
| Subscriptions | Subscribe / Unsubscribe               |
| Tweets        | CRUD                                  |
| Analytics     | Channel Stats                         |

---

## 🧠 Core Engineering Concepts

- Two-phase Cloudinary cleanup

- Transaction-safe resource handling

- Aggregation-driven APIs

- Pagination & filtering

- Role-based ownership checks

- Production-level error handling

---
## 🛠 How to Run Locally
```
git clone https://github.com/yourusername/youtube-clone-backend.git
cd youtube-clone-backend
npm install
npm run dev
```
---
## 🧑‍💻 Author

### Uday Pratap Vashishtha

Backend Engineer | MERN Developer
---
## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
