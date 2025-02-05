export interface InlineKeyboard {
  text: string;
  callback_data: string;
}

export const sendTelegramMessage = async (chatId: number, message: string, buttons?: InlineKeyboard[]): Promise<string> => {
  console.log("Sending telegram MSG to: ", chatId)
  const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}`;

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
      text: (index+1).toString(),
      callback_data: `btn_${(index+1).toString()}`
    }
  }
  return inlineKeyboard
}
