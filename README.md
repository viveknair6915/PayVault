# PayVault — Multi-Payment Management System

PayVault is a secure, production-grade, full-stack payment information management platform built with the MERN stack (**MongoDB, Express.js, React.js, Node.js**) alongside a standalone native **React Native CLI (Android)** mobile client. Designed with inspiration from modern fintech interfaces, PayVault provides a unified dashboard for individuals to manage diverse payment methods while giving platform administrators deep search, filter, and analytics capabilities.

---

## 📱 Application User Flow & Screenshots

### 1. Web Authentication & Google Sign-In
![1. Authentication & Google Sign-In](./Screenshots/image1.png)
> **Step 1 — Web Login Screen**: Features verified Google Identity Services sign-in when configured, quick evaluation demo account selectors (**Vivek Nair**, **Admin**, **Rahul Sharma**), and password sign-in.

---

### 2. Manage Payments Portfolio
![2. Manage Payments Portfolio](./Screenshots/image2.png)
> **Step 2 — Payments Dashboard**: Unified overview of all saved payment methods across 5 types (**Bank**, **UPI**, **Paytm**, **PayPal**, **USDT**). Includes dynamic category filter pills, sensitive number masking with 1-click reveal, one-touch copy buttons `[📋]`, transfer disclaimer notices, and edit/delete actions.

---

### 3. Dynamic Add / Edit Payment Method
![3. Dynamic Add Payment Method](./Screenshots/image3.png)
> **Step 3 — Dynamic Form & Field Isolation**: Interactive payment method creation with horizontal channel pills. Only fields relevant to the selected payment method are displayed and stored (e.g. Bank displays IFSC & Account Number; UPI displays VPA). Switching types automatically prunes obsolete fields from the database.

---

### 4. User Profile & Account Security
![4. User Profile & Account Security](./Screenshots/image4.png)
> **Step 4 — Profile & Settings**: Displays verified account badge, registered email, total active payment methods count, membership duration, security audit status, and quick navigation shortcuts.

---

### 5. Admin Control Center & Analytics
![5. Admin Control Center](./Screenshots/image5.png)
> **Step 5 — Web Administrator Dashboard**: Accessible exclusively to users with `role: 'admin'`. Displays high-level platform metrics, total payment methods, distribution charts across all 5 payment types, and the registered users directory with access to the searchable payment database.

---

### 6. Mobile Application — Authentication & Native Google Sign-In (Android)
![6. Mobile Authentication & Google Sign-In](./Screenshots/image6.png)
> **Step 6 — Native Mobile Login**: Production-grade React Native CLI Android interface running on Pixel 3a (Android 14 API 34). Features verified native Google Sign-In via Google Play Services (`@react-native-google-signin/google-signin`), 1-tap quick evaluation demo account selection pills (**Vivek Nair**, **Admin**, **Rahul Sharma**), and secure JWT session persistence via AsyncStorage.

---

### 7. Mobile Application — Admin Control Center & Channel Breakdown (Android)
![7. Mobile Admin Control Center](./Screenshots/image7.png)
> **Step 7 — Mobile Administrator Dashboard**: Complete administrator control center on mobile. Displays real-time aggregate metrics (Registered Users, Total Saved Payments), color-coded channel distribution cards across all 5 payment types (Bank, UPI, Paytm, PayPal, USDT), and an interactive registered user directory.

---

## ⚡ Features

### 🔐 Authentication & Authorization
- **User Registration & Login**: Validated email and password creation with bcrypt 10-round hashing.
- **Native & Web Google Sign-In**: Verified Google Identity Services sign-in on web and native Google Play Services sign-in on Android. The backend verifies the Google ID token audience against configured Client IDs before issuing a PayVault JWT.
- **JWT Authentication**: Secure 7-day signed bearer tokens verified on protected API routes.
- **Role-Based Access Control (RBAC)**: Strict role separation between standard `user` and `admin` roles.
- **IDOR Protection**: Database queries strictly bound to `user: req.user._id`, preventing cross-user data tampering.

