# Faculty Slot and Schedule Management System

A modern, web-based platform designed to streamline and automate the process of managing academic schedules and faculty time slots within an educational institution.

## Overview

The Faculty Slot and Schedule Management System addresses the complexities of academic scheduling by offering a centralized, real-time solution. It replaces manual spreadsheet methods with a robust cloud-native application, minimizing administrative overhead and reducing scheduling conflicts.

## key Features

### For Faculty

- **Real-time Slot Booking**: View available slots and book them instantly.
- **My Bookings**: Track and manage your booked slots.
- **Secure Access**: Role-based access ensures only authorized faculty can book slots.

### For Administrators

- **Schedule Generation**: Automatically generate daily schedules from predefined templates.
- **Slot Management**: Create, delete, or modify individual slots.
- **User Management**: Manage authorized users and grant access.
- **Real-time Dashboard**: View all slot statuses and user activities instantly.

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/)
- **Backend & Database**: [Firebase Authentication](https://firebase.google.com/docs/auth), [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A Firebase project with Auth and Firestore enabled.

### Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd Faculty-Slot-Management
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Configure Firebase**
    - Create a `.env.local` file in the root directory.
    - Add your Firebase configuration keys:
      ```env
      NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
      NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
      ```

4.  **Run the development server**

    ```bash
    npm run dev
    ```

5.  **Open the app**
    Navigate to `http://localhost:3000` in your browser.

## Deployment

This project is optimized for [Firebase App Hosting](https://firebase.google.com/docs/hosting).

```bash
npm run build
firebase deploy
```

## Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Commit your changes (`git commit -m 'Add your feature'`).
4.  Push to the branch (`git push origin feature/your-feature`).
5.  Open a Pull Request.

## License

[MIT License](LICENSE)
