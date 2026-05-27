import { create } from "zustand";

interface CodeEditorPanelStore {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const useCodeEditorPanelStore = create<CodeEditorPanelStore>((set) => ({
  open: false,
  onOpenChange: (open) => set({ open }),
}));
