# Quiz App API

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Stars](https://img.shields.io/github/stars/md-rejoyan-islam/quiz-api?style=social)

A robust and scalable backend API for a full-featured Quiz application. Built with Node.js, Express, and Prisma, this API provides a comprehensive solution for managing users, authentication, quizzes, questions, and attempts.

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Server](#running-the-server)
- [⚙️ Environment Variables](#️-environment-variables)
- [📚 API Documentation](#-api-documentation)
- [📁 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [📧 Contact](#-contact)

## ✨ Features

- **JWT Authentication**: Secure user authentication and authorization using JSON Web Tokens (Access & Refresh tokens).
- **Role-Based Access Control**: Differentiated permissions for `USER` and `ADMIN` roles.
- **Full User Management**: User registration, profile updates, and admin-level management (ban/unban).
- **Complete Quiz Lifecycle**: Create, read, update, delete, and publish quizzes and questions.
- **Interactive Quiz Attempts**: Users can attempt quizzes, with results tracked for score, correct/wrong answers, and time taken.
- **Robust Validation**: Comprehensive, schema-based request validation using Zod.
- **Detailed Error Handling**: Standardized and descriptive error responses for better client-side handling.
- **ORM with Prisma**: Modern and type-safe database access with Prisma ORM.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **API Documentation**: OpenAPI 3.0 (Swagger)
- **Database**: SQLite (easily switchable via Prisma)
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JSON Web Token (JWT)
- **Password Hashing**: Bcrypt
- **Email**: Nodemailer
- **Development**: TypeScript, Nodemon, ts-node

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/md-rejoyan-islam/quiz-api.git
    cd your-repo-name
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and fill it with the required variables. See the [Environment Variables](#️-environment-variables) section for details.

4.  **Initialize Prisma:**
    Generate the Prisma Client based on your schema.

    ```sh
    npx prisma generate
    ```

5.  **Run database migrations:**
    This will set up your database schema (e.g., create the SQLite file and tables).
    ```sh
    npx prisma migrate dev --name init
    ```

### Running the Server

- **Development Mode:**
  The server will automatically restart on file changes.
  ```sh
  npm run dev
  ```
- **Production Mode:**
  Build the project and run the compiled JavaScript.
  `sh
npm run build
npm start
`
  The API will be available at `http://localhost:5000/api/v1`.

## ⚙️ Environment Variables

Create a `.env` file in the project root and add the following variables.

```env
# Server Configuration
PORT=5000
NODE_ENV=development # development or production

# Database URL (for SQLite)
# Example: "file:./dev.db"
DATABASE_URL="<your-prisma-database-url>"

# JWT Configuration
JWT_ACCESS_SECRET="<your-strong-access-token-secret>"
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_ACCESS_EXPIRES_IN =30000 # 5 min
JWT_REFRESH_SECRET="<your-strong-refresh-token-secret>"
JWT_REFRESH_EXPIRES_IN= 86400 # 24 hour


# CORS Configuration
CORS_WHITELIST=http://localhost:3000,http://localhost:5000 # Adjust as needed for your frontend

# Client URL (for email links, etc.)
CLIENT_URL=http://localhost:3000

# Nodemailer Configuration (for password resets, etc.)
EMAIL_HOST="smtp.mailtrap.io"
EMAIL_PORT=2525
EMAIL_USERNAME="<your-smtp-username>"
EMAIL_PASSWORD="<your-smtp-password>"
EMAIL_FROM="noreply@quizapp.com"
```

## 📚 API Documentation

This project is fully documented using the OpenAPI 3.0 standard. You can find the complete specification in the `openapi.yaml` file. Use tools like [Swagger Editor](https://editor.swagger.io/) or [Swagger UI](https://swagger.io/tools/swagger-ui/) to view and interact with the documentation.

### Authentication

| HTTP Method | Endpoint                      | Description                                  | Access Control |
| :---------- | :---------------------------- | :------------------------------------------- | :------------- |
| `POST`      | `/auth/register`              | Register a new user                          | Public         |
| `POST`      | `/auth/login`                 | Log in to get access and refresh tokens      | Public         |
| `POST`      | `/auth/refresh-token`         | Get a new access token using a refresh token | Public         |
| `POST`      | `/auth/logout`                | Log out the current user                     | Authenticated  |
| `POST`      | `/auth/forgot-password`       | Send a password reset email                  | Public         |
| `PATCH`     | `/auth/reset-password/:token` | Reset password using a token                 | Public         |
| `PATCH`     | `/auth/change-password`       | Change the logged-in user's password         | Authenticated  |
| `GET`       | `/auth/me`                    | Get the current user's profile               | Authenticated  |

### User Management

| HTTP Method | Endpoint           | Description                     | Access Control |
| :---------- | :----------------- | :------------------------------ | :------------- |
| `GET`       | `/users`           | Get all users                   | Admin          |
| `GET`       | `/users/:id`       | Get a specific user by their ID | Admin, Owner   |
| `PATCH`     | `/users/:id`       | Update a user's profile         | Admin, Owner   |
| `DELETE`    | `/users/:id`       | Delete a user                   | Admin, Owner   |
| `POST`      | `/users/:id/ban`   | Ban a user                      | Admin          |
| `POST`      | `/users/:id/unban` | Unban a user                    | Admin          |

### Quiz Management

| HTTP Method | Endpoint               | Description                            | Access Control |
| :---------- | :--------------------- | :------------------------------------- | :------------- |
| `POST`      | `/quizzes`             | Create a new quiz set                  | Admin          |
| `PATCH`     | `/quizzes/:id`         | Update an existing quiz set            | Admin          |
| `DELETE`    | `/quizzes/:id`         | Delete a quiz set                      | Admin          |
| `PATCH`     | `/quizzes/:id/publish` | Publish a quiz that is in draft status | Admin          |

### Question Management

| HTTP Method | Endpoint                          | Description                          | Access Control |
| :---------- | :-------------------------------- | :----------------------------------- | :------------- |
| `POST`      | `/quizzes/:quizId/questions`      | Create a new question for a quiz     | Admin          |
| `POST`      | `/quizzes/:quizId/questions/bulk` | Bulk create new questions for a quiz | Admin          |
| `PATCH`     | `/questions/:id`                  | Update a question by its ID          | Admin          |
| `DELETE`    | `/questions/:id`                  | Delete a question by its ID          | Admin          |

### Quiz Interaction

| HTTP Method | Endpoint               | Description                         | Access Control |
| :---------- | :--------------------- | :---------------------------------- | :------------- |
| `GET`       | `/quizzes`             | Get a list of all published quizzes | Public         |
| `GET`       | `/quizzes/:id`         | Get a single quiz set by its ID     | Public         |
| `POST`      | `/quizzes/:id/attempt` | Submit an attempt for a quiz        | Authenticated  |
| `POST`      | `/quizzes/:id/rate`    | Give a rating to a quiz set         | Authenticated  |

### OpenAPI Documentation

You can access the API documentation at `http://localhost:5000/api-docs` after starting the server. This documentation provides detailed information about all available endpoints, request/response formats, and example usage.

## 📁 Project Structure

```
.
├── prisma/
│   └── schema.prisma       # Prisma database schema
├── src/
│   ├── controllers/        # Request handlers
│   ├── middlewares/        # Express middlewares (auth, validation)
│   ├── routes/             # API route definitions
│   ├── schemas/            # Zod schema definitions
│   ├── utils/              # Utility functions (email, responses)
│   ├── validators/         # Zod validation schemas
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Server entry point
├── .env.example            # Example environment variables
├── package.json
└── tsconfig.json
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Md Rejoyan Islam - [@linkedin](https://www.linkedin.com/in/md-rejoyan-islam) - rejoyanislam0014@gmail.com

Project Link: [https://github.com/md-rejoyan-islam/quiz-api.git](https://github.com/md-rejoyan-islam/quiz-api.git)
