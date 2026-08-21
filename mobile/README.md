# DentAI Mobile Application (React Native + Expo)

A cross-platform mobile application powered by **React Native & Expo**, featuring role-based workflows for **Patients**, **Dentists**, and **Admins**, integrated AI diagnostic X-ray detection, real-time WebSocket chat, and **Leaflet + OpenStreetMap** map navigation.

---

## 📁 Project Architecture (`mobile/`)

```
mobile/
├── App.js                     # Root entry point wrapped with Redux & Context Providers
├── app.json                   # Expo SDK app configuration
├── package.json               # Dependencies & scripts
├── babel.config.js            # Babel preset for Expo
├── .env                       # Environment variables (API & Socket URLs)
├── .gitignore
│
├── assets/                    # Media assets (images, icons, fonts, animations)
│
└── src/
    ├── navigation/            # Navigation routing
    │   ├── AuthNavigator.js   # Login, Register, Password Recovery
    │   ├── PatientNavigator.js # Patient tab & stack routes
    │   ├── DentistNavigator.js # Dentist dashboard & diagnosis flows
    │   ├── AdminNavigator.js   # System administration tabs
    │   └── RootNavigator.js   # Dynamic auth-state & role switcher
    │
    ├── screens/
    │   ├── auth/              # LoginScreen, RegisterScreen, ForgotPassword, ResetPassword
    │   ├── patient/           # HomeScreen, ProfileScreen, MedicalProfile, SymptomChecker,
    │   │                      # BookAppointment, AppointmentHistory, ReportsScreen,
    │   │                      # ChatScreen, NearbyDentists (Leaflet OSM), Notifications, Settings
    │   ├── dentist/           # Dashboard, PatientList, UploadXray, DiagnosisReview,
    │   │                      # ChatScreen, Reports, Profile, Notifications
    │   └── admin/             # Dashboard, ManageDoctors, ManagePatients, ManageHospitals, Analytics
    │
    ├── components/            # Reusable UI component library (Button, Input, Card, Header, Loader, ChatBubble, ReportCard, AppointmentCard)
    ├── services/              # API wrappers (axios, auth, patient, doctor, appointment, report, chat, socket)
    ├── context/               # React Contexts (AuthContext, SocketContext, ThemeContext, NotificationContext)
    ├── hooks/                 # Custom Hooks (useAuth, useSocket, useLocation)
    ├── redux/                 # Redux Toolkit Store & Slices
    ├── utils/                 # Constants, helpers, validators, permissions
    ├── theme/                 # Design System (colors, fonts, styles)
    └── config/                # Axios, Firebase, and Leaflet OpenStreetMap HTML generator
```

---

## 🗺️ Leaflet + OpenStreetMap Integration

The app integrates **Leaflet + OpenStreetMap** inside `src/screens/patient/NearbyDentists.js` via `react-native-webview`:
- Free, interactive OpenStreetMap tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- Geolocation pinpointing with user position indicator.
- Custom clinic & dentist pins with popup popovers.
- One-tap "Book Appointment" navigation trigger directly from Leaflet popups.

---

## 🚀 How to Run

1. **Install Dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Start Expo Development Server**:
   ```bash
   npx expo start
   ```

3. **Run on Emulator / Physical Device**:
   - Press `a` for Android Emulator
   - Press `i` for iOS Simulator
   - Scan the QR code using the **Expo Go** app on your physical iOS/Android device
