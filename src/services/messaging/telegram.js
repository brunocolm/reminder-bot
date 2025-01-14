const sendTelegramMessage = (chatId, message) => {
  const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}`;
  const response = fetch(BASE_URL + "/sendMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  }).then((response) => response.json());

  console.log(response);
  return message;
};

module.exports = sendTelegramMessage;
