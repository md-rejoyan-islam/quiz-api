import request from "supertest";
import app from "../../src/app/app"; // Import your Express app
import prisma from "../../src/config/prisma"; // Import Prisma client (this will be mocked)
import { QuizLabel, QuizStatus } from "../../src/utils/types";

// Mock quiz ID
let testQuizId: string;
let testQuestionId: string;

// user
const user = {
  id: "",
  accessToken: "",
};
// admin
const admin = {
  id: "",
  accessToken: "",
};

// role based data
const adminData = {
  email: "admin@gmail.com",
  password: "12345678@",
  fullName: "Admin User",
  role: "admin",
};

const userData = {
  email: "user@gmail.com",
  password: "12345678@",
  fullName: "Normal User",
  role: "user",
};

// Before running tests
beforeAll(async () => {
  await prisma.$transaction([
    prisma.quiz.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // user register
  await request(app).post("/api/v1/auth/register").send(userData);
  // admin register
  await request(app).post("/api/v1/auth/register").send(adminData);

  // user login
  const userResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: userData.email, password: userData.password });
  user.id = userResponse.body.data.id;
  user.accessToken = userResponse.body.data.tokens.accessToken;

  // admin login
  const adminResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: adminData.email, password: adminData.password });
  admin.id = adminResponse.body.data.id;
  admin.accessToken = adminResponse.body.data.tokens.accessToken;
});

// After all tests, clean up the  database
afterAll(async () => {
  await prisma.$disconnect();
});

