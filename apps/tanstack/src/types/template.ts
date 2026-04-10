export type Template = {
  id: string;
  createdBy: string;
  templateName: string;
  templateUrl: string;
  templateThumbnailUrl: string ;
  templateDescription: string | null;
  instructionsPageUrl: string | null;
  notionPageUrl: string;
  isPaid: boolean | null;
  paymentLink: string | null;
  price: number | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
};
