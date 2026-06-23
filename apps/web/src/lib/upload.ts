import { client } from "./api-client";
import { handleHttpError } from "./error";

export interface GetFileUploadUrlInput {
  fileName: string;
  slug: string;
  expiresIn?: number;
}

export interface FileUploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
}

export const getFileUploadUrl = async ({
  fileName,
  slug,
  expiresIn = 600,
}: GetFileUploadUrlInput): Promise<FileUploadUrlResponse> => {
  const res = await client.api.upload["site-asset"].$post({
    json: {
      fileName,
      slug,
      expiresIn,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to get upload URL",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  const { data } = await res.json();
  return data;
};

export const uploadFileToUrl = async ({
  file,
  uploadUrl,
}: {
  file: File;
  uploadUrl: string;
}): Promise<void> => {
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload file to storage");
  }
};

function extractR2Key(url: string): string {
  const path = url.split(".xyz/")[1];
  if (!path) return "";
  const parts = path.split("/");
  parts.shift();
  return parts.join("/");
}

export const deleteSiteAsset = async (fileUrl: string): Promise<void> => {
  const key = extractR2Key(fileUrl);
  if (!key) return;

  const res = await client.api.upload["site-asset"].$delete({
    query: { key },
  });

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to delete file",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }
};