### 👤 User Capabilities
- **Multi-Payment Management**: Save multiple accounts across 5 supported payment channels.
- **Dynamic Input Isolation**: Clean, focused forms rendering only the inputs required for the selected payment type.
- **Data Masking & Privacy**: Sensitive identifiers are encrypted with AES-256-GCM at rest and masked by default in the UI.
- **1-Touch Clipboard Copy**: Instant copy button `[📋]` next to financial identifiers with animated toast confirmation.
- **Complete CRUD Operations**: Create, read, update, and safely delete payment methods with confirmation dialogs.
- **Profile Hub**: View account verification status, total saved methods, and session controls.

### 💳 Supported Payment Channels
| Payment Type | Stored Fields | Validation Rule |
|---|---|---|
| **Bank** | `bankName`, `branchName`, `accountHolderName`, `accountNumber`, `ifscCode` | 11-char IFSC (`^[A-Z]{4}0[A-Z0-9]{6}$`), 9-18 digit account number |
| **UPI** | `upiId` | Standard UPI VPA format (`^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}$`) |
| **Paytm** | `paytmNumber` | 10-digit Indian mobile format |
| **PayPal** | `paypalEmail` | Valid RFC email address |
| **USDT** | `usdtAddress` | TRC20 (`T...`) or BEP20/ERC20 (`0x...`) crypto address |

> **Strict Field Isolation**: Irrelevant fields are never stored as empty strings or legacy values. When editing a payment and switching its type (e.g. Bank to UPI), obsolete bank fields are automatically purged from the MongoDB document using `$unset`.

### 🛡️ Administrator Capabilities
- **Platform Analytics**: Real-time summary metrics for registered users, total payment methods, and distribution across all 5 categories.
- **Registered Users Directory**: Overview of all users, their assigned roles, and count of configured payment methods.
- **Searchable Payment Directory**: Paginated directory with backend-powered regex search across username, email, bank name, IFSC, UPI ID, Paytm phone, and USDT address.
- **Category Filtering**: Dropdown filter to isolate payments by channel.
- **Deep Record Inspection**: Secure inspection modal detailing complete payment parameters for audit.

---

## 🔑 Quick Evaluation Credentials

The login screen includes **1-Click quick fill buttons** to evaluate each persona immediately:

| Role / Persona | Email | Password | Pre-configured Data |
|---|---|---|---|
| **🛡️ Admin User** | `admin@payvault.com` | `Admin@12345` | Global oversight, metrics, search/filter all payments |
| **💼 Vivek Nair** | `demo@payvault.com` | `User@12345` | Complete portfolio (Bank, UPI, Paytm, PayPal, USDT) |
| **💳 Rahul Sharma** | `rahul@payvault.com` | `User@12345` | ICICI Bank Account & Google Pay UPI ID |
| **🌐 Google Sign-In** | Configured Google account | *Passwordless* | Requires a verified Google ID token and client ID |

---

## 💻 Tech Stack

### Web Frontend
- **Framework**: React 19 (Vite)
- **Routing**: React Router DOM v7
- **Styling**: Pure Vanilla CSS & CSS Variables (No Tailwind CSS, No Next.js)
- **HTTP Client**: Axios with JWT request interceptors and 401 response handling
- **Icons**: Lucide React

### Mobile Frontend (Android)
- **Framework**: React Native CLI (JavaScript / JSX)
- **Navigation**: React Navigation v7 (Native Stack & Bottom Tabs)
- **Authentication**: `@react-native-google-signin/google-signin` (Google Play Services)
- **State & Storage**: React Context + AsyncStorage
- **HTTP Client**: Axios with interceptors & Android emulator host bridge (`10.0.2.2`)
- **Icons & Clipboard**: Lucide React Native, React Native SVG, React Native Clipboard

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security**: bcryptjs (10 rounds), jsonwebtoken (JWT), Helmet, CORS, express-rate-limit, google-auth-library
- **Testing**: Jest & Supertest (27 automated integration tests)

---

## 📁 Project Structure

