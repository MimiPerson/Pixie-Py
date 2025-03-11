/* eslint-disable @typescript-eslint/no-explicit-any */
// Fetch 7TV Emotes
export async function fetchEmotes() {
  const sevenTvResponse = await fetch(
    `https://7tv.io/v3/users/twitch/106904180`
  );
  const sevenTvData = await sevenTvResponse.json();
  const sevenTvEmotes = sevenTvData.emote_set.emotes;

  // Create a map for emotes
  const emoteMap = new Map();

  // Add 7TV Emotes
  sevenTvEmotes.forEach((emote: any) => {
    emoteMap.set(emote.name, "https:" + emote.data.host.url + "/1x.webp");
  });

  return emoteMap;
}

// Parse message with emotes from both 7TV and Twitch
export async function parseMessageWithEmotes(
  message: string,
  twitchEmotes: string
) {
  const emoteMap = await fetchEmotes();
  // Process Twitch emotes first (using ranges)
  let parsedMessage = message;

  if (twitchEmotes) {
    twitchEmotes.split("/").forEach((emote) => {
      const [emoteId, range] = emote.split(":");
      const ranges = range.split(",");

      ranges.forEach((emoteRange) => {
        const [start, end] = emoteRange.split("-");
        const emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/1.0`;

        // Replace the emote part of the message with an img tag
        parsedMessage = parsedMessage.replace(
          message.slice(parseInt(start, 10), parseInt(end, 10) + 1),
          `<img src="${emoteUrl}" alt="${emoteId}" class="emote" />`
        );
      });
    });
  }

  // Now process 7TV emotes
  parsedMessage = parsedMessage
    .split(" ")
    .map((word) => {
      if (emoteMap.has(word)) {
        const emoteUrl = emoteMap.get(word);
        return `<img src="${emoteUrl}" alt="${word}" class="emote" />`;
      }
      return word;
    })
    .join(" ");

  return parsedMessage;
}
