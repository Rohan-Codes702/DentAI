# 🦷 DentAI — AI-Powered Tele-Dental Platform

> **DentAI** is an AI-powered tele-dental platform that connects patients with dentists remotely and provides intelligent dental X-ray analysis using computer vision.

DentAI combines **telemedicine, real-time communication, appointment management, dental image analysis, and AI-assisted diagnosis** into a single platform.

---

## 📌 Overview

Access to qualified dental care can be difficult for patients living in remote areas or those unable to visit a dental clinic immediately.

**DentAI** addresses this problem by providing a digital platform where patients can:

* 👤 Create and manage their profiles
* 🦷 Discover dentists based on specialization, rating, location, and availability
* 📅 Book available appointment slots
* 💬 Communicate with dentists through real-time chat
* 🩻 Upload dental X-rays for AI-assisted analysis
* 🤖 Receive AI-generated dental detection results
* ⭐ Review and rate dentists
* 📄 Generate dental reports
* 🔔 Receive notifications for important events

Dentists can manage their profiles, availability, appointments, patient communication, and uploaded dental X-rays through the platform.

---

# ✨ Key Features

## 👤 Patient Features

* Patient registration and login
* Secure JWT authentication
* Patient profile management
* Dentist discovery
* Search and filtering
* Dentist specialization information
* Dentist ratings and reviews
* Appointment slot selection
* Appointment booking
* Real-time dentist-patient chat
* Dental X-ray upload
* AI-powered X-ray analysis
* Dental detection results
* Report generation
* Email notifications
* Push notifications

---

## 👨‍⚕️ Dentist Features

* Dentist registration and authentication
* Professional profile management
* Specialization management
* Availability and appointment slot management
* Patient appointment management
* Real-time patient communication
* X-ray analysis access
* AI-generated dental detection results
* Patient review management

---

# 🤖 AI-Powered Dental X-Ray Analysis

DentAI integrates a dedicated AI service for analyzing dental X-ray images.

The AI service uses **YOLOv8** for object detection and identifies multiple dental conditions and structures from uploaded X-rays.

### Detection Classes

The current model supports detection of:

1. 🦷 Caries
2. 👑 Crown
3. 🧱 Filling
4. 🔩 Implant
5. ❌ Missing Teeth
6. 🔴 Periapical Lesion
7. 🦷 Root Canal Treatment
8. 🦴 Root Piece
9. 🦷 Impacted Tooth
10. 🦴 Bone Loss

> **Important:** AI results are intended to assist dental professionals and should not be treated as a replacement for professional clinical diagnosis.

---

# 🏗️ System Architecture

DentAI follows a **multi-service architecture** consisting of three major components:

```text
                    ┌─────────────────────┐
                    │   DentAI Mobile App │
                    │   React Native      │
                    │      Expo           │
                    └──────────┬──────────┘
                               │
                    REST API / Socket.IO
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Node.js Server   │
                    │      Express.js     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        MongoDB Atlas      Cloudinary       Socket.IO
              │                │
              │                └── Image Storage
              │
              ▼
       Application Data


                    X-Ray Analysis
                           │
                           ▼
                ┌─────────────────────┐
                │   Python AI Service │
                │      FastAPI        │
                │       YOLOv8        │
                └─────────────────────┘
                           │
                           ▼
                  Detection Results
```

---

# 🛠️ Technology Stack

## 📱 Mobile Application

* **React Native**
* **Expo SDK**
* JavaScript
* React Navigation
* Axios
* Socket.IO Client
* Expo Notifications
* Expo Location
* AsyncStorage

---

## 🖥️ Backend

* **Node.js**
* **Express.js**
* JavaScript
* REST APIs
* JWT Authentication
* bcrypt
* Socket.IO
* Multer
* PDFKit
* Nodemailer

---

## 🗄️ Database

* **MongoDB Atlas**
* MongoDB
* Mongoose

---

## ☁️ Cloud & Storage

* MongoDB Atlas
* Cloudinary
* EAS Build
* Cloudflare Tunnel / ngrok for local development

---

## 🤖 AI Service

* **Python**
* FastAPI
* YOLOv8
* Ultralytics
* Computer Vision
* Object Detection

---

# 📂 Project Structure

```text
DentAI/
│
├── mobile/
│   ├── assets/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── services/
│   ├── context/
│   ├── config/
│   ├── App.js
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── ai-service/
│   ├── model/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── main.py
│   ├── requirements.txt
│   └── best.pt
│
└── README.md
```

---

# 🔄 Application Workflow

### 1. User Registration

The patient or dentist creates an account.

```text
User
  ↓
Registration
  ↓
Validation
  ↓
Password Hashing
  ↓
MongoDB
  ↓
Account Created
```

### 2. Authentication

DentAI uses JWT-based authentication.

```text
Login
  ↓
Credentials Verification
  ↓
JWT Token
  ↓
Authenticated Requests
```

### 3. Dentist Discovery

