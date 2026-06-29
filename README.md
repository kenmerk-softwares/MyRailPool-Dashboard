# MyRailPool Dashboard

MyRailPool Dashboard is a premium, real-time command center and administration panel designed to manage the scheduling, bookings, transit routes, driver allocations, and payments for the MyRailPool transit pooling and shuttle service network. 

---

## Overview

### Purpose
The **MyRailPool Dashboard** serves as the central administrative hub for transit operators and managers. It streamlines administrative workflows, automates booking validations, optimizes route assignments, and provides financial reporting tools.

### Problem Solved
Managing a high-frequency rail and shuttle pooling network involves complex operations: matching user bookings to scheduled trips, managing vehicle capacity, processing payments, communicating delays/updates, and ensuring drivers are assigned properly. This dashboard consolidates these scattered workflows into a single responsive panel.

### Key Objectives
*   **Operational Control**: Provide administrators with tools to create routes, schedule trips, assign drivers/vehicles, and oversee active pools.
*   **Financial Integrity**: Audit stripe transactions, generate custom monthly/yearly reports, and automate customer refunds.
*   **Secure Multi-Tenant Access**: Enforce role-based access control (RBAC) to ensure employees, operators, and developers have scoped permissions.
*   **Real-time Alerts**: Leverage automated WhatsApp triggers and dynamic app popups to keep passengers and drivers synchronized.

---

## Features

*   **💳 Booking Management**: Form-based booking creation, status tracking (Active, Completed, Cancelled), and seat allocation.
*   **📅 Trip Scheduler**: Create scheduled trip occurrences for established transit routes. Automatically mark expired trips as completed via Cloud Scheduler.
*   **📍 Route Management**: Plot new transit corridors, define pick-up/drop-off points, and handle passenger route requests.
*   **🚗 Driver & Vehicle Profiles**: Comprehensive onboarding forms including driver license validation and vehicle capacity limits.
*   **📊 Dynamic Financial Analytics**: Real-time revenue analytics, transaction distribution charts (using Recharts), and custom Excel statement generation.
*   **🔐 Dynamic Permission Control**: Grant granular route permissions to admin users. Custom designations and departments can be managed directly from the settings panel.
*   **💬 Communication Gateway**: Trigger template-based WhatsApp alerts via Twilio and manage popups or modal screens.

---

## Technology Stack

### Frontend
*   **Core**: React 19.2.4 (Single Page Application)
*   **State Management**: Redux Toolkit & React-Redux for global authentication, UI, and caching states.
*   **Routing**: React Router DOM v7 for secure, role-shielded routing.
*   **Styling**: Tailwind CSS & Vanilla CSS custom design systems.
*   **Visualization**: Recharts for dynamic payment & trip analytics.
*   **Utilities**: Lucide React (Icons), SheetJS/xlsx (Data Export).

### Backend
*   **Runtime**: Cloud Functions for Firebase (v2, Node.js 24)
*   **Framework**: Firebase Admin SDK

### Database & Storage
*   **Primary Database**: Google Cloud Firestore (NoSQL, real-time sync)
*   **File Storage**: Firebase Storage (Secure document uploads, vehicle assets, driver licenses)

### Cloud/Hosting
*   **Application Hosting**: Firebase Hosting
*   **Compute**: Firebase Cloud Functions (Region: `asia-south1`)

### Third-party APIs & Services
*   **Payment Gateway**: Stripe API (Stripe Webhooks & Node SDK)
*   **Messaging**: Twilio API (WhatsApp Business API templates)
*   **Maps & Routing**: Google Maps Places API

---

## Project Structure

The project is structured as a monorepo consisting of the React frontend application and the Firebase backend functions codebase.

