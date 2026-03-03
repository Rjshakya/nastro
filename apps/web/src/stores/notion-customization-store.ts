import { create } from "zustand";
import type {
  CustomStyles,
  NotionCustomization,
  NotionDefaultButton,
} from "@/types/customization";

export type NotionCustomizationTab =
  | "main"
  | "navbar"
  | "footer"
  | "notion"
  | "card"
  | "buttons";

export interface ColorFieldConfig {
  type: "color";
  key: string;
  label: string;
}

export interface SliderFieldConfig {
  type: "slider";
  key: string;
  label: string;
  min: number;
  max: number;
}

type FieldConfig = ColorFieldConfig | SliderFieldConfig;

export interface SectionConfig {
  id: keyof NotionCustomization;
  label: string;
  fields: FieldConfig[];
}

// Array to render components dynamically - default values are null/empty
export const notionCustomizationComps: SectionConfig[] = [
  {
    id: "main",
    label: "Main Colors",
    fields: [
      { type: "color", key: "pageBackground", label: "Page Background" },
      { type: "color", key: "textColor", label: "Text Color" },
      // { type: "color", key: "textLightColor", label: "Light Text" },
      // { type: "color", key: "borderColor", label: "Border Color" },
      // { type: "color", key: "hoverBackground", label: "Hover Background" },
      {
        type: "color",
        key: "checkboxBackground",
        label: "Checkbox Background",
      },
    ],
  },
  {
    id: "navbar",
    label: "Navbar",
    fields: [
      { type: "color", key: "textColor", label: "Text Color" },
      { type: "color", key: "background", label: "Background" },
      { type: "color", key: "buttonText", label: "Button Text" },
      { type: "color", key: "buttonBackground", label: "Button Background" },
    ],
  },
  {
    id: "footer",
    label: "Footer",
    fields: [
      { type: "color", key: "textColor", label: "Text Color" },
      { type: "color", key: "background", label: "Background" },
    ],
  },
  {
    id: "notion",
    label: "Notion Colors",
    fields: [
      { type: "color", key: "gray", label: "Gray" },
      { type: "color", key: "brown", label: "Brown" },
      { type: "color", key: "orange", label: "Orange" },
      { type: "color", key: "yellow", label: "Yellow" },
      { type: "color", key: "teal", label: "Teal" },
      { type: "color", key: "blue", label: "Blue" },
      { type: "color", key: "purple", label: "Purple" },
      { type: "color", key: "pink", label: "Pink" },
      { type: "color", key: "red", label: "Red" },
    ],
  },
  {
    id: "card",
    label: "Card",
    fields: [
      { type: "color", key: "cardBackground", label: "Card Background" },
      { type: "color", key: "cardHover", label: "Card Hover" },
      { type: "color", key: "cardText", label: "Card Text" },
      { type: "color", key: "cardBorder", label: "Card Border" },
    ],
  },

  {
    id: "defaultButton",
    label: "Default Button",
    fields: [
      { key: "background", type: "color", label: "Button Background" },
      { key: "textColor", type: "color", label: "Text" },
      { key: "borderColor", type: "color", label: "Border" },
      { key: "hoverBackground", type: "color", label: "Hover Background" },
    ],
  },
  {
    id: "buttons",
    label: "Buttons",
    fields: [
      { type: "color", key: "gray", label: "Gray" },
      { type: "color", key: "brown", label: "Brown" },
      { type: "color", key: "orange", label: "Orange" },
      { type: "color", key: "yellow", label: "Yellow" },
      { type: "color", key: "green", label: "Green" },
      { type: "color", key: "blue", label: "Blue" },
      { type: "color", key: "purple", label: "Purple" },
      { type: "color", key: "pink", label: "Pink" },
      { type: "color", key: "red", label: "Red" },
    ],
  },
  {
    id: "sizes",
    label: "Sizes",
    fields: [
      {
        type: "slider",
        key: "pageTitle",
        label: "Page title",
        max: 100,
        min: 16,
      },
      {
        type: "slider",
        key: "heading1",
        label: "Heading 1",
        max: 100,
        min: 16,
      },
      {
        type: "slider",
        key: "heading2",
        label: "Heading 2",
        max: 100,
        min: 16,
      },
      {
        type: "slider",
        key: "heading3",
        label: "Heading 3",
        max: 100,
        min: 16,
      },
      {
        type: "slider",
        key: "base",
        label: "Base",
        max: 100,
        min: 16,
      },
    ],
  },
];

