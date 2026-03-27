import { create } from "zustand";

interface CreateSiteStore {
  openDialog: boolean;
  setOpenDialog: (b: boolean) => void;
}

export const useCreateSiteStore = create<CreateSiteStore>((set) => ({
  openDialog: false,
  setOpenDialog(b) {
    set({ openDialog: b });
  },
}));