```
PayVault/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── adminController.js     # Admin metrics, users list, search & filter
│   │   ├── authController.js      # Register, login, getMe, verified Google sign-in
│   │   └── paymentController.js   # Payment CRUD with strict field isolation
│   ├── middleware/
│   │   ├── auth.js                # JWT verification middleware
│   │   ├── errorHandler.js        # Centralized JSON error handler
│   │   └── requireAdmin.js        # Admin RBAC authorization guard
│   ├── models/
│   │   ├── Payment.js             # Strict payment schema with field pruning
│   │   └── User.js                # User schema with bcrypt & toJSON password stripping
│   ├── routes/
│   │   ├── adminRoutes.js         # /api/admin endpoints
│   │   ├── authRoutes.js          # /api/auth endpoints
│   │   └── paymentRoutes.js       # /api/payments endpoints
│   ├── scripts/
│   │   ├── encryptPayments.js     # Plaintext-payment migration script
│   │   └── seed.js                # Database seeding script for admin & demo users
│   ├── tests/
│   │   └── api.test.js            # Automated API integration tests (27 passing tests)
│   ├── utils/
│   │   └── paymentCrypto.js       # AES-256-GCM encryption and blind indexes
│   ├── validators/
│   │   └── paymentValidator.js    # Regex and format validators per payment channel
│   ├── app.js                     # Express app setup, rate-limiting & middleware
│   ├── server.js                  # HTTP server listener
│   ├── .env.example               # Backend environment variables template
│   ├── .gitignore                 # Backend-specific ignore rules
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg            # PayVault browser icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── BottomNav.jsx      # Mobile bottom navigation bar
│   │   │   ├── ConfirmModal.jsx   # Deletion confirmation modal
│   │   │   ├── LoadingSpinner.jsx # Polished loading spinner
│   │   │   ├── Navbar.jsx         # Top navigation bar with user badges
│   │   │   ├── PaymentCard.jsx    # Styled card with masking, copy & actions
│   │   │   ├── PaymentForm.jsx    # Dynamic form with channel-isolated inputs
│   │   │   └── ProtectedRoute.jsx # Authentication & Admin route guards
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Auth state, login/logout, session persistence
│   │   │   └── ToastContext.jsx   # Notification toast provider
│   │   ├── pages/
│   │   │   ├── AddPayment.jsx     # Add payment channel page
│   │   │   ├── AdminDashboard.jsx # Admin metrics & registered users directory
│   │   │   ├── AdminPayments.jsx  # Admin searchable/paginated payment directory
│   │   │   ├── Dashboard.jsx      # User profile & overview
│   │   │   ├── EditPayment.jsx    # Edit payment channel page
│   │   │   ├── Login.jsx          # Login screen with verified Google sign-in & demo pills
│   │   │   ├── Payments.jsx       # Manage Payments portfolio page
│   │   │   └── Register.jsx       # User registration page
│   │   ├── services/
│   │   │   ├── adminService.js    # Admin API calls
│   │   │   ├── api.js             # Axios base instance with interceptors
│   │   │   ├── authService.js     # Auth API calls
│   │   │   └── paymentService.js  # Payment CRUD API calls
│   │   ├── styles/
│   │   │   ├── App.css            # Layout, containers, and responsive rules
│   │   │   ├── components.css     # Cards, pills, badges, modals, and toasts
│   │   │   └── index.css          # Design tokens, reset, and base typography
│   │   ├── App.jsx                # Route declarations & shell layout
│   │   └── main.jsx               # React DOM root entry
│   ├── index.html                 # HTML shell with meta tags & Google fonts
│   ├── vite.config.js             # Vite build configuration
│   ├── .env.example               # Web frontend environment template
│   ├── .gitignore                 # Frontend-specific ignore rules
│   └── package.json
│
├── mobile/                        # React Native CLI Android Application
│   ├── android/                   # Native Android configuration (Gradle, Manifest, Kotlin)
│   ├── src/
│   │   ├── components/            # Header, PaymentCard, PaymentForm, ConfirmModal, GoogleIcon
│   │   ├── context/               # AuthContext (AsyncStorage + GoogleSignin), ToastContext
│   │   ├── navigation/            # AppNavigator, BottomTabNavigator
│   │   ├── screens/               # Login, Register, Dashboard, Payments, Add, Edit, Admin
│   │   ├── services/              # api.js, authService, paymentService, adminService
│   │   ├── styles/                # theme.js tokens & color palette
│   │   └── utils/                 # paymentValidator, formatters
│   ├── App.jsx                    # Mobile root component
│   ├── index.js                   # Mobile entry point
│   ├── package.json               # Mobile dependencies
│   ├── .gitignore                 # Mobile build outputs ignore rules
│   └── README.md                  # Mobile installation & run guide
│
├── Screenshots/
│   ├── image1.png                 # Web Authentication & Google Sign-In
│   ├── image2.png                 # Web Manage Payments Portfolio
│   ├── image3.png                 # Web Dynamic Add / Edit Payment Method
│   ├── image4.png                 # Web User Profile & Security Overview
│   ├── image5.png                 # Web Admin Control Center & Analytics
│   ├── image6.png                 # Mobile Login & Native Google Sign-In (Pixel 3a)
│   └── image7.png                 # Mobile Admin Control Center & Channel Breakdown (Pixel 3a)
│
├── .gitignore                     # Root-level Git ignore file
└── README.md                      # Comprehensive project documentation
```

