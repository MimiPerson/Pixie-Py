// import { getCharacterRefById } from "../components/Character/characterRef";
// import { TwitchEvent } from "../types/TwitchEvent";
export const ws = new WebSocket("ws://localhost:3344");

// const ignoredUsers = ["streamelements", "nightbot", "cutecrystalcat"];

// ws.onmessage = async (event) => {
//   const eventData = JSON.parse(event.data);
//   const data = eventData.data as TwitchEvent;
//   if (!data) return console.debug(eventData);

//   if (ignoredUsers.includes(data.msg.displayName.toLowerCase())) return;

//   const characterRef = getCharacterRefById(data.msg.userId); // Replace 0 with the appropriate index
//   if (characterRef) {
//     characterRef.say(data);
//   } else {
//     console.log("Character ref not found");
//   }
// };