Patients can find dentists based on:

* Specialization
* Location
* Rating
* Availability

```text
Patient
   ↓
Search Dentists
   ↓
Filters
   ↓
Available Dentists
   ↓
Dentist Profile
```

### 4. Appointment Booking

```text
Patient
   ↓
Select Dentist
   ↓
View Available Slots
   ↓
Select Slot
   ↓
Book Appointment
   ↓
Appointment Confirmation
```

### 5. Real-Time Chat

DentAI uses **Socket.IO** for real-time communication.

```text
Patient
   │
   │ Message
   ▼
Socket.IO Server
   │
   │ Real-time Event
   ▼
Dentist
```

### 6. AI X-Ray Analysis

```text
Patient
   ↓
Upload X-Ray
   ↓
Node.js Server
   ↓
AI Service
   ↓
YOLOv8 Model
   ↓
Object Detection
   ↓
Detection Results
   ↓
Node.js Server
   ↓
Mobile Application
```

---

# 🔐 Security

DentAI implements several security mechanisms:

* JWT-based authentication
* Password hashing using bcrypt
* Protected API routes
* Role-based access control
* Authentication middleware
* Input validation
* Secure image upload handling
* Environment variables for sensitive configuration
* Cloudinary-based media storage

### Example Authentication Flow

```text
Client
  │
  │ Login
  ▼
Express API
  │
  │ Verify Credentials
  ▼
MongoDB
  │
  │ Valid
  ▼
JWT Token
  │
  ▼
Client
```

---

# 💬 Real-Time Communication

DentAI provides real-time patient-dentist communication using **Socket.IO**.

Features include:

* One-to-one messaging
* Real-time message delivery
* Online communication
* Appointment-related communication

---

# 📄 Dental Report Generation

DentAI can generate dental reports based on available patient and AI analysis information.

Reports can contain:

* Patient information
* Dentist information
* X-ray information
* Detected dental conditions
* Detection confidence
* Analysis details
* Report date

PDF reports are generated using **PDFKit**.

---

# 🔔 Notifications

DentAI supports notification functionality for important application events.

Examples:

* Appointment confirmation
* Appointment updates
* New messages
* Dental analysis completion
* Other application notifications

---

# 🌐 API Architecture

The backend follows a RESTful API architecture.

```text
Mobile Application
        │
        ▼
     Axios
        │
        ▼
   Express Router
        │
        ▼
  Authentication
   Middleware
        │
        ▼
   Controller
        │
        ▼
    Service
        │
        ▼
    Mongoose
        │
        ▼
   MongoDB Atlas
```

---

# ⚙️ Environment Variables

Create environment files for each service.

## Server

Example:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

AI_SERVICE_URL=http://localhost:8000

CLIENT_URL=your_mobile_or_client_url

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_email
SMTP_PASSWORD=your_email_password
```

## Mobile

Example:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_SERVER_URL:5000
EXPO_PUBLIC_SOCKET_URL=http://YOUR_SERVER_URL:5000
```

## AI Service

Example:

```env
MODEL_PATH=./model/best.pt
```

> Never commit `.env` files, API keys, database credentials, or private secrets to GitHub.

---

# 🚀 Installation & Setup

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* MongoDB Atlas account
* Python 3.x
* Expo CLI
* Git

---

# 1️⃣ Clone Repository

```bash
git clone https://github.com/Rohan-Codes702/DentAI.git

cd DentAI
```

---

# 2️⃣ Setup Backend

```bash
cd server

npm install
```

Create your `.env` file and configure the required environment variables.

Start the development server:

```bash
npm run dev
```

or:

```bash
npm start
```

Backend will run on:

```text
http://localhost:5000
```

---

# 3️⃣ Setup AI Service

Open another terminal:

```bash
cd ai-service
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload --port 8000
```

AI service:

```text
http://localhost:8000
```

---

# 4️⃣ Setup Mobile Application

Open another terminal:

```bash
cd mobile

npm install
```

Start Expo:

```bash
npx expo start
```

You can then run the application using:

* Android Emulator
* Physical Android Device
* Expo development environment

---

# 📱 Mobile Development

For local development, make sure the mobile application can access the backend.

For example:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:5000
```

If the backend needs to be accessed from outside the local network, a tunneling service such as Cloudflare Tunnel can be used.

Example:

```bash
cloudflared tunnel --url http://localhost:5000
```

---

# 🧠 AI Model

DentAI uses a custom-trained **YOLOv8 object detection model** for dental X-ray analysis.

### Model Configuration

```text
Architecture: YOLOv8
Task: Object Detection
Image Size: 640 × 640
Training Epochs: 100
Batch Size: 8
Dataset: Dental X-ray images
```

The trained model is used by the FastAPI AI service to process uploaded X-ray images and return detected objects and confidence values.

---

# 📊 AI Detection Response

A typical AI response can contain information such as:

```json
{
  "success": true,
  "detections": [
    {
      "class": "Caries",
      "confidence": 0.87,
      "box": {
        "x1": 120,
        "y1": 85,
        "x2": 250,
        "y2": 210
      }
    }
  ]
}
```

The mobile application can use these results to display the detected conditions to the user and dentist.

---

# 🗃️ Main Data Models

The backend can manage entities such as:

```text
User
 ├── Patient
 └── Dentist