---

## 🗄️ Payment Data Models

### User Schema (`backend/models/User.js`)
- `username`: String (required, trimmed)
- `email`: String (required, unique, lowercase, trimmed)
- `password`: String (required, hashed via bcrypt pre-save hook)
- `role`: String (`'user'` or `'admin'`, default `'user'`)
- `createdAt` / `updatedAt`: Timestamps
- *Security*: `toJSON` transform automatically strips `password` from all API responses.

### Payment Schema (`backend/models/Payment.js`)
- `user`: ObjectId (ref `'User'`, required, indexed)
- `paymentType`: Enum (`'Bank'`, `'Paytm'`, `'UPI'`, `'PayPal'`, `'USDT'`)
- `bankName`, `branchName`, `accountHolderName`, `accountNumber`, `ifscCode`: Populated only for `'Bank'`
- `paytmNumber`: Populated only for `'Paytm'`
- `upiId`: Populated only for `'UPI'`
- `paypalEmail`: Populated only for `'PayPal'`
- `usdtAddress`: Populated only for `'USDT'`
- *Field Isolation*: Pre-validation hook deletes fields not associated with the active `paymentType`.

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate with email & password; returns JWT |
| `POST` | `/api/auth/google` | Public | Verify a Google ID token and authenticate/auto-register; returns JWT |
| `GET` | `/api/auth/me` | Authenticated | Fetch authenticated user details and payment stats |

### Payment Management (`/api/payments`)
*Requires `Authorization: Bearer <token>`. IDOR checks enforce that users can only access their own records.*
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments` | Authenticated | Add a new payment method (validated per type) |
| `GET` | `/api/payments` | Authenticated | Retrieve all payment methods for the authenticated user |
| `GET` | `/api/payments/:id` | Authenticated | Fetch a specific payment method by ID |
| `PUT` | `/api/payments/:id` | Authenticated | Update a payment method (prunes obsolete fields on type change) |
| `DELETE`| `/api/payments/:id` | Authenticated | Delete a payment method |

### Administrator (`/api/admin`)
*Requires `Authorization: Bearer <token>` and `role: 'admin'`.*
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/users` | Admin | List all registered users with role and payment count |
| `GET` | `/api/admin/stats` | Admin | Summary metrics and payment category breakdown |
| `GET` | `/api/admin/payments` | Admin | Paginated payment directory with search & filter |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/payvault
JWT_SECRET=your_jwt_secret_key_here
PAYMENT_ENCRYPTION_KEY=generate_a_64_character_hex_key
GOOGLE_CLIENT_ID=your_google_oauth_web_client_id
GOOGLE_ANDROID_CLIENT_ID=your_google_oauth_android_client_id
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_web_client_id
```

---

## 🚀 Installation & Running Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017` (or MongoDB Atlas URI)
- Git
- For Android: Android Studio with SDK API 34+ and an emulator (e.g. Pixel 3a or Pixel 8)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/PayVault.git
cd PayVault
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run seed:admin   # Seeds the admin and demo evaluation accounts
npm run dev          # Starts Express server on http://localhost:5000
```

### 4. Web Frontend Setup
```bash
cd ../frontend
npm install
npm run dev          # Starts Vite client on http://localhost:5173
```

Open `http://localhost:5173` in your browser to start using PayVault.

