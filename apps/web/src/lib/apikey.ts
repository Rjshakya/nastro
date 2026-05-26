import { client } from "./api-client";
import type {
  ApiKey,
  CreateApiKeyInput,
  CreateApiKeyResult,
  UpdateApiKeyInput,
} from "@/types/apikey";
import { handleHttpError } from "./error";

export const getApiKeys = async () => {
  const res = await client.api.apikey.$get({});

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to fetch API keys",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  const data = await res.json();
  return data.data as ApiKey[];
};

export const createApiKey = async (
  _key: string,
  { arg }: { arg: CreateApiKeyInput },
) => {
  const res = await client.api.apikey.$post({
    json: arg,
  });

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to create API key",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  const data = await res.json();
  return data.data as CreateApiKeyResult;
};

export const updateApiKey = async ({
  keyId,
  input,
}: {
  keyId: string;
  input: UpdateApiKeyInput;
}) => {
  const res = await client.api.apikey[":id"].$patch({
    param: { id: keyId },
    json: input,
  });

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to update API key",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  return res.json();
};

export const deleteApiKey = async (
  _key: string,
  { arg }: { arg: { keyId: string } },
) => {
  const res = await client.api.apikey[":id"].$delete({
    param: { id: arg.keyId },
  });

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to delete API key",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  return res.json();
};