describe("Quiz  Integration for Admin", () => {
  describe("GET /api/v1/admin/quizzes", () => {
    it("should return a list of quizzes for admin", async () => {
      const res = await request(app)
        .get("/api/v1/admin/quizzes")
        .set("Authorization", `Bearer ${admin.accessToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.message).toBe("Quizzes fetched successfully");
    });
    it("should return an error if user is not authenticated", async () => {
      const res = await request(app).get("/api/v1/admin/quizzes");
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please login to access this resource");
    });

    it("should return an error if user is not an admin", async () => {
      const res = await request(app)
        .get("/api/v1/admin/quizzes")
        .set("Authorization", `Bearer ${user.accessToken}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe(
        "You do not have permission to access this resource"
      );
    });
  });

  describe("POST /api/v1/admin/quizzes", () => {
    it("should create a new quiz", async () => {
      const quizData = {
        title: "New Quiz for Testing",
        description: "This is a test quiz",
        status: QuizStatus.PUBLISHED,
        label: QuizLabel.MEDIUM,
      };

      const res = await request(app)
        .post("/api/v1/admin/quizzes")
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .send(quizData);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Quiz created successfully");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.title).toBe(quizData.title);

      testQuizId = res.body.data.id; // Save quiz ID for later tests
    });
    it("should return an error if user is not authenticated", async () => {
      const res = await request(app).get("/api/v1/admin/quizzes");
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please login to access this resource");
    });

    it("should return an error if user is not an admin", async () => {
      const res = await request(app)
        .get("/api/v1/admin/quizzes")
        .set("Authorization", `Bearer ${user.accessToken}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe(
        "You do not have permission to access this resource"
      );
    });
  });

  describe("PATCH /api/v1/admin/quizzes/:id", () => {
    it("should update an existing quiz", async () => {
      const updatedData = {
        title: "Updated Quiz Title",
        description: "Updated quiz description",
      };

      const res = await request(app)
        .patch(`/api/v1/admin/quizzes/${testQuizId}`)
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .send(updatedData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Quiz updated successfully");
      expect(res.body.data.title).toBe(updatedData.title);
      expect(res.body.data.description).toBe(updatedData.description);
    });
    it("should return an error if user is not authenticated", async () => {
      const res = await request(app).get("/api/v1/admin/quizzes");
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please login to access this resource");
    });

    it("should return an error if user is not an admin", async () => {
      const res = await request(app)
        .get("/api/v1/admin/quizzes")
        .set("Authorization", `Bearer ${user.accessToken}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe(
        "You do not have permission to access this resource"
      );
    });
  });

  describe("POST /api/v1/admin/quizzes/:quizId/questions", () => {
    it("should add a question to a quiz", async () => {
      const questionData = {
        question: "What is the capital of France?",
        options: ["Paris", "Berlin", "Madrid", "Rome"],
        correctAnswer: "Paris",
      };

      const res = await request(app)
        .post(`/api/v1/admin/quizzes/${testQuizId}/questions`)
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .send(questionData);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Question added successfully");
      expect(res.body.data).toHaveProperty("id");

      testQuestionId = res.body.data.id; // Save question ID for future use
    });
    it("should return an error if user is not authenticated", async () => {
      const res = await request(app).get("/api/v1/admin/quizzes");
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please login to access this resource");
    });

    it("should return an error if user is not an admin", async () => {
      const res = await request(app)
        .get("/api/v1/admin/quizzes")
        .set("Authorization", `Bearer ${user.accessToken}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe(
        "You do not have permission to access this resource"
      );
    });
  });
  // describe("POST /api/v1/admin/quizzes/:quizId/questions/bulk", () => {
  //   it("should add bulk questions to a quiz", async () => {
  //     const questionData = {
  //       questions: [
  //         {
  //           question: "What is the capital of France?",
  //           options: ["Paris", "Berlin", "Madrid", "Rome"],
  //           correctAnswer: "Paris",
  //         },
  //         {
  //           question: "What is the capital of Germany?",
  //           options: ["Paris", "Berlin", "Madrid", "Rome"],
  //           correctAnswer: "Berlin",
  //         },
  //       ],
  //     };

  //     const res = await request(app)
  //       .post(`/api/v1/admin/quizzes/${testQuizId}/questions/bulk`)
  //       .set("Authorization", `Bearer ${admin.accessToken}`)
  //       .send(questionData);

  //     expect(res.statusCode).toBe(201);
  //     expect(res.body.message).toBe("Questions added successfully");
  //     expect(res.body.data).toBeInstanceOf(Array);
  //     expect(res.body.data).toHaveLength(2);
  //   });
  //   it("should return an error if user is not authenticated", async () => {
  //     const res = await request(app).get("/api/v1/admin/quizzes");
  //     expect(res.statusCode).toBe(401);
  //     expect(res.body.message).toBe("Please login to access this resource");
  //   });

  //   it("should return an error if user is not an admin", async () => {
  //     const res = await request(app)
  //       .get("/api/v1/admin/quizzes")
  //       .set("Authorization", `Bearer ${user.accessToken}`);
  //     expect(res.statusCode).toBe(403);
  //     expect(res.body.message).toBe(
  //       "You do not have permission to access this resource"
  //     );
  //   });
  // });

  describe("PATCH /api/v1/admin/quizzes/questions/:questionId", () => {
    it("should edit a question", async () => {
      const questionData = {
        question: "What is the capital of France?",
        options: ["Paris", "Berlin", "Madrid", "Rome"],
        correctAnswer: "Paris",
      };

      const res = await request(app)
        .post(`/api/v1/admin/quizzes/${testQuizId}/questions`)
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .send(questionData);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Question added successfully");
      expect(res.body.data).toHaveProperty("id");

      testQuestionId = res.body.data.id; // Save question ID for future use
    });
    it("should return an error if user is not authenticated", async () => {
      const res = await request(app).get("/api/v1/admin/quizzes");
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please login to access this resource");
    });

    it("should return an error if user is not an admin", async () => {
      const res = await request(app)
        .get("/api/v1/admin/quizzes")
        .set("Authorization", `Bearer ${user.accessToken}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe(
        "You do not have permission to access this resource"
      );
    });
  });

  describe("DELETE /api/v1/admin/quizzes/questions/:questionId", () => {
    it("should delete a question", async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/quizzes/questions/${testQuestionId}`)
        .set("Authorization", `Bearer ${admin.accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Question deleted successfully");
    });
    it("should return an error if user is not authenticated", async () => {
      const res = await request(app).get("/api/v1/admin/quizzes");
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please login to access this resource");
    });

    it("should return an error if user is not an admin", async () => {
      const res = await request(app)
        .get("/api/v1/admin/quizzes")
        .set("Authorization", `Bearer ${user.accessToken}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe(
        "You do not have permission to access this resource"
      );
    });

    it("should return an error if question not found", async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/quizzes/questions/invalid_id`)
        .set("Authorization", `Bearer ${admin.accessToken}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not/);
    });
  });

  describe("DELETE /api/v1/admin/quizzes/:id", () => {
    it("should delete a quiz", async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/quizzes/${testQuizId}`)
        .set("Authorization", `Bearer ${admin.accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Quiz deleted successfully");
    });
    it("should return an error if user is not authenticated", async () => {
      const res = await request(app).get("/api/v1/admin/quizzes");
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please login to access this resource");
    });

    it("should return an error if user is not an admin", async () => {
      const res = await request(app)
        .get("/api/v1/admin/quizzes")
        .set("Authorization", `Bearer ${user.accessToken}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe(
        "You do not have permission to access this resource"
      );
    });
  });
});

describe("Quiz Integration for user", () => {
  beforeAll(async () => {
    const response = await request(app)
      .post("/api/v1/admin/quizzes")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({
        title: "New Quiz for Testing",
        description: "This is a test quiz",
        status: QuizStatus.PUBLISHED,
        label: QuizLabel.MEDIUM,
      });
    // add a question to the quiz
    const questionData = {
      question: "What is the capital of France?",
      options: ["Paris", "Berlin", "Madrid", "Rome"],
      correctAnswer: "Paris",
    };

    const questionResponse = await request(app)
      .post(`/api/v1/admin/quizzes/${response.body.data.id}/questions`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send(questionData);

    testQuizId = response.body.data.id;
    testQuestionId = questionResponse.body.data.id;
  });

  it("should return a list of quizzes", async () => {
    const res = await request(app).get("/api/v1/quizzes");
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.message).toBe("Quizzes fetched successfully");
  });

  describe("Quiz data for logged in user", () => {
    // Get user attempts route

    describe("POST /api/v1/quizzes/:quizId/attempt", () => {
      it("should return an error if user is not authenticated", async () => {
        const res = await request(app).get("/api/v1/quizzes/attempts");
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Please login to access this resource");
      });

      it("should return a list of user attempts", async () => {
        const res = await request(app)
          .get("/api/v1/quizzes/attempts")
          .set("Authorization", `Bearer ${user.accessToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.message).toBe("Attempts fetched successfully");
      });
    });

    describe("GET /api/v1/quizzes/:quizId", () => {
      it("should return an error if user is not authenticated", async () => {
        const res = await request(app).get("/api/v1/quizzes/invalid_id");
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Please login to access this resource");
      });

      it("should return a quiz by ID", async () => {
        const res = await request(app)
          .get(`/api/v1/quizzes/${testQuizId}`)
          .set("Authorization", `Bearer ${user.accessToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.message).toBe("Quiz fetched successfully");
      });
    });

    describe("GET /api/v1/quizzes/:quizId/leaderboard", () => {
      it("should return an error if user is not authenticated", async () => {
        const res = await request(app).get("/api/v1/quizzes/leaderboard");
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Please login to access this resource");
      });

      it("should return a quiz leaderboard by ID", async () => {
        const res = await request(app)
          .get(`/api/v1/quizzes/${testQuizId}/leaderboard`)
          .set("Authorization", `Bearer ${user.accessToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.message).toBe("Leaderboard fetched successfully");
      });
    });

    describe("POST /api/v1/quizzes/:quizId/attempt", () => {
      // error if quiz not found
      it("should return an error if quiz not found", async () => {
        const res = await request(app)
          .post("/api/v1/quizzes/invalid_id/attempt")
          .set("Authorization", `Bearer ${user.accessToken}`)
          .send({
            answers: [
              {
                questionId: testQuestionId,
                answer: "Paris",
              },
            ],
          });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/not/);
      });

      it("should return an error if user is not authenticated", async () => {
        const res = await request(app).get("/api/v1/quizzes/attempts");
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Please login to access this resource");
      });

      it("should submit a quiz attempt", async () => {
        const attemptData = {
          answers: [
            {
              questionId: testQuestionId,
              answer: "Paris",
            },
          ],
        };

        const res = await request(app)
          .post(`/api/v1/quizzes/${testQuizId}/attempt`)
          .set("Authorization", `Bearer ${user.accessToken}`)
          .send(attemptData);
        console.log(res.body);

        expect(res.statusCode).toBe(201);
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.message).toBe("Attempt submitted successfully");
      });
    });

    describe("GET /api/v1/quizzes/:quizId/attempts", () => {
      it("should return an error if user is not authenticated", async () => {
        const res = await request(app).get(
          "/api/v1/quizzes/invalid_id/attempts"
        );
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Please login to access this resource");
      });

      it("should return a list of quiz attempts by ID", async () => {
        const res = await request(app)
          .get(`/api/v1/quizzes/${testQuizId}/attempts`)
          .set("Authorization", `Bearer ${user.accessToken}`);
        expect(res.statusCode).toBe(200);

        expect(res.body.data.data).toBeInstanceOf(Array);
        expect(res.body.message).toBe("Attempts fetched successfully");
      });
    });
  });
});