---

## 📱 Mobile Setup & Execution (React Native CLI)

### 📦 Standalone Release APK (Instant Evaluation)
A pre-compiled, production-optimized standalone release APK is generated and included for immediate installation without needing Android Studio, Gradle, or a local Metro server:

- **Location**: `mobile/PayVault-v1.0.0.apk` (or `mobile/android/app/build/outputs/apk/release/app-release.apk`)
- **Direct ADB Install**:
  ```powershell
  adb install -r mobile/PayVault-v1.0.0.apk
  ```
- **Physical Phone Installation**: Copy `PayVault-v1.0.0.apk` to any Android device via USB/Drive and tap to install (enable "Install unknown apps" if prompted).
- **In-App Server Configurator**: When opening the app on a physical phone, tap the **⚙️ Server Host** badge at the bottom of the login screen to point the API URL to your machine's LAN IP (`http://<YOUR_LAN_IP>:5000/api`) or your cloud-deployed backend URL!

---

### 🛠️ Running from Source (Development Mode)

#### 1. Connect Android Port Forwarding
Run ADB reverse commands so the emulator communicates seamlessly with local backend and Metro:
```powershell
$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe reverse tcp:8081 tcp:8081
$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe reverse tcp:5000 tcp:5000
```

#### 2. Start Metro Dev Server
```powershell
cd mobile
npm start
```

#### 3. Launch Android App
```powershell
npm run android
```
*(Or compile directly via Gradle: `cd android; .\gradlew.bat app:installDebug -PreactNativeArchitectures=x86_64`)*

---

## 🧪 Testing

### Backend Automated Test Suite
The backend includes 27 comprehensive integration tests covering authentication, Google OAuth verification, payment CRUD, field isolation, IDOR prevention, and admin controls.

```bash
cd backend
npm test
```

Expected output:
```
PASS tests/api.test.js
  PayVault API Test Suite
    1. Authentication & Authorization (8 tests)
    2. Payment Validation & Creation (7 tests)
    3. Payment Retrieval, Update & Type Changing (3 tests)
    4. IDOR / Authorization Security (4 tests)
    5. Admin Authorization & Features (5 tests)

Test Suites: 1 passed, 1 total
Tests:       27 passed, 27 total
Snapshots:   0 total
```

### Web Frontend Production Build
```bash
cd frontend
npm run build
```

---

## 🔒 Security Architecture

1. **IDOR Prevention**: Document ownership is verified on all read, update, and delete routes (`payment.user.toString() === req.user._id.toString()`). Cross-user access is rejected with HTTP 403.
2. **Strict Field Isolation**: Switching between payment channels purges previous fields at both the application level and MongoDB level (`$unset`), preventing sensitive data leakage.
3. **Sensitive Field Masking**: Financial identifiers (bank account numbers, UPI IDs, Paytm numbers, crypto addresses) are masked by default (`••••••••6735`) in the UI, requiring explicit user action to reveal.
4. **Password Protection**: Bcrypt with 10 salt rounds. Plaintext passwords are never stored. Schema-level transforms exclude passwords from all query returns.
5. **Payment Encryption**: Payment identifiers are encrypted with AES-256-GCM using `PAYMENT_ENCRYPTION_KEY`; blind indexes support exact admin searches without storing searchable plaintext.
6. **HTTP Headers & Rate Limiting**: Powered by `helmet` to set secure HTTP headers (X-Frame-Options, CSP, etc.) and `express-rate-limit` to prevent brute-force attacks on authentication routes.

---

## 📄 License
MIT License. Open source and free to use for personal and commercial projects.