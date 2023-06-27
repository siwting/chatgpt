import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import { ACCESS_CODE_PREFIX } from "../constant";

function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

function parseApiKey(bearToken: string) {
  const token = bearToken.trim().replaceAll("Bearer ", "").trim();
  const isOpenAiKey = !token.startsWith(ACCESS_CODE_PREFIX);

  return {
    accessCode: isOpenAiKey ? "" : token.slice(ACCESS_CODE_PREFIX.length),
    apiKey: isOpenAiKey ? token : "",
  };
}

async function chackToken(accessCode: string, authUrl: any) {
  const res = await fetch(authUrl + `/user/current`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + accessCode,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
      Accept: "application/json",
    },
  });
  return await res.json();
}

export function auth(req: NextRequest) {
  const authToken = req.headers.get("Authorization") ?? "";

  // check if it is openai api key or user token
  const { accessCode, apiKey: token } = parseApiKey(authToken);

  const serverConfig = getServerSideConfig();

  if (serverConfig.needCode && !token) {
    if (!accessCode) {
      return {
        error: true,
        msg: "empty access code",
      };
    }
  }
  // const res = await chackToken(accessCode, serverConfig.authUrl);
  // if (res.Code !== 1000) {
  //   return {
  //     error: true,
  //     msg: "access code is not valid",
  //   };
  // }

  // if user does not provide an api key, inject system api key
  if (!token) {
    const apiKey = serverConfig.apiKey;
    if (apiKey) {
      console.log("[Auth] use system api key");
      req.headers.set("Authorization", `Bearer ${apiKey}`);
    } else {
      console.log("[Auth] admin did not provide an api key");
    }
  } else {
    console.log("[Auth] use user api key");
  }

  return {
    error: false,
  };
}
