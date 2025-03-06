export interface TwitchEvent {
  type: string;
  channel: string;
  user: string;
  message: string;
  msg: Msg;
}

interface Msg {
  badgeInfo: BadgeInfo;
  color: string;
  displayName: string;
  emotes: string|null;
  firstMsg: string;
  flags: string | null;
  id: string;
  mod: string;
  returningChatter: string;
  roomId: string;
  subscriber: string;
  tmiSentTs: string;
  turbo: string;
  userId: string;
  userType: string| null;
}

interface BadgeInfo {
  broadcaster: number;
  subscriber: number;
  'destiny-2-final-shape-raid-race': number;
}