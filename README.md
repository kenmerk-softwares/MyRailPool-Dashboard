# MyRailPool Dashboard

MyRailPool Dashboard is a real-time administration panel and command center designed to manage scheduling, bookings, transit routes, driver allocations, and payments for the MyRailPool transit and shuttle network.

---

## Overview

### Purpose
The dashboard serves as the central administrative hub for transit operators and managers. It simplifies workflows, automates booking validations, optimizes route assignments, and provides financial reporting tools.

### Problem Solved
Managing a shuttle pooling network involves complex operations: matching passenger bookings to scheduled trips, managing capacity, processing payments, sending updates, and assigning drivers. This dashboard consolidates these workflows into a single responsive panel.

### Key Objectives
*   **Operational Control**: Create routes, schedule trips, assign drivers and vehicles, and monitor active pools.
*   **Financial Management**: Track Stripe transactions, generate revenue reports, and automate refunds.
*   **Secure Access**: Enforce role-based access control (RBAC) to ensure users have appropriate permissions.
*   **Real-Time Alerts**: Trigger automated WhatsApp updates via Twilio to keep passengers and drivers synchronized.

---

## Features

*   **Booking Management**: Create bookings via forms, track status (Active, Completed, Cancelled), and allocate seats.
*   **Trip Scheduler**: Schedule trips for transit routes. Automatically complete expired trips using Cloud Scheduler.
*   **Route Management**: Map transit corridors, define pick-up/drop-off points, and manage passenger route requests.
*   **Driver & Vehicle Profiles**: Onboard drivers with license validation and manage vehicle capacity limits.
*   **Financial Analytics**: View real-time revenue dashboards, transaction charts (via Recharts), and export statements.
*   **Dynamic Permission Control**: Manage custom designations, departments, and granular route permissions for admin users.
*   **Communication Gateway**: Trigger Twilio WhatsApp alerts and manage application notifications.

---

## Technology Stack

### Frontend
*   **Core**: React 19 (Single Page Application)
*   **State Management**: Redux Toolkit & React-Redux
*   **Routing**: React Router DOM v7
*   **Styling**: Tailwind CSS & Custom CSS
*   **Visualization**: Recharts
*   **Utilities**: Lucide React (Icons), SheetJS (Data Export)

### Backend & Database
*   **Runtime**: Cloud Functions for Firebase (Node.js 24)
*   **Database**: Google Cloud Firestore (NoSQL)
*   **File Storage**: Firebase Storage
*   **Hosting**: Firebase Hosting

### Third-Party Services
*   **Payments**: Stripe API
*   **Messaging**: Twilio API (WhatsApp Business)
*   **Maps**: Google Maps Places API

---

## Project Structure

The project is structured as a monorepo containing both the React frontend and the Firebase backend.

```
/ (Root Directory)
├── firebase.json                       # Firebase services configuration
├── .firebaserc                         # Firebase Project ID configuration
├── tailwind.config.js                  # Tailwind CSS styling config
├── .env                                # Frontend environment configurations
├── package.json                        # Frontend dependencies & scripts
├── public/                             # Static templates & assets
├── functions/                          # Firebase Backend Codebase
│   ├── index.js                        # Firebase entry point
│   ├── package.json                    # Backend dependencies & configuration
│   ├── .env                            # Backend Stripe, Twilio, and bypass configuration
│   └── src/                            # Functions source folder
│       ├── index.js                    # Core functions exports
│       ├── modules/                    # Business modules (Admin, Route, Vehicle, Driver, Payment)
│       └── shared/                     # Common helpers, validation wrappers, and logging utils
└── src/                                # Frontend React Codebase
    ├── index.js                        # App bootstrap entry point
    ├── App.js                          # Main routing controller
    ├── App.css / index.css             # App styling configuration
    ├── app/                            # Redux store and route definitions
    │   └── routes.js                   # Navigation configuration matching views to roles
    ├── components/                     # Shared UI layout components
    ├── data/                           # Mock datasets and static variables
    ├── shared/                         # Custom Hooks, Firebase initializers, Toast providers
    └── modules/                        # Feature-specific pages & hooks
        ├── auth/                       # Login and credential validation
        ├── bookings/                   # Bookings management views
        ├── dashboard/                  # Interactive analytics dashboard
        ├── drivers/                    # Driver onboarding and listing panel
        ├── payment/                    # Payments lists and revenue dashboards
        ├── reports/                    # Reports compiler (Excel, CSV)
        ├── routes/                     # Operational route planner
        ├── trips/                      # Trip schedules and pool monitoring
        ├── user/                       # Admin user management and access control
        └── vehicles/                   # Vehicle fleet listings
```

---

## Installation & Setup

### Prerequisites
*   **Node.js**: v20 or later
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
    Create a `.env` file in the root directory and another inside the `functions` directory. Refer to the **Configuration** section below for details.

5.  **Running Locally**
    *   **Start Backend Emulators**: Authenticate with Firebase (`firebase login`), then launch the functions emulator:
        ```bash
        firebase emulators:start --only functions
        ```
    *   **Start React Frontend**: In a separate terminal tab in the root folder, run:
        ```bash
        npm start
        ```
        Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

6.  **Building for Production**
    To generate an optimized production build:
    ```bash
    npm run build
    ```

---

## Configuration

### Frontend Environment Variables
Set these inside the root `.env` file:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `REACT_APP_PLACES_WEB_API` | Google Maps API key for Place Autocomplete and routing | `AIzaSyDd3W4SQ3U...` |

