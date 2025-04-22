# Healthcare Portal Web Application

A comprehensive healthcare portal that allows users to manage their medical records, appointments, documents, and pain assessments.

## Features

- **User Authentication**: Secure login/registration system
- **Appointment Management**: Schedule and manage medical appointments
- **Document Management**: Upload and organize medical documents
- **Pain Assessments**: Track and manage pain levels and assessment history

## Tech Stack

- **Frontend**: React.js with Material UI
- **Backend**: Node.js and Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local storage with multer

## Project Structure

```
/my-web-app
├── client/               # React frontend
│   ├── public/           # Static assets
│   │   └── App.js        # Main application component
│   └── package.json      # Frontend dependencies
│
├── server/               # Node.js backend
│   ├── middleware/       # Express middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── uploads/          # Uploaded files storage
│   ├── app.js            # Express application
│   └── package.json      # Backend dependencies
│
└── README.md             # Project documentation
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Setup

1. Clone the repository
   ```
   git clone <repository-url>
   cd my-web-app
   ```

2. Install server dependencies
   ```
   cd server
   npm install
   ```

3. Install client dependencies
   ```
   cd ../client
   npm install
   ```

4. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5002
   MONGODB_URI=mongodb://localhost:27017/healthcare-portal
   JWT_SECRET=your_jwt_secret
   ```

## Running the Application

1. Start the server
   ```
   cd server
   node app.js
   ```

2. In a separate terminal, start the client
   ```
   cd client
   npm start
   ```

3. Access the application at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify JWT token

### Appointments
- `GET /api/appointments` - Get all appointments for the logged-in user
- `GET /api/appointments/:id` - Get a specific appointment
- `POST /api/appointments` - Create a new appointment
- `PUT /api/appointments/:id` - Update an appointment
- `DELETE /api/appointments/:id` - Delete an appointment

### Documents
- `GET /api/documents` - Get all documents for the logged-in user
- `GET /api/documents/:id` - Get a specific document
- `GET /api/documents/download/:id` - Download a document
- `POST /api/documents` - Upload a new document
- `PUT /api/documents/:id` - Update document details
- `DELETE /api/documents/:id` - Delete a document

### Assessments
- `POST /api/assessment` - Create initial assessment
- `POST /api/assessment/pain-assessment` - Update pain assessment
- `POST /api/assessment/treatment-history` - Save treatment history
- `GET /api/assessment/user` - Get assessments for authenticated user
- `GET /api/assessment/:id` - Get assessment data
- `PUT /api/assessment/:id/link-user` - Link assessment to user account

## License

This project is licensed under the MIT License. 