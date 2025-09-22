import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatState {
  recipientId: string;
  recipientName: string;
  myUserId: string;
  username: string;

  setRecipientId: (recipientId: string) => void;
  setRecipientName: (name: string) => void;
  setMyUserId: (myUserId: string) => void;
  setUsername: (username: string) => void;
}

export const useSessionStore = create<ChatState>()(
  persist(
    (set) => ({
      recipientId: "",
      recipientName: "",
      myUserId: "",
      username: "",

      setRecipientId: (recipientId) => set({ recipientId }),
      setRecipientName: (recipientName) => set({ recipientName }),
      setMyUserId: (myUserId) => set({ myUserId }),
      setUsername: (username) => set({ username }),
    }),
    { name: "session-store" }
  )
);
