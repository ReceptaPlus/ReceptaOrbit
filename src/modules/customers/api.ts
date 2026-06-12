import { contacts } from "@/lib/mock-data";
import type { Contact } from "./types";

export function listContacts(): Contact[] {
  return contacts as Contact[];
}

export function getContact(id: string): Contact | undefined {
  return listContacts().find((c) => c.id === id);
}
