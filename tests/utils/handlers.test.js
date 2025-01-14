const { validateMessageBody } = require("../../src/utils/handlers");

describe("validateMessageBody", () => {
  it("should return an error if the message field is missing", async () => {
    const mockBody = {};
    const response = validateMessageBody(mockBody);
    expect(response).toBe("Bad Request: Missing message object");
  });

  it("should return an error if the text field is missing", async () => {
    const mockBody = { message: { chat: { id: 1 } } };
    const response = validateMessageBody(mockBody);
    expect(response).toBe("Bad Request: Missing text field");
  });

  it("should return an error if the chat object is missing", async () => {
    const mockBody = { message: { text: "Test" } };
    const response = validateMessageBody(mockBody);
    expect(response).toBe("Bad Request: Missing chat object");
  });

  it("should return an error if the chat id is missing", async () => {
    const mockBody = { message: { text: "Test", chat: {} } };
    const response = validateMessageBody(mockBody);
    expect(response).toBe("Bad Request: Missing chat id");
  });

  it("should return null if the body is correct", async () => {
    const mockBody = { message: { text: "Test", chat: { id: 1 } } };
    const response = validateMessageBody(mockBody);
    expect(response).toBe(null);
  });
});

describe("parseDate", () => {
  it("", async () => {});
});

describe("reminderCallback", () => {
  it("", async () => {});
});

describe("scheduleReminder", () => {
  it("", async () => {});
});

describe("processReminderMessage", () => {
  it("", async () => {});
});