### Backend Environment Variables
Set these inside the backend `functions/.env` file:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID for SMS/WhatsApp API | `AC8d8261ef7bd37...` |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | `6df57e032e91958...` |
| `TWILIO_API_KEY` | Twilio API Key for services authentications | `SKa80f5427d4b51...` |
| `TWILIO_API_SECRET` | Twilio API Secret for services authentications | `PQZyn7ambkvbK6x...` |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp sender number | `whatsapp:+15559591897` |
| `TWILIO_VALIDATE_WEBHOOK` | Enable webhook payload validation | `false` / `true` |
| `TEST_BYPASS_AUTH` | Bypass auth checks in sandbox environment | `true` |
| `TWILIO_BOOKING_TEMPLATE_SID` | Twilio Template ID for Booking confirmations | `HXefed6c8d914ee...` |
| `TWILIO_REMINDER_TEMPLATE_SID` | Twilio Template ID for upcoming Trip reminders | `HXd17d2d9f7ef40...` |
| `TWILIO_CANCELLED_TEMPLATE_SID` | Twilio Template ID for Trip cancellation notices | `HXa8501d68b4f21...` |
| `TWILIO_ADMIN_BOOKING_TEMPLATE_SID` | Twilio Template ID for booking alerts to admins | `HXe874a324fde40...` |
| `TWILIO_ADMIN_ROUTEREQ_TEMPLATE_SID` | Twilio Template ID for route requests alerts to admins | `HX18b674f352873...` |
| `TWILIO_ROUTEREQ_APPROVED` | Twilio Template ID for route request approval notices | `HX82ce67fe9d834...` |
| `ADMIN_WHATSAPP_NUMBER` | WhatsApp recipient for admin notifications | `+919778726418` |
| `STRIPE_SECRET_KEY` | Stripe Secret Key for processing payments | `sk_live_51TNuSi...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret | `whsec_5V3FctE...` |

---

## Usage

### Logging In
Access the login page. Admin permissions are synchronized with Firebase Auth and Firestore. Enter credentials matching a document in the `admin-users` collection.

### Scheduling a Trip
1.  Navigate to **Routes** and ensure the route exists, or create a new one.
2.  Go to **Trips** -> **Add Trip**.
3.  Select a Route, an active Driver, and an active Vehicle.
4.  Specify the departure date, time, and base fare, then click **Create**.

### Cancelling a Booking
1.  Go to **Bookings** and open the target booking details.
2.  Click **Cancel Booking**.
3.  This triggers the `cancelBooking` cloud function, which processes the refund via Stripe and notifies the passenger and driver via WhatsApp.

---



## API Documentation

### HTTPS Callable Functions
These endpoints are invoked via the Firebase Web SDK Client.

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

### Webhooks & Scheduled Jobs

| Endpoint / Job Name | Trigger Type | Description | Auth Method |
| :--- | :--- | :--- | :--- |
| `stripeWebhook` | HTTP Webhook (`/stripeWebhook`) | Processes Stripe events like `payment_intent.succeeded` to finalize bookings. | Stripe Webhook Signature Verification |
| `autoCompleteExpiredTrips` | Scheduled (Every 30 mins) | Automatically completes active trips that have passed their estimated duration. | Cron System Triggered |
| `cleanupExpiredBookings` | Scheduled (Every 15 mins) | Cancels bookings where payment was not completed within the checkout window. | Cron System Triggered |
| `tripReminderScheduler` | Scheduled (Every hour) | Dispatches Twilio WhatsApp reminders for trips starting within 3 hours. | Cron System Triggered |

---

## Database Schema (Firestore)

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

## Authentication & Route Protection

Authentication is powered by **Firebase Authentication**.

1.  **State Sync**: The application listens to authentication states via the auth listener [auth.listner.js](src/modules/auth/auth.listner.js).
2.  **Profile Synchronization**: Upon login, a real-time listener monitors the user's document in the `admin-users` collection.
3.  **Permissions Extraction**: The user's profile maps to a `permissionId`. The application retrieves the permitted routes (e.g. `/bookings`, `/trips`) from the `permissions` collection.
4.  **Route Protection**: In the main routing controller [App.js](src/App.js), pages are conditionally rendered. If an unauthorized user attempts to access a protected route, they are automatically redirected to the `/no-access` screen.

---

## Security Practices

*   **Input Validation**: All backend cloud functions validate incoming payloads using Joi schemas.
*   **Stripe Webhook Signature Verification**: The `stripeWebhook` parses raw request buffers to verify signatures via Stripe's SDK, preventing request spoofing.
*   **Authentication Wrappers**: Backend callable functions use a wrapper [callable.wrapper.js](functions/src/shared/utils/callable.wrapper.js) to reject requests that do not include a valid user authentication token.
*   **Secrets Management**: API credentials (Stripe and Twilio keys) are managed securely via Firebase environment parameters and kept out of version control.

---


## Contributing

1.  Fork the repository and create your feature branch:
    ```bash
    git checkout -b feature/AmazingFeature
    ```
2.  Add changes and run ESLint validator to prevent pipeline errors:
    ```bash
    npm run lint
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


## License

Copyright (c) 2026 MyrailPool Ltd, Abhilash Augustine. All rights reserved.

---

## Author

Created and maintained by **MyrailPool Ltd**
*   **Abhilash Augustine** - *Founder & Director*
