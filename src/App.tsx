import { Application } from "@pixi/react";

import { Character } from "./components/character";
import { useState, useEffect } from "react";
import { Chatter } from "./types/Chatter";
import { charactersRef, setCharacterData } from "./components/characterRef";

export default function App() {
  const [chatters, setChatters] = useState<Record<string, Chatter>>({});

  // Update chatters from IndexedDB
  useEffect(() => {
    setTimeout(() => {
      const loadChattersFromDB = () => {
        const dbRequest = indexedDB.open("chatters");

        dbRequest.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction("chatters", "readonly");
          const store = transaction.objectStore("chatters");
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            const chattersArray = getAllRequest.result;
            const chattersObject: Record<string, Chatter> = {};
            chattersArray.forEach((chatter: Chatter) => {
              chattersObject[chatter.msg.id] = chatter;
            });
            setChatters(chattersObject);
            setCharacterData(chattersObject);
          };

          transaction.oncomplete = () => {
            console.log("Chatters loaded from IndexedDB");
          };

          transaction.onerror = (event) => {
            console.error("Error loading chatters from IndexedDB", event);
          };
        };

        dbRequest.onerror = (event) => {
          console.error("Error opening IndexedDB", event);
        };
      };

      loadChattersFromDB();
    }, 1000);
  }, []);

  useEffect(() => {
    if (Object.values(chatters).length > 0) {
      setCharacterData(chatters);
    }
  }, [chatters]);

  return (
    <Application backgroundAlpha={0} resizeTo={window}>
      {Object.values(chatters).map((chatter: Chatter) => (
        <Character
          key={chatter.msg.id}
          name={chatter.msg.displayName}
          ref={(el) => {
            if (el) {
              if (!charactersRef.current) {
                charactersRef.current = {};
              }
              charactersRef.current[chatter.msg.userId] = el;
            }
          }}
        />
      ))}
    </Application>
  );
}