```
/ (Root Directory)
├── firebase.json                       # Firebase services configuration (Hosting, Functions, Emulators)
├── .firebaserc                         # Maps project alias to Firebase Project ID (myrailpool-4150a)
├── tailwind.config.js                  # Tailwind utility styling config
├── .env                                # Frontend environment configurations
├── package.json                        # Frontend dependencies & start/build/deploy scripts
├── public/                             # Static templates & assets
├── functions/                          # Firebase Backend Codebase
│   ├── index.js                        # Firebase entry point directing to src
│   ├── package.json                    # Node modules & engines for backend deployment
│   ├── .env                            # Backend Stripe, Twilio, and bypass configuration parameters
│   └── src/                            # Functions source folder
│       ├── index.js                    # Core index exporting modules (Callable, Webhook, Scheduled)
│       ├── modules/                    # Business modules (Admin, Route, Vehicle, Driver, Payment)
│       └── shared/                     # Common helpers, validation wrappers, and logging utils
└── src/                                # Frontend React Codebase
    ├── index.js                        # App bootstrapping element
    ├── App.js                          # Main routing controller with reactive auth sync
    ├── App.css / index.css             # Main styling configurations
    ├── app/                            # Redux store and route definitions
    │   └── routes.js                   # Navigation config matching views to roles & permissions
    ├── components/                     # Shared UI layout (Layout sidebar, buttons, table wrappers)
    ├── data/                           # Mock datasets and static variables
    ├── shared/                         # Custom Hooks, Firebase initializers, Toast providers
    └── modules/                        # Feature-specific modules containing pages & hooks
        ├── auth/                       # Login and credential validation module
        ├── bookings/                   # Bookings management views (Add, edit, list)
        ├── dashboard/                  # Interactive main statistics charts
        ├── drivers/                    # Driver onboarding and listing panel
        ├── payment/                    # Payments lists and revenue dashboards
        ├── reports/                    # Reports compiler (Excel, CSV)
        ├── routes/                     # Operational route planner pages
        ├── trips/                      # Trip schedules and pool monitoring
        ├── user/                       # Admin user user-list and access controller
        └── vehicles/                   # Vehicle fleets listings
```

---

## Installation

### Prerequisites
*   **Node.js**: v20 or later (v24 recommended for functions runtime consistency)
*   **Firebase CLI**: Installed globally (`npm install -g firebase-tools`)
*   **Git**

### Step-by-Step Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/kenmerk-softwares/MyRailPool-Dashboard.git
    cd MyRailPool-Dashboard
    ```

2.  **Install Frontend Dependencies**
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies**
    ```bash
    cd functions
    npm install
    cd ..
    ```

4.  **Configure Environment Variables**
    Create a `.env` file in the root directory and a `.env` file inside the `functions` directory. Refer to the **Configuration** section below for the required fields.

5.  **Running Locally**
    *   **Start Backend Emulators**: Ensure you are authenticated with Firebase (`firebase login`), then launch functions emulator:
        ```bash
        firebase emulators:start --only functions
        ```
    *   **Start React Frontend Server**: In a separate terminal tab in the root folder, run:
        ```bash
        npm start
        ```
        Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

6.  **Building for Production**
    Generate a highly optimized, minified production build:
    ```bash
    npm run build
    ```

---

## Configuration

### Frontend Environment Variables
Set these inside the root [.env](file:///Users/gospel/Documents/MyRailPool-Dashboard/.env) file:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `REACT_APP_PLACES_WEB_API` | Google Maps API key used for Place autocomplete and routing | `AIzaSyDd3W4SQ3U...` |

### Backend Environment Variables
Set these inside the backend [functions/.env](file:///Users/gospel/Documents/MyRailPool-Dashboard/functions/.env) file:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `TEST_TWILIO_ACCOUNT_SID` | Twilio Account Identification String for SMS/WhatsApp API | `ACa954b87f61ce735e...` |
| `TEST_TWILIO_AUTH_TOKEN` | Twilio Account Secret authorization token | `22f19d543e6ed6cca...` |
| `TEST_TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp Sandbox/Approved Business phone sender ID | `whatsapp:+14155238886` |
| `TEST_TWILIO_VALIDATE_WEBHOOK` | Toggles webhook payload validation for security | `false` / `true` |
| `TEST_BYPASS_AUTH` | Bypasses callable authorization limits in sandbox environment | `true` |
| `TEST_TWILIO_BOOKING_TEMPLATE_SID` | Twilio Content Template ID for Booking confirmations | `HX5303221ad9099300...` |
| `TEST_TWILIO_REMINDER_TEMPLATE_SID` | Twilio Content Template ID for upcoming Trip reminders | `HX6c22bf0dc3c52b...` |
| `TEST_TWILIO_CANCELLED_TEMPLATE_SID` | Twilio Content Template ID for Trip cancellation notices | `HX9587f49a0d8a044e...` |
| `TEST_TWILIO_ADMIN_BOOKING_TEMPLATE_SID` | Twilio Content Template ID for booking alerts sent to admins | `HX378b724f76ce2929...` |
| `TEST_ADMIN_WHATSAPP_NUMBER` | WhatsApp recipient phone number for admin notifications | `+919778726418` |
| `STRIPE_SECRET_KEY` | Secret Key used to process payment intents and checkouts in Stripe | `sk_test_51TNuSz...` |
| `STRIPE_WEBHOOK_SECRET` | Signing secret used to authenticate Stripe Webhook payloads | `whsec_5V3FctE...` |

---

## Usage

### Logging In
Access the login page. Admin account permissions are synced with Firebase Auth and Firestore. Enter credentials configured in your `admin-users` collection.

