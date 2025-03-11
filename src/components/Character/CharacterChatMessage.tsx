import React, { useEffect, useState } from "react";
import { TwitchEvent } from "../../types/TwitchEvent";

interface CharacterChatMessageProps {
  message: TwitchEvent;
}

const CharacterChatMessage: React.FC<CharacterChatMessageProps> = ({
  message,
}) => {
  const [parsedMessage, setParsedMessage] = useState<React.ReactNode[]>([]);
  const MAX_MESSAGE_LENGTH = 35; // Adjust the max length as needed

  useEffect(() => {
    const parseMessageWithEmotes = async (
      message: string,
      twitchEmotes: string
    ) => {
      const emoteMap = await fetchEmotes();
      let elements: React.ReactNode[] = [];
      let totalLength = 0;
      let isCutOff = false;

      if (twitchEmotes) {
        const emoteRanges: { [key: string]: string[] } = {};
        twitchEmotes.split("/").forEach((emote) => {
          const [emoteId, range] = emote.split(":");
          emoteRanges[emoteId] = range.split(",");
        });

        let lastIndex = 0;
        Object.keys(emoteRanges).forEach((emoteId) => {
          emoteRanges[emoteId].forEach((emoteRange) => {
            const [start, end] = emoteRange.split("-").map(Number);
            if (lastIndex < start) {
              const textSegment = message.slice(lastIndex, start);
              if (totalLength + textSegment.length > MAX_MESSAGE_LENGTH) {
                elements.push(
                  textSegment.slice(0, MAX_MESSAGE_LENGTH - totalLength)
                );
                isCutOff = true;
                return;
              }
              elements.push(textSegment);
              totalLength += textSegment.length;
            }
            const emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/1.0`;
            elements.push(
              <img
                style={{ display: "inline-block", verticalAlign: "middle" }}
                src={emoteUrl}
                alt={emoteId}
                className="emote"
                key={`${emoteId}-${start}`}
              />
            );
            totalLength += 1; // Count emote as 1 character
            lastIndex = end + 1;
          });
        });
        if (!isCutOff && lastIndex < message.length) {
          const remainingText = message.slice(lastIndex);
          if (totalLength + remainingText.length > MAX_MESSAGE_LENGTH) {
            elements.push(
              remainingText.slice(0, MAX_MESSAGE_LENGTH - totalLength)
            );
          } else {
            elements.push(remainingText);
          }
        }
      } else {
        if (message.length > MAX_MESSAGE_LENGTH) {
          elements = [message.slice(0, MAX_MESSAGE_LENGTH)];
        } else {
          elements = [message];
        }
      }

      elements = elements
        .map((element) => {
          if (typeof element === "string") {
            return element.split(/(\s+)/).map((word, index) => {
              if (emoteMap.has(word.trim())) {
                const emoteUrl = emoteMap.get(word.trim());
                return (
                  <img
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                    src={emoteUrl}
                    alt={word.trim()}
                    className="emote"
                    key={`${word.trim()}-${index}`}
                  />
                );
              }
              return <span key={`${word}-${index}`}>{word}</span>;
            });
          }
          return element;
        })
        .flat();

      return elements;
    };

    parseMessageWithEmotes(message.message, message.msg.emotes || "").then(
      setParsedMessage
    );
  }, [message]);

  return (
    <p
      style={{
        display: "flex",
        justifyContent: "center",
        justifyItems: "center",
        alignItems: "center",
        textAlign: "center",
        fontSize: "35px",
        color: "white",
        textShadow: "2px 2px black",
        textSizeAdjust: "auto",
        gap: "5px",
      }}
    >
      {parsedMessage}
    </p>
  );
};

export default CharacterChatMessage;

/* eslint-disable @typescript-eslint/no-explicit-any */
// Fetch 7TV Emotes
async function fetchEmotes() {
  const sevenTvResponse = await fetch(
    `https://7tv.io/v3/users/twitch/106904180`
  );
  const sevenTvData = await sevenTvResponse.json();
  const sevenTvEmotes = sevenTvData.emote_set.emotes;

  const emoteMap = new Map();

  sevenTvEmotes.forEach((emote: any) => {
    emoteMap.set(emote.name, "https:" + emote.data.host.url + "/1x.webp");
  });

  return emoteMap;
}
