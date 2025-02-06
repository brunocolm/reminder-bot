export interface InlineKeyboard {
  text: string;
  callback_data: string;
}

const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}`;

export const sendTelegramMessage = async (chatId: number, message: string, buttons?: InlineKeyboard[]): Promise<string> => {
  console.log("Sending telegram MSG to: ", chatId)

  const response = await fetch(BASE_URL + "/sendMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      reply_markup: buttons ? {
        inline_keyboard: [
          buttons
        ]
      } : undefined
    }),
  }).then((response) => response.json());

  console.log(response);
  return message;
};

export const createTelegramInterfaceButtons = (numberOfButtons: number): InlineKeyboard[] => {
  let inlineKeyboard: InlineKeyboard[] = []
  for (let index = 0; index < numberOfButtons; index++) {
    inlineKeyboard[index] = {
      text: (index + 1).toString(),
      callback_data: (index + 1).toString(),
    }
  }
  return inlineKeyboard
}

export const removeTelegramInterfaceButtonsFromMessage = async (chatId: number, messageId: number): Promise<string> => {
  console.log("removeTelegramInterfaceButtonsFromMessage")
  const url = BASE_URL + `/editMessageReplyMarkup`;

  const body = {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: JSON.stringify({ inline_keyboard: [[]] })
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  console.log("Removing telegram buttons")
  return res.json()
};