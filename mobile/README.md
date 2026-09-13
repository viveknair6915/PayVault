# PayVault — React Native CLI Mobile Application

A production-grade Android mobile frontend for the **PayVault Multi-Payment Management System**, built using **React Native CLI**, **React Navigation**, **Axios**, and native **StyleSheet** components.

This mobile application interfaces seamlessly with the existing, untouched PayVault Express/MongoDB backend.

---

## Mobile Application Architecture

```
mobile/
├── android/                      # Native Android project (Gradle, Manifest, Java/Kotlin)
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── java/com/payvaultmobile/
│   │           ├── MainActivity.kt
│   │           └── MainApplication.kt
│   ├── build.gradle
│   ├── gradle.properties
│   └── settings.gradle
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── ConfirmModal.jsx      # Deletion confirmation modal
│   │   ├── Header.jsx            # Top app header with branding, badges & balance
│   │   ├── LoadingSpinner.jsx    # Themed activity indicator
│   │   ├── PaymentCard.jsx       # Channel card with masking, copy & disclaimers
│   │   ├── PaymentForm.jsx       # Dynamic form with channel-specific inputs
│   │   └── GoogleIcon.jsx        # Official Google "G" logo vector component
│   ├── context/                  # Global state management
│   │   ├── AuthContext.jsx       # Persistent authentication & user sessions
│   │   └── ToastContext.jsx      # Animated native toast banners
│   ├── navigation/               # Navigation tree
│   │   ├── AppNavigator.jsx      # Auth & main stack switcher
│   │   └── BottomTabNavigator.jsx# Bottom tabs (Profile, Payments, Add, Admin)
│   ├── screens/                  # Application views
│   │   ├── AddPaymentScreen.jsx  # Add new payment channel
│   │   ├── AdminDashboardScreen.jsx # Admin metrics & user directory
│   │   ├── AdminPaymentsScreen.jsx  # Admin search, filters & inspection
│   │   ├── DashboardScreen.jsx   # User profile & quick actions
│   │   ├── EditPaymentScreen.jsx # Edit existing payment & purge old fields
│   │   ├── LoginScreen.jsx       # Sign in with 1-tap quick demo accounts
│   │   ├── PaymentsScreen.jsx    # Payments portfolio with category filter pills
│   │   └── RegisterScreen.jsx    # User registration with live validation
│   ├── services/                 # API service layer (Axios)
│   │   ├── adminService.js       # Admin stats, users & payments endpoints
│   │   ├── api.js                # Axios client with 10.0.2.2 bridge & JWT interceptors
│   │   ├── authService.js        # Register, login & /auth/me endpoints
│   │   └── paymentService.js     # Payment CRUD endpoints
│   ├── styles/                   # Design system
│   │   └── theme.js              # Colors, spacing, typography & shadows
│   └── utils/                    # Helper functions & validation
│       ├── formatters.js         # String masking & date formatting
│       └── paymentValidator.js   # Regex validation matching backend
├── App.jsx                       # Root React Native component
├── app.json                      # Application metadata
├── babel.config.js               # Babel compiler configuration
├── index.js                      # React Native entry point
├── metro.config.js               # Metro bundler configuration
├── package.json                  # Dependencies & scripts
└── README.md                     # Documentation
```

---

## Quick Start Guide

### Prerequisites
1. **Node.js**: v18 or newer
2. **Java Development Kit (JDK)**: JDK 17 (Eclipse Temurin or OpenJDK)
3. **Android Studio & SDK**:
   - `Android SDK Platform 35` (or 34)
   - `Android SDK Build-Tools`
   - `Android SDK Command-line Tools`
   - Android Emulator configured (e.g. `Pixel_8`)
4. **Environment Variables**:
   - `ANDROID_HOME`: `%LOCALAPPDATA%\Android\Sdk`
   - Add to `PATH`: `%LOCALAPPDATA%\Android\Sdk\platform-tools`

---

## Exact Commands to Run the Application

### Step 1: Ensure the Backend is Running
The mobile application communicates with the existing backend:

```powershell
# In terminal 1:
cd c:\Users\HP\Downloads\PayVault\backend
npm run dev
```

*The backend will run on `http://localhost:5000`.*

---

### Step 2: Start the Metro Bundler
Open a new terminal window:

```powershell
# In terminal 2:
cd c:\Users\HP\Downloads\PayVault\mobile
npm start
```

---

### Step 3: Run on Android Emulator

Open a third terminal window and execute:

```powershell
# In terminal 3:
cd c:\Users\HP\Downloads\PayVault\mobile
npm run android
```

> [!TIP]
> Alternatively, start your emulator first via command line:
> ```powershell
> %LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe -avd Pixel_8
> ```
> Then run `npm run android`.

---

## Connecting to the Backend

### 1. Android Emulator (Default)
Android Emulators cannot connect to `localhost:5000` because `localhost` refers to the emulator itself.
- **Default host in `src/services/api.js`**: `http://10.0.2.2:5000/api`
- `10.0.2.2` automatically loops back to your computer's `localhost:5000`.

### 2. Physical Android Device
When testing on a physical smartphone over Wi-Fi or USB:
1. **USB Reverse Proxy (Recommended)**:
   ```powershell
   adb reverse tcp:5000 tcp:5000
   ```
   *This forwards the device's port 5000 to the computer's port 5000.*

2. **Local Wi-Fi Network**:
   - Find your computer's local IP using `ipconfig` (e.g. `192.168.1.15`).
   - On the Mobile Login Screen, tap the bottom **Backend: http://...** gear icon.
   - Enter `http://192.168.1.15:5000/api` and tap **Apply Server URL**.

---

## Quick Evaluation Credentials

The Login screen includes **1-Tap Quick Demo Account Pills** for rapid evaluation:

| Persona | Email | Password | Access Level |
|---|---|---|---|
| **Vivek Nair** | `demo@payvault.com` | `User@12345` | Complete portfolio (Bank, UPI, Paytm, PayPal, USDT) |
| **Admin** | `admin@payvault.com` | `Admin@12345` | Administrator Control Center & all records |
| **Rahul Sharma** | `rahul@payvault.com` | `User@12345` | Bank & UPI payment methods |

---

## Security & Business Logic Preservation

1. **Zero Backend Changes**: The backend API, schemas, encryption, and IDOR validation remain 100% untouched.
2. **At-Rest Decryption Handled Automatically**: The backend decrypts values and sends them to the authorized user; the mobile app masks digits with `••••••` and provides a 1-tap reveal toggle.
3. **Strict Field Isolation**: When updating a payment type (e.g. Bank to UPI), obsolete bank fields are automatically purged from the payload.
4. **Persistent Token Storage**: Uses `@react-native-async-storage/async-storage` to securely retain the JWT across app restarts.
5. **Role-Based Access Control**: Non-admin users cannot see or access the Admin tab.

---

## Required Dependencies

- **Navigation**:
  - `@react-navigation/native` (^7.0.14)
  - `@react-navigation/native-stack` (^7.2.0)
  - `@react-navigation/bottom-tabs` (^7.2.0)
  - `react-native-screens` (^4.4.0)
  - `react-native-safe-area-context` (^5.1.0)
- **State & Network**:
  - `axios` (^1.7.9)
  - `@react-native-async-storage/async-storage` (^2.1.0)
- **UI & Icons**:
  - `lucide-react-native` (^0.475.0)
  - `react-native-svg` (^15.11.1)
  - `@react-native-clipboard/clipboard` (^1.15.0)

---

## Troubleshooting

- **"Network Error" or requests timing out**:
  - Verify that the backend server is running on port 5000 (`npm run dev` in `backend/`).
  - In Android Emulator, verify `10.0.2.2:5000` is accessible.
- **Clear Metro Cache**:
  ```powershell
  npm start -- --reset-cache
  ```
- **Clean Gradle Build**:
  ```powershell
  cd android
  gradlew clean
  cd ..
  npm run android
  ```