interface NotionCustomizationState {
  isPanelOpen: boolean;
  activeTab: NotionCustomizationTab;
  previewEnabled: boolean;
  customization: NotionCustomization | null;
  customStyles: CustomStyles;

  togglePanel: (open: boolean) => void;
  setActiveTab: (tab: NotionCustomizationTab) => void;
  togglePreview: () => void;
  setCustomization: (customization: NotionCustomization | null) => void;
  updateMain: (values: Partial<NotionCustomization["main"]>) => void;
  updateNavbar: (values: Partial<NotionCustomization["navbar"]>) => void;
  updateFooter: (values: Partial<NotionCustomization["footer"]>) => void;
  updateNotionColor: (
    color: keyof NonNullable<NotionCustomization["notion"]>,
    value: NonNullable<NotionCustomization["notion"]>[keyof NonNullable<
      NotionCustomization["notion"]
    >],
  ) => void;
  updateCard: (values: Partial<NotionCustomization["card"]>) => void;
  updateButton: (
    button: keyof NonNullable<NotionCustomization["buttons"]>,
    value: NonNullable<NotionCustomization["buttons"]>[keyof NonNullable<
      NotionCustomization["buttons"]
    >],
  ) => void;
  updateDefaultButton: (values: Partial<NotionDefaultButton>) => void;
  computeStyles: () => void;
  updateStore: (value: NonNullable<NotionCustomization>) => void;
}

export const useNotionCustomizationStore = create<NotionCustomizationState>(
  (set, get) => ({
    isPanelOpen: false,
    activeTab: "main",
    previewEnabled: false,
    customization: {
      sizes: {
        pageTitle: { value: Math.floor(2.6 * 16) },
        heading1: { value: Math.floor(1.8 * 16) },
        heading2: { value: Math.floor(1.5 * 16) },
        heading3: { value: Math.floor(1.25 * 16) },
        base: { value: 16 },
      },
      // fonts: {
      //   primary: "Geist Sans sans-serif",
      //   secondary: "Geist Sans sans-serif",
      // },
    },
    customStyles: {},

    togglePanel: (open) => set(() => ({ isPanelOpen: open })),
    setActiveTab: (tab) => set({ activeTab: tab }),
    togglePreview: () =>
      set((state) => ({ previewEnabled: !state.previewEnabled })),

    setCustomization: (customization) => {
      const customStyles = computeCustomStyles(customization);
      set({ customization, customStyles });
    },

    updateMain: (values) => {
      const current = get().customization?.main || {};
      const updated = { ...current, ...values };
      const newCustomization = {
        ...get().customization,
        main: updated,
      };
      set({
        customization: newCustomization,
        customStyles: computeCustomStyles(newCustomization),
      });
    },

    updateNavbar: (values) => {
      const current = get().customization?.navbar || {};
      const updated = { ...current, ...values };
      const newCustomization = {
        ...get().customization,
        navbar: updated,
      };
      set({
        customization: newCustomization,
        customStyles: computeCustomStyles(newCustomization),
      });
    },

    updateFooter: (values) => {
      const current = get().customization?.footer || {};
      const updated = { ...current, ...values };
      const newCustomization = {
        ...get().customization,
        footer: updated,
      };
      set({
        customization: newCustomization,
        customStyles: computeCustomStyles(newCustomization),
      });
    },

    updateNotionColor: (color, value) => {
      const current = get().customization?.notion || {};
      const updated = { ...current, [color]: value };
      const newCustomization = {
        ...get().customization,
        notion: updated,
      };
      set({
        customization: newCustomization,
        customStyles: computeCustomStyles(newCustomization),
      });
    },

    updateCard: (values) => {
      const current = get().customization?.card || {};
      const updated = { ...current, ...values };
      const newCustomization = {
        ...get().customization,
        card: updated,
      };
      set({
        customization: newCustomization,
        customStyles: computeCustomStyles(newCustomization),
      });
    },

    updateButton: (button, value) => {
      const current = get().customization?.buttons || {};
      const updated = { ...current, [button]: value };
      const newCustomization = {
        ...get().customization,
        buttons: updated,
      };
      set({
        customization: newCustomization,
        customStyles: computeCustomStyles(newCustomization),
      });
    },

    updateDefaultButton: (values) => {
      const current = get().customization?.defaultButton || {};
      const updated = { ...current, ...values };
      const newCustomization = {
        ...get().customization,
        defaultButton: updated,
      };
      set({
        customization: newCustomization,
        customStyles: computeCustomStyles(newCustomization),
      });
    },

    computeStyles: () => {
      const styles = computeCustomStyles(get().customization);
      set({ customStyles: styles });
    },

    updateStore: (v) => {
      const current = get().customization;
      console.log(v);
      const updated = { ...current, ...v };
      const styles = computeCustomStyles(updated);
      // console.log(updated);
      set({
        customization: updated,
        customStyles: styles,
      });
    },
  }),
);

