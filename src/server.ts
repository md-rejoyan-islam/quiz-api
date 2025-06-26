import dotenv from "dotenv";
import app from "./app/app";
import secret from "./app/secret";

// Load environment variables
dotenv.config();

const startServer = async (): Promise<void> => {
  try {
    // Start server
    app.listen(secret.port, () => {
      console.log(`Server is running on http://localhost:${secret.port}`);
    });
  } catch (error) {
    console.error("Unable to start the server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
