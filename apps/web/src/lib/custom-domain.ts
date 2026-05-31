import { client } from "./api-client";
import type { CustomDomain, DomainStatus } from "@/types/custom-domain";
import { handleHttpError } from "./error";

export const getCustomDomains = async () => {
  const res = await client.api["custom-domain"].$get();

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to fetch custom domains",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  const data = await res.json();
  return data.data as CustomDomain[];
};

export const getDomainStatus = async (id: string) => {
  const res = await client.api["custom-domain"][":id"].$get({
    param: { id },
  });

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to fetch domain status",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  const data = await res.json();
  return data.data as DomainStatus;
};

export const getDomainCname = async () => {
  const res = await client.api["custom-domain"].cname.$get();

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to fetch CNAME",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  const data = await res.json();
  return (data.data as { cname: string }).cname;
};

export const createCustomDomain = async (
  _key: string,
  { arg }: { arg: { siteId: string; hostName: string } },
) => {
  const res = await client.api["custom-domain"].$post({
    json: arg,
  });

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to create custom domain",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  const data = await res.json();
  return data.data as CustomDomain;
};

export const deleteCustomDomain = async (
  _key: string,
  { arg }: { arg: { id: string } },
) => {
  const res = await client.api["custom-domain"][":id"].$delete({
    param: { id: arg.id },
  });

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to delete custom domain",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  return res.json();
};