export const computeCustomStyles = (
  customization: NotionCustomization | null,
): CustomStyles => {
  if (!customization) return {};

  const styles: CustomStyles = {};

  if (customization.main) {
    styles["--notion-custom-page-bg"] = customization.main.pageBackground;
    styles["--notion-custom-text"] = customization.main.textColor;
    styles["--notion-custom-text-light"] = customization.main.textLightColor;
    styles["--notion-custom-border"] = customization.main.borderColor;
    styles["--custom-notion-select-color-0"] =
      customization.main.checkboxBackground;
  }

  if (customization.navbar) {
    styles["--notion-custom-navbar-text"] = customization.navbar.textColor;
    styles["--notion-custom-navbar-bg"] = customization.navbar.background;
    styles["--notion-custom-navbar-btn-text"] = customization.navbar.buttonText;
    styles["--notion-custom-navbar-btn-bg"] =
      customization.navbar.buttonBackground;
  }

  if (customization.footer) {
    styles["--notion-custom-footer-text"] = customization.footer.textColor;
    styles["--notion-custom-footer-bg"] = customization.footer.background;
  }

  if (customization.notion) {
    const colorMap = [
      "gray",
      "brown",
      "orange",
      "yellow",
      "teal",
      "blue",
      "purple",
      "pink",
      "red",
    ] as const;

    colorMap.forEach((color) => {
      const colorData = customization.notion?.[color];
      if (colorData) {
        styles[`--notion-${color}`] = colorData.background;
      }
    });
  }

  if (customization.card) {
    styles["--notion-collection-card"] = customization.card.cardBackground;
    styles["--notion-collection-card-hover"] = customization.card.cardHover;
    styles["--notion-collection-card-border"] = customization.card.cardBorder;
    styles["--notion-collection-card-text"] = customization.card.cardText;
  }

  if (customization.buttons) {
    const buttons = [
      "gray",
      "brown",
      "orange",
      "yellow",
      "green",
      "blue",
      "purple",
      "pink",
      "red",
    ] as const;
    buttons.forEach((btn) => {
      const btnData = customization.buttons?.[btn];
      if (btnData) {
        styles[`--custom-notion-item-${btn}`] = btnData.background;
      }
    });
  }

  if (customization.defaultButton) {
    styles["--notion-default-btn-bg"] =
      customization?.defaultButton?.background;
    styles["--notion-default-btn-text"] =
      customization?.defaultButton?.textColor;
    styles["--notion-default-btn-hover"] =
      customization?.defaultButton?.hoverBackground;
    styles["--notion-default-btn-border"] =
      customization?.defaultButton?.borderColor;
  }

  if (customization.sizes) {
    styles["--notion-page-title"] =
      customization.sizes?.pageTitle?.value + "px";
    styles["--notion-h1"] = customization.sizes?.heading1?.value + "px";
    styles["--notion-h2"] = customization.sizes?.heading2?.value + "px";
    styles["--notion-h3"] = customization.sizes?.heading3?.value + "px";
    styles["--base-font-size"] = customization.sizes?.base?.value + "px";
  }

  if (customization.fonts) {
    styles["--notion-primary-font"] = customization.fonts?.primary;
    styles["--notion-secondary-font"] = customization.fonts?.secondary;
  }

  return styles;
};
