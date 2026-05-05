import { create } from "zustand";

interface CodePreviewStore {
  previewScript: string;
  previewCss: string;
  setPreviewCss: (css: string) => void;
  resetPreviewCss: () => void;
  setPreviewScript: (script: string) => void;
}

export const useCodePreviewStore = create<CodePreviewStore>((set) => ({
  previewCss: "",
  previewScript: "",
  setPreviewCss: (css) => set({ previewCss: css }),
  resetPreviewCss: () => set({ previewCss: "" }),
  setPreviewScript: (script) => set({ previewScript: script }),
}));