### Scheduling a Trip
1.  Navigate to **Routes** and ensure the route exists, or create one.
2.  Go to **Trips** -> **Add Trip**.
3.  Select a Route, pick a Driver and Vehicle (only active resources are selectable).
4.  Specify the departure date, departure time, and base fare, then click **Create**.

### Cancelling a Booking
1.  Go to **Bookings**.
2.  Select a booking from the list and open the **View** details drawer/page.
3.  Click **Cancel Booking**. This invokes the `cancelBooking` cloud function, issuing refunds via Stripe and updating the driver and passenger via WhatsApp notifications.

---

## User Roles

Administrators are granted one of three functional roles, which controls navigation route shielding and access:

| Role | Permissions | Responsibilities |
| :--- | :--- | :--- |
| **Super Admin** | Full access to all modules, read/write on settings, permissions configurator, user role editor. | Managing backend constants, defining system access parameters, adding internal admin users. |
| **Admin** | Read/write access on Bookings, Trips, Drivers, Vehicles, and Route Requests. Read-only on admin logs. | Conducting day-to-day operations, scheduling fleets, approving route proposals, resolving bookings. |
| **Viewer** | Read-only access to all dashboards, lists, payment histories, reports, and logs. No write/update actions. | Overseeing operational health, auditing financial metrics, exporting reports. |

---

## API Documentation

Backend services are triggered via Firebase Cloud Functions v2.

### Callable Functions (HTTPS Callable SDK)
Invoked using the Firebase Web SDK Client.

| Function Endpoint | Description | Payload Schema | Auth Required |
| :--- | :--- | :--- | :--- |
| `addAdminUser` | Registers a new console administrator in Firestore & Auth. | `{ email, password, displayName, role, designation, department }` | Yes |
| `changePassword` | Updates credentials for the logged-in administrator. | `{ oldPassword, newPassword }` | Yes |
| `editPermissions` | Modifies active route permissions mapping for a role ID. | `{ permissionId, permissions: [] }` | Yes |
| `updateEmployeeSettings` | Edits job designations/departments parameters. | `{ id, name, type: 'department'\|'designation' }` | Yes |
| `addRoute` | Submits a new rail or shuttle route. | `{ startLocation, endLocation, dropPoints: [], baseFare }` | Yes |
| `routeRequest` | Submits a customer-driven request for a new pooling corridor. | `{ userId, startLocation, endLocation, description }` | Yes |
| `processRouteRequest` | Approves, rejects, or edits customer route proposals. | `{ requestId, status: 'approved'\|'rejected' }` | Yes |
| `addDriver` | Onboards a new shuttle/vehicle operator. | `{ name, email, phone, licenseNumber, vehicleId }` | Yes |
| `updatePaymentDriver` | Modifies a driver's payout accounts or details. | `{ driverId, bankDetails: {} }` | Yes |
| `updateTripDriverApp` | Invoked by driver devices to update active trip steps. | `{ tripId, status: 'ongoing'\|'completed' }` | Yes |
| `addVehicle` | Registers a transport vehicle into the fleet database. | `{ make, model, licensePlate, capacity }` | Yes |
| `addTrip` | Schedules a new trip for public booking. | `{ routeId, driverId, vehicleId, departureTime, fare }` | Yes |
| `tripBooking` | books seats for a passenger on a scheduled pool. | `{ tripId, userId, seatCount }` | Yes |
| `createUser` | Registers a new client/passenger. | `{ email, name, phone }` | Yes |
| `whatsappNotifications` | Manually triggers confirmation or cancellation WhatsApp. | `{ type: 'booking_confirmation'\|'booking_cancelled', bookingId }` | Yes |

### Webhooks & Scheduled Functions

| Endpoint / Job Name | Trigger Type | Description | Auth Method |
| :--- | :--- | :--- | :--- |
| `stripeWebhook` | HTTP Webhook (`/stripeWebhook`) | Captures Stripe events like `payment_intent.succeeded` to complete booking records. | Stripe Webhook Signature Verification |
| `autoCompleteExpiredTrips` | Scheduled (Every 30 minutes) | Iterates through ongoing/scheduled trips and flags them completed if past arrival thresholds. | Cron System Triggered |
| `cleanupExpiredBookings` | Scheduled (Every 15 minutes) | Cancels bookings where payment intent remained unpaid past reservation timeouts. | Cron System Triggered |
| `tripReminderScheduler` | Scheduled (Every hour) | Identifies upcoming trips starting within 3 hours and dispatches Twilio reminders. | Cron System Triggered |

---

## Database Schema (Firestore)

Firestore stores data in JSON-like documents grouped into collections:

| Collection Name | Document Purpose | Key Attributes |
| :--- | :--- | :--- |
| `admin-users` | Profiles of system dashboard operators. | `email`, `role`, `permissionId`, `department`, `designation` |
| `permissions` | Permissions maps linked to roles. | `permissions` (Array of route pathways like `/trips`) |
| `departments` | Categorization list for admin users. | `departmentName`, `createdAt` |
| `designations` | Job hierarchy levels for admin users. | `designationName`, `createdAt` |
| `routes` | Mapped geographic corridors. | `startLocation`, `endLocation`, `dropPoints`, `baseFare` |
| `trips` | Scheduled pooling trips. | `routeId`, `driverId`, `vehicleId`, `departureTime`, `status`, `availableSeats` |
| `drivers` | Enrolled pool drivers. | `name`, `email`, `phone`, `licenseNumber`, `status` |
| `vehicles` | Fleet records. | `make`, `model`, `licensePlate`, `capacity`, `status` |
| `users` | Customer accounts. | `name`, `email`, `phone`, `createdAt`, `status` |
| `users/{userId}/passengers` | Family or sub-passengers grouped under a user. | `name`, `relation`, `age` |
| `bookings` | Customer seat reservations. | `tripId`, `userId`, `seatCount`, `amount`, `paymentStatus`, `status` |
| `finance` | Stripe financial logs. | `amount`, `currency`, `paymentMethod`, `bookingId`, `timestamp`, `userId` |
| `route_request` | Customer-submitted route request documents. | `userId`, `startLocation`, `endLocation`, `status`, `requestCount` |
| `admin_notification` | Broadcast messages catalog. | `title`, `body`, `targetRole`, `createdAt` |

---

## Authentication & Authorization

Authentication is built on **Firebase Authentication**.
1.  **State Sync**: The main application listens to authorization states via [auth.listner.js](file:///Users/gospel/Documents/MyRailPool-Dashboard/src/modules/auth/auth.listner.js).
2.  **Profile Synchronization**: Upon login, the listener attaches a real-time `onSnapshot` listener to the user's document in the `admin-users` collection.
3.  **Permissions Extraction**: The user's profile exposes a `permissionId`. The listener resolves this ID in the `permissions` collection to fetch allowable routes (e.g. `/bookings`, `/trips`).
4.  **Route Protection**: In [App.js](file:///Users/gospel/Documents/MyRailPool-Dashboard/src/App.js), navigation elements and React Router `<Route>` nodes are conditionally rendered. If an unprivileged user attempts to navigate to a blocked route, they are dynamically redirected to the `/no-access` component.

---

## Deployment

### Host Frontend
Deploy built static bundle files straight to Firebase Hosting:
```bash
firebase deploy --only hosting
```

### Deploy Functions
Deploy Cloud Functions (requires `npm run lint` validation):
```bash
firebase deploy --only functions
```

---

## Security Practices

*   **Joi Validation**: All backend Cloud Callable functions check payloads using Joi schemas before executing business logic.
*   **Stripe Authentication**: The `stripeWebhook` parses raw request buffers to verify Stripe signatures (`stripe.webhooks.constructEvent`), preventing spoofing.
*   **Context Authentication**: Backend callable functions use the `callableWrapper` in [callable.wrapper.js](file:///Users/gospel/Documents/MyRailPool-Dashboard/functions/src/shared/utils/callable.wrapper.js) to reject requests without a valid `req.auth` token.
*   **Environment Secret Safeguards**: Stripe keys and Twilio credentials are kept out of Git repositories and handled via Firebase Functions configuration parameters.

---

## Screenshots (Placeholders)

Add visual guides below to help developers navigate the dashboard interfaces:

#### Main Dashboard Overview
![Dashboard Analytics Mockup](https://via.placeholder.com/1200x600/1e293b/ffffff?text=MyRailPool+Dashboard+Overview)

#### Booking Control Panel
![Booking Drawer Mockup](https://via.placeholder.com/1200x600/1e293b/ffffff?text=Booking+List+and+Creation+Drawer)

---

## Future Improvements

*   **📍 Live Shuttle Tracking**: Integration of Google Maps directions API to render active driver coordinates on a dashboard map.
*   **💳 Automated Driver Settlements**: Implement Stripe Connect to automate payouts to drivers based on completed rides.
*   **🤖 AI Route Generation**: Analyze aggregate `route_request` coordinates to suggest route creations automatically.

---

## Contributing

1.  Fork the repository and create your feature branch:
    ```bash
    git checkout -b feature/AmazingFeature
    ```
2.  Add changes and run ESLint validator to prevent pipeline errors:
    ```bash
    npm run lint # inside functions directory
    ```
3.  Commit your modifications:
    ```bash
    git commit -m 'Add some AmazingFeature'
    ```
4.  Push changes:
    ```bash
    git push origin feature/AmazingFeature
    ```
5.  Create a Pull Request.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Author

Created and maintained by the **Kenmerk Softwares Team**. For support or queries, contact developer support.
