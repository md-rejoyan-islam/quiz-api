import request from "supertest";
import app from "../../src/app/app";
import prisma from "../../src/config/prisma";

beforeAll(async () => {
  // Clean up the database before running tests
  await prisma.$transaction([
    prisma.quiz.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  // Disconnect Prisma after all tests
  await prisma.$disconnect();
});

describe("Authentication API Integration Tests", () => {
  let accessToken: string;
  let refreshToken: string;
  let id: string;

  // user data
  const userData = {
    email: "testuser@example.com",
    password: "Password123!",
    fullName: "Test User",
  };

  describe("POST /api/v1/auth/register", () => {
    // it("should return an error for missing of required fields.", async () => {
    //   const userInvalidData = {
    //     email: "testuser@example.com",
    //     password: "Password123!",
    //     full_name: "Test User",
    //   };
    //   const response = await request(app)
    //     .post("/api/v1/auth/register")
    //     .send(userInvalidData)
    //     .expect(400); // Expecting a bad request due to invalid field

    //   // Checking that the error response contains the invalid field error
    //   expect(response.body.message).toBe("Validation error");
    //   expect(response.body.errors).toContainEqual(
    //     expect.objectContaining({
    //       path: expect.stringMatching(/body/),
    //       message: expect.stringMatching(/required/),
    //     })
    //   );
    // });

    it("should register a new user successfully", async () => {
      const userData = {
        email: "testuser@example.com",
        password: "Password123!",
        fullName: "Test User",
      };
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(201); // Expecting a successful creation (201)

      // Checking the success message and validating the returned user data
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.data.email).toBe(userData.email);
    });

    it("should not register a user with an existing email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(409);

      expect(response.body.message).toMatch(/already registered/);
    });

    it("should return validation error for missing required fields", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "invaliduser@example.com" })
        .expect(400);

      expect(response.body.message).toContain("Validation error");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login a user successfully", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: userData.email, password: userData.password })
        .expect(200);

      expect(response.body.message).toBe("Login successful");
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();

      accessToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;
      id = response.body.data.user.id;
    });

    it("should not login with invalid credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: userData.email, password: "WrongPassword!" })
        .expect(401);

      expect(response.body.message).toBe("Invalid email or password");
    });

    it("should return validation error for missing required fields", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: userData.email })
        .expect(400);

      expect(response.body.message).toContain("Validation error");
    });
  });

  describe("POST /api/v1/auth/refresh-token", () => {
    it("should refresh access token using a valid refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({ refreshToken, id })
        .expect(200);

      expect(response.body.message).toBe("Token refreshed successfully");
      expect(response.body.data.accessToken).toBeDefined();
      accessToken = response.body.data.accessToken;
    });

    it("should return error for an invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({ refreshToken: "invalid_refresh_token", id })
        .expect(401);

      expect(response.body.message).toBe("Invalid refresh token");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return the user details when authenticated", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe("User details fetched successfully");
      expect(response.body.data.email).toBe(userData.email);
    });

    it("should return error if no token is provided", async () => {
      const response = await request(app).get("/api/v1/auth/me").expect(401);

      expect(response.body.message).toBe(
        "Please login to access this resource"
      );
    });

    it("should return error for an invalid token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid_token")
        .expect(401);

      expect(response.body.message).toMatch(/Invalid/);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should log out the user successfully", async () => {
      const response = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe("Logout successful");
    });

    it("should return error if the user is not logged in", async () => {
      const response = await request(app)
        .post("/api/v1/auth/logout")
        .expect(401);

      expect(response.body.message).toBe(
        "Please login to access this resource"
      );
    });
  });
});
