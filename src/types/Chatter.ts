export interface Chatter {
  msg: msg;
  lastMessage: string;
  lastMessageTime: number;
  spriteSheets?: SpriteSheets;
}

type SpriteSheets = Array<{
  state: "idle" | "walking" | "falling";
  width: number;
  height: number;
  url: string;
}>;

interface msg {
  badgeInfo: Array<[string, number]>;
  clientNonce: string;
  color: string;
  displayName: string;
  emotes: string;
  firstMsg: string;
  flags: null;
  id: string;
  mod: string;
  replyParentDisplayName: string;
  replyParentMsgBody: string;
  replyParentMsgId: string;
  replyParentUserId: string;
  replyParentUserLogin: string;
  replyThreadParentDisplayName: string;
  replyThreadParentMsgId: string;
  replyThreadParentUserId: string;
  replyThreadParentUserLogin: string;
  returningChatter: string;
  roomId: string;
  subscriber: string;
  tmiSentTs: string;
  turbo: string;
  userId: string;
  userType: string;
}
