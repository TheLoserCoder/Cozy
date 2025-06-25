import { LinkList } from "./list.types";
import { nanoid } from "nanoid";

export function createList(title: string): LinkList {
  return {
    id: nanoid(),
    title,
    links: [],
  };
}
