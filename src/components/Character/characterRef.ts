import { Chatter } from "../../types/Chatter";
import { CharacterHandle } from "./Character";
import { RefObject, createRef } from "react";

export const charactersRef: RefObject<Record<string, CharacterHandle> | null> =
  createRef() || null;

export function getCharacterRef(id: string): CharacterHandle | undefined {
  return charactersRef.current ? charactersRef.current[id] : undefined;
}

export function setCharacterData(chatters: Record<string, Chatter>) {
  Object.values(chatters).forEach((chatter) => {
    if (charactersRef.current) {
      charactersRef.current[chatter.msg.id]?.setData(chatter);
    }
  });
}

export function getCharacterRefById(
  id: string
): CharacterHandle | null | undefined {
  return charactersRef.current?.[id];
}
