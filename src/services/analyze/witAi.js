const parseWitResponse = (witResponse) => {
  const reminderDate =
    witResponse?.entities["wit$datetime:datetime"]?.[0]?.from?.value ||
    witResponse?.entities["wit$datetime:datetime"]?.[0]?.value;

  const reminderEntities = witResponse.entities["wit$reminder:reminder"];
  const reminder = reminderEntities
    ?.map((entity) => entity.value)
    .join(" and ");

  if (!reminderDate || !reminder) {
    return undefined;
  }

  return [reminderDate, reminder];
};

const getDateAndReminderWitAi = async (message) => {
  const BASE_URL = "https://api.wit.ai/";
  const ENDPOINT = "message?v=20250108&";
  const ENCODED_QUERY = `q=${encodeURIComponent(message)}`;
  const FULL_URL = BASE_URL + ENDPOINT + ENCODED_QUERY;

  const witResponse = await fetch(FULL_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.WIT_API_KEY}`,
    },
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error:", error);
    });
  const [date, reminder] = parseWitResponse(witResponse);
  return [date, reminder];
};

module.exports = getDateAndReminderWitAi;
