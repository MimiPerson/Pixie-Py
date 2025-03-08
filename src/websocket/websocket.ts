import { getCharacterRefById } from "../components/characterRef";
import { TwitchEvent } from "../types/TwitchEvent";
const ws = new WebSocket("ws://localhost:3344");

const ignoredUsers = [
  "streamelements",
  "nightbot",
  "cutecrystalcat",
  "sery_bot",
];
const dbRequest = indexedDB.open("chatters", 9);

dbRequest.onupgradeneeded = (event) => {
  const db = (event.target as IDBOpenDBRequest).result;
  if (db.objectStoreNames.contains("chatters")) {
    db.deleteObjectStore("chatters");
  }
  db.createObjectStore("chatters", { keyPath: "user" });
};

let db: IDBDatabase;

dbRequest.onsuccess = (event) => {
  db = (event.target as IDBOpenDBRequest).result;
  console.log("Database opened successfully");
};

ws.onmessage = async (event) => {
  const eventData = JSON.parse(event.data);
  const data = eventData.data as TwitchEvent;
  if (!data) return console.log(eventData);

  if (ignoredUsers.includes(data.msg.displayName.toLowerCase())) return;
  if (!db) {
    console.error("Database is not initialized");
    return;
  }

  const characterRef = getCharacterRefById(data.msg.userId); // Replace 0 with the appropriate index
  if (characterRef) {
    characterRef.say(data.message);
  } else {
    console.error("Character ref not found");
  }

  const transaction = db.transaction("chatters", "readwrite");
  const store = transaction.objectStore("chatters");

  const chatter = {
    user: data.user,
    msg: data.msg,
    lastMessage: data.message,
    lastMessageTime: Date.now(),
  };

  store.put(chatter);

  transaction.onerror = (event) => {
    console.error("Error adding chatter to IndexedDB", event);
  };
};
