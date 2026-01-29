export interface ChatSuggestion {
  label: string;
  actionType: string;
  payload?: any;
}

export async function sendMessageToApi(
  message: string,
  guestId?: string | null
): Promise<{ reply: string; suggestions?: ChatSuggestion[] }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, guestId }),
  });

  const data = await res.json();

  if (!data || typeof data.reply !== "string") {
    throw new Error("BAD_RESPONSE");
  }

  return {
    reply: data.reply,
    suggestions: data.suggestions || [],
  };
}
