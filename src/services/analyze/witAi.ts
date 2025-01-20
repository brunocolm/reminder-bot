interface WitResponse {
  entities: {
    "wit$datetime:datetime"?: WitDatetimeEntity[];
    "wit$reminder:reminder"?: WitReminderEntity[];
  };
  intents: WitIntent[];
  text: string;
  traits: Record<string, unknown>;
}

interface WitDatetimeEntity {
  body: string;
  confidence: number;
  end: number;
  entities: Record<string, unknown>;
  grain?: string; // Added grain at the root level for single values
  id: string;
  name: string;
  role: string;
  start: number;
  type: "interval" | "value";
  value?: string; // Added for "value" type datetime
  from?: WitDatetimeValue; // Only for "interval" type
  to?: WitDatetimeValue; // Only for "interval" type
  values: WitDatetimeValueOrInterval[];
}

type WitDatetimeValueOrInterval =
  | WitDatetimeValue
  | WitDatetimeInterval;

interface WitDatetimeValue {
  grain: string;
  value: string;
  type: "value";
}

interface WitDatetimeInterval {
  from: WitDatetimeValue;
  to: WitDatetimeValue;
  type: "interval";
}

interface WitReminderEntity {
  body: string;
  confidence: number;
  end: number;
  entities: Record<string, unknown>;
  id: string;
  name: string;
  role: string;
  start: number;
  suggested?: boolean;
  type: "value";
  value: string;
}

interface WitIntent {
  confidence: number;
  id: string;
  name: string;
}


const parseWitResponse = (witResponse: WitResponse): [string, string] => {
  const reminderDate =
    witResponse?.entities["wit$datetime:datetime"]?.[0]?.from?.value ||
    witResponse?.entities["wit$datetime:datetime"]?.[0]?.value;

  const reminderEntities = witResponse.entities["wit$reminder:reminder"];
  const reminder = reminderEntities
    ?.map((entity) => entity.value)
    .join(" and ");

  if (!reminderDate || !reminder) {
    console.error("Couldn't parse wit.ai response")
    return ["",""]
  }

  return [reminderDate, reminder];
};

export const getDateAndReminderWitAi = async (message: string): Promise<[string, string]> => {
  try {
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
  } catch (e: any) {
    throw new Error(e)
  }
};

