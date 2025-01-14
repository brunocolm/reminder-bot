const request = require("supertest"); 
const app = require("../../src/index"); 
const {
  processReminderMessage,
  validateMessageBody,
} = require("../../src/utils/handlers");
jest.resetModules();

const successMsg = "success";
const errorMsg = "error";
jest.mock("../../src/utils/handlers.js", () => ({
  processReminderMessage: jest.fn((chatId, text) => successMsg),
  validateMessageBody: jest.fn((body) => {
    if (!body.message) {
      return errorMsg;
    }
    return null;
  }),
}));

describe("POST /", () => {
  it("should respond with validateMessageBody error message when called", async () => {
    const mockBody = {};

    const response = await request(app)
      .post("/")
      .send(mockBody)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.text).toBe(errorMsg);
    expect(validateMessageBody).toHaveBeenCalledWith(mockBody);
    expect(processReminderMessage).not.toHaveBeenCalled();
  });

  it("should respond with success message when processReminderMessage is called", async () => {
    const mockBody = { message: { text: "Test", chat: { id: 1 } } };

    const response = await request(app)
      .post("/")
      .send(mockBody)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.text).toBe(successMsg);
    expect(validateMessageBody).toHaveBeenCalledWith(mockBody);
    expect(processReminderMessage).toHaveBeenCalledWith(1, "Test");
  });
});
