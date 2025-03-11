import React, { useEffect, useState } from "react";
import "./App.css";
import { Character } from "./components/Character/Character";
import { Chatter } from "./types/Chatter";
import { charactersRef } from "./components/Character/characterRef";
import { ws } from "./websocket/websocket";
import { TwitchEvent } from "./types/TwitchEvent";

const App: React.FC = () => {
  const [chatters, setChatters] = useState<Record<string, Chatter>>({});
  const [data, setData] = useState<TwitchEvent | undefined>(undefined);
  useEffect(() => {
    ws.addEventListener("message", (event) => {
      const eventData = JSON.parse(event.data);
      const data = eventData.data as TwitchEvent;
      if (!data) return console.debug(eventData);

      const chatter: Chatter = {
        msg: data.msg,
        lastMessage: data.message,
        lastMessageTime: Date.now(),
      };
      setData(data);

      setChatters((prev) => {
        return {
          ...prev,
          [data.msg.userId]: chatter,
        };
      });
    });
  }, []);

  return (
    <>
      {Object.values(chatters).map((chatter: Chatter) => {
        return (
          <Character
            key={chatter.msg.id}
            name={chatter.msg.displayName}
            newCurrentMessage={
              chatter.lastMessageTime + 450000 > Date.now() &&
              chatter.msg.userId == data?.msg.userId
                ? data
                : undefined
            }
            state={
              charactersRef.current && charactersRef.current[chatter.msg.userId]
                ? charactersRef.current[chatter.msg.userId].getState() ?? {}
                : {}
            }
            ref={(el) => {
              if (el) {
                if (!charactersRef.current) {
                  charactersRef.current = {};
                }
                charactersRef.current[chatter.msg.userId] = el;
              }
            }}
          />
        );
      })}
    </>
  );
};

export default App;
