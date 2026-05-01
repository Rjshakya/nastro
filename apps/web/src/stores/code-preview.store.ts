import { create } from "zustand";

interface CodePreviewStore {
  previewCss: string;
  setPreviewCss: (css: string) => void;
  resetPreviewCss: () => void;
}

export const useCodePreviewStore = create<CodePreviewStore>((set) => ({
  previewCss: "",
  setPreviewCss: (css) => set({ previewCss: css }),
  resetPreviewCss: () => set({ previewCss: "" }),
}));
