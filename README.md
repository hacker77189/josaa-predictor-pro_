# 🎓 JoSAA Predictor Pro

A modern full-stack MERN application that helps JEE aspirants predict admission opportunities in **IITs, NITs, IIITs, and GFTIs** using previous years' JoSAA counselling data.

The application allows users to search colleges based on their **JEE rank, category, quota, gender, institute type, and preferred branch**, while providing an intuitive interface for comparing institutes and saving favorites.

---

## ✨ Features

### 🎯 College Prediction

* Predict eligible colleges based on JEE rank
* Filter by category, quota, gender, institute type, and branch
* Search colleges instantly
* View detailed institute information

### 📊 College Comparison

* Compare multiple colleges side-by-side
* Analyze opening and closing ranks
* Compare branches and institute details

### ❤️ Bookmarks

* Save favorite colleges
* View bookmarked colleges anytime
* Personalized dashboard

### 🔐 Authentication

* User Registration
* Secure Login
* JWT Authentication
* Protected Routes
* Password Encryption using bcryptjs

### 📁 Data Management

* CSV-based JoSAA dataset support
* MongoDB database integration
* Efficient filtering and searching

### 🎨 User Experience

* Responsive UI
* Smooth animations with Framer Motion
* Interactive charts using Recharts
* Modern Tailwind CSS interface

---

# 🛠 Tech Stack

## Frontend

* React 19
* Vite
* React Router
* Tailwind CSS
* Axios
* Framer Motion
* Recharts

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* dotenv
* csv-parser
* serverless-http

---

# 📂 Project Structure

```text
josaa-predictor-pro/
│
├── api/
│   └── index.js              # Vercel serverless entry point
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── context/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── data/
│   └── server.js
│
├── vercel.json
└── README.md
```

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/hacker77189/josaa-predictor-pro_.git
cd josaa-predictor-pro
```

---

## Install Dependencies

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd client
npm install
```

---

# ⚙ Environment Variables

Create a `.env` file inside the **server** directory (see `server/.env.example`).

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173,https://your-app.vercel.app
```

Create a `.env` file inside the **client** directory (see `client/.env.example`).

```env
VITE_API_URL=http://localhost:5000/api
```

---

# ▶ Running the Application

### Seed the Database

```bash
cd server
npm run seed
```

### Start Backend (development)

```bash
cd server
npm run dev
```

### Start Frontend (development)

```bash
cd client
npm run dev
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| POST   | `/api/users/register` | Register new user  |
| POST   | `/api/users/login`    | Login user         |
| GET    | `/api/users/me`       | Get logged-in user |

---

## Bookmarks

| Method | Endpoint                  | Description        |
| ------ | ------------------------- | ------------------ |
| POST   | `/api/users/bookmark/:id` | Bookmark a college |
| GET    | `/api/users/bookmarks`    | Get all bookmarks  |

---

## Prediction

| Method | Endpoint       | Description               |
| ------ | -------------- | ------------------------- |
| GET    | `/api/predict` | Predict eligible colleges |

---

# 📦 Main Dependencies

### Frontend

* React
* React Router
* Axios
* Tailwind CSS
* Framer Motion
* Recharts

### Backend

* Express
* MongoDB / Mongoose
* JWT / bcryptjs
* Helmet (security headers)
* Compression (gzip)
* Morgan (logging)
* csv-parser
* dotenv
* serverless-http

---

# 🌐 Deployment

The project is configured for deployment on **Vercel**.

### One-click Deploy (via Vercel Dashboard)

1. Push the repository to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your GitHub repo
3. Add these environment variables in the Vercel dashboard:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a secure random string
   - `CORS_ORIGIN` — your Vercel domain (e.g. `https://your-app.vercel.app`)
4. Deploy

### CLI Deploy

```bash
vercel login
vercel --prod
```

The API serverless entry point is at `api/index.js`, using `serverless-http` to wrap the Express app.

---

# 📈 Future Enhancements

* AI-powered admission prediction
* Multi-year cutoff trend analysis
* College recommendation engine
* Preference list generation
* Admin dashboard
* CSV upload interface
* Email verification
* Forgot password
* Notification system
* PWA support

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

Built as a full-stack MERN application to simplify JoSAA college prediction and help JEE aspirants make informed counselling decisions.
