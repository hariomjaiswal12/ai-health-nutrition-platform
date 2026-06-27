# 🌱 Swasthya Sutra (स्वास्थ्य सूत्र)
### *Your Ancient Blueprint for Modern Longevity*

Swasthya Sutra is a premium, full-stack **MERN (MongoDB, Express, React, Node.js)** health and nutrition platform. It merges the timeless wisdom of **Ayurvedic Medicine** with modern AI-driven lifestyle diagnostics, offering personalized dosha assessments, clinical registry analytics, and patient consultation scheduling.

---

## 📸 Project Previews

### 1. Elegant Landing Screen (Home)
A beautifully designed split hero featuring system health pulses, Prakriti composition guides, and timeline milestones.
<img src="screenshots/home.png" width="650" alt="Swasthya Sutra Home Page" />

### 2. Health Analytics Dashboard
An interactive analytics center with demographics pie charts, food classification bar charts, and patient admissions registries.
<img src="screenshots/dashboard.png" width="650" alt="Swasthya Sutra Dashboard" />

### 3. Appointments Scheduler
A clinical appointments manager featuring status badge filtering (Pending, Confirmed, Completed, Cancelled) and Vaidya assignment cards.
<img src="screenshots/appointments.png" width="650" alt="Swasthya Sutra Scheduler" />

### 4. Glassmorphic Authentication
A glass-card login and registration system with secure role selection (Patient, Doctor, Admin).
<img src="screenshots/login.png" width="650" alt="Swasthya Sutra Login" />

---

## ✨ Core Features

*   🧬 **Prakriti (Dosha) Quiz:** Comprehensive assessment to analyze and determine individual Vata, Pitta, and Kapha constitutional balances.
*   📊 **Analytics Dashboard:** Real-time metrics tracking patients, foods, and diet plan formulations with interactive Chart.js visualizations.
*   📅 **Vaidya Booking System:** Patients can browse doctors, check consultation fees, and schedule appointments with automated status management.
*   🍎 **Ayurvedic Foods Index:** Searchable database categorized by food groups and annotated with dosha-specific health actions.
*   📋 **Diet Plan Formulations:** Clinicians can create custom nutrition programs tailored to a patient's dominant dosha.
*   💬 **Prakriti AI Assistant:** A built-in virtual Ayurvedic assistant answering questions about doshas, herbs, and diet recommendations.
*   🔒 **JWT Role-Based Access:** Structured routing separating Patient, Doctor, and Administrator panels.

---

## 🛠️ Technology Stack

### **Frontend**
*   **Core:** React (v19) & React Router
*   **Styling:** Vanilla CSS (Tailored OKLCH Palette, Glassmorphism, and Fluid Transitions)
*   **Charts:** Chart.js & React-Chartjs-2

### **Backend**
*   **Runtime:** Node.js & Express.js
*   **Authentication:** JWT (JsonWebToken) & Bcrypt password encryption
*   **Database ORM:** Mongoose (MongoDB Atlas integration)

---

## 🚀 Installation & Local Setup

### **Prerequisites**
Make sure you have Node.js (v18+) and npm installed on your system.

### **1. Clone the Repository**
```bash
git clone https://github.com/hariomjaiswal12/ai-health-nutrition-platform.git
cd ai-health-nutrition-platform
```

### **2. Setup the Backend Server**
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend` folder:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=swasthyaSecretKey
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *The server will run on `http://localhost:5000/`.*

### **3. Setup the Frontend Client**
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```
   *The application will launch on `http://localhost:3000/`.*

---

## 👨‍💻 Contributors
*   **Hariom Jaiswal** - *Creator & Lead Developer*
