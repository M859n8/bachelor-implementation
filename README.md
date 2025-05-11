# Digital Assessment of Human Motor Functions: Focusing on Visual Perception and Perceptual Motor Coordination

This project is a full-stack application for conducting and analyzing digital cognitive and motor function tests. It includes a frontend built with React Native + Expo and a backend powered by Node.js + Express with a MySQL database.

## Project Structure

```
/frontend   → React Native + Expo app (tests, UI, interactions)
/backend    → Node.js + Express server (API, database logic)
```

## Frontend

* Built with **React Native** using **Expo** for easier development and cross-platform support.
* Located in the `/frontend` directory.

Detailed documentation for the frontend is available in `/frontend/README.md`.

## Backend

* RESTful API using **Node.js** and **Express**.
* Handles authentication, result storage, and evaluation.
* Connected to a **MySQL** database.
* Located in the `/backend` directory.

Backend documentation is available in `/backend/README.md`.

---

## Setup Instructions

### Backend Setup

1. **Install dependencies**

```bash
cd backend
npm install
```

2. **Start the server**

```bash
node index.js
```

This will start the server on the port defined in your `.env` file.

3. **Initialize the database**

```bash
node init-db.js
```

This will create the required tables if they don't already exist.



### Frontend Setup

1. **Install dependencies**

```bash
cd frontend
npm install
```

2. **Run the app using Expo**

```bash
npx expo start
```

This will launch the Expo DevTools interface, where you can run the app on an emulator or physical device.

## Tests Implemented

* Bells Cancellation
* Block Design
* Complex Figure
* Line Tracking
* Transferring Pennies
* Visual Organization