Dentist
 ├── Specialization
 ├── Availability
 ├── Ratings
 └── Reviews

Patient
 ├── Profile
 ├── Appointments
 ├── X-Rays
 └── Reports

Appointment
 ├── Patient
 ├── Dentist
 ├── Date
 ├── Time Slot
 └── Status

Message
 ├── Sender
 ├── Receiver
 └── Content

X-Ray
 ├── Patient
 ├── Image
 └── AI Results

Report
 ├── Patient
 ├── Dentist
 └── Detection Results
```

---

# 🧩 Major Modules

| Module             | Purpose                                    |
| ------------------ | ------------------------------------------ |
| Authentication     | Registration, login and JWT authentication |
| Patient Management | Patient profiles and information           |
| Dentist Management | Dentist profiles and availability          |
| Dentist Discovery  | Search and filtering                       |
| Appointment        | Slot management and booking                |
| Chat               | Real-time communication                    |
| X-Ray Upload       | Dental image upload                        |
| AI Analysis        | YOLOv8-based detection                     |
| Reports            | Dental report generation                   |
| Reviews            | Dentist ratings and reviews                |
| Notifications      | Application event notifications            |

---

# 📐 Architecture Principles

DentAI follows a modular architecture to keep the application maintainable.

### Backend

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Models
   ↓
MongoDB
```

### AI

```text
API Request
   ↓
Image Validation
   ↓
Image Processing
   ↓
YOLOv8 Inference
   ↓
Result Processing
   ↓
JSON Response
```

### Mobile

```text
Screens
   ↓
Components
   ↓
Services
   ↓
REST API / Socket.IO
```

---

# 🧪 Testing

Before deploying DentAI, test the following major workflows:

### Authentication

* Registration
* Login
* Invalid credentials
* JWT-protected routes
* Logout

### Appointment

* Dentist availability
* Slot selection
* Appointment creation
* Appointment status

### Chat

* Message sending
* Real-time message receiving
* Multiple sessions

### AI

* X-ray upload
* Image validation
* AI inference
* Detection result
* Confidence value

### Reports

* Report generation
* PDF creation
* Report download

---

# 🐳 Docker Support

The individual services can also be containerized for consistent deployment.

A possible deployment structure is:

```text
                    DentAI
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
     Mobile        Backend        AI Service
                     │               │
                     ▼               ▼
                 MongoDB          YOLOv8
                  Atlas
```

Docker can be introduced for:

* Node.js backend
* Python AI service
* Development environments
* Deployment consistency

---

# ☁️ Deployment Architecture

A production deployment can be structured as:

```text
                  ┌──────────────────┐
                  │   React Native   │
                  │   Mobile Client  │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   Backend API    │
                  │ Node + Express   │
                  └────────┬─────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
       MongoDB Atlas   Cloudinary     AI Service
                                       │
                                       ▼
                                    YOLOv8
```

---

# 🎯 Project Goals

DentAI aims to:

* Improve accessibility to dental consultation
* Connect patients with dentists remotely
* Simplify appointment management
* Enable real-time patient-dentist communication
* Assist dentists with AI-based dental X-ray analysis
* Digitize dental reports and patient information
* Provide a scalable foundation for tele-dentistry

---

# 🔮 Future Scope

Possible future improvements include:

* 🧠 Improved AI model accuracy
* 🩻 Support for additional dental X-ray types
* 📊 Patient dental history dashboard
* 💳 Online payment integration
* 📹 Video consultation
* 🗺️ Advanced dentist location services
* 🔔 Advanced notification system
* 🌐 Web dashboard for dentists
* ☁️ Production cloud deployment
* 📈 AI analysis history and analytics
* 🔐 Additional security and privacy controls
* 🏥 Integration with dental clinic management systems

---

# ⚠️ Medical Disclaimer

DentAI is a software project intended for **educational, research, and clinical-assistance purposes**.

AI-generated dental detections should **not be considered a definitive medical diagnosis**. Dental X-rays and AI-generated results should be reviewed and interpreted by a qualified dental professional.

---

# 👨‍💻 Developer

### Rohan Mane

**Full-Stack Developer | MERN | AI Integration**

* GitHub: [@Rohan-Codes702](https://github.com/Rohan-Codes702)
* Portfolio: https://portfolio-mpxe.vercel.app
* LinkedIn: https://linkedin.com/in/rohanmane2005

---

# ⭐ Support

If you find DentAI useful or interesting, consider giving the repository a ⭐ on GitHub.

---

## 📄 License

This project is currently intended for educational and development purposes.


