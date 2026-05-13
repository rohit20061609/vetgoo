import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AppState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  selectedPetId: string | null;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  setSelectedPetId: (petId: string | null) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        theme: "light",
        selectedPetId: null,
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setTheme: (theme) => set({ theme }),
        setSelectedPetId: (petId) => set({ selectedPetId: petId }),
      }),
      {
        name: "app-storage",
      }
    )
  )
);

interface ConversationState {
  conversationId: string | null;
  messages: Array<{ id: string; role: "user" | "assistant"; content: string }>;
  isLoading: boolean;
  setConversationId: (id: string | null) => void;
  addMessage: (role: "user" | "assistant", content: string) => void;
  setMessages: (
    messages: Array<{ id: string; role: "user" | "assistant"; content: string }>
  ) => void;
  setIsLoading: (loading: boolean) => void;
  clearConversation: () => void;
}

export const useConversationStore = create<ConversationState>()(
  devtools(
    persist(
      (set) => ({
        conversationId: null,
        messages: [],
        isLoading: false,
        setConversationId: (id) => set({ conversationId: id }),
        addMessage: (role, content) =>
          set((state) => ({
            messages: [
              ...state.messages,
              { id: Math.random().toString(), role, content },
            ],
          })),
        setMessages: (messages) => set({ messages }),
        setIsLoading: (loading) => set({ isLoading: loading }),
        clearConversation: () =>
          set({ conversationId: null, messages: [], isLoading: false }),
      }),
      {
        name: "conversation-storage",
      }
    )
  )
);
