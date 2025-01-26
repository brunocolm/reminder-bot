export const sendTelegramMessage = async (chatId: number, message: string): Promise<string> => {
  console.log("Sending telegram MSG to: ",chatId)
  const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}`;
  const response = await fetch(BASE_URL + "/sendMessage", {
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


