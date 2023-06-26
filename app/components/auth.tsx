import styles from "./auth.module.scss";
import { IconButton } from "./button";

import { useNavigate, useSearchParams } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";
import { useEffect } from "react";

/**
 * xjjk认证中心登錄
 */
export const xjjkLogin = (code: any): any => {
  fetch(
    `https://account.test.xjjk.com/oauth2/token?code=${code}&grant_type=xjjk_code&client_id=dc9af31456a04fc1ade26019200b2d5c`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
  ).then((response) => {
    console.log("response：", response);
  });
};

export function AuthPage() {
  const navigate = useNavigate();
  const access = useAccessStore();
  const [param] = useSearchParams();
  useEffect(() => {
    if (param.get("code")) {
      console.log("code：", param.get("code"));
      xjjkLogin(param.get("code")).then((res: any) => {
        console.log("res：", res);
      });
    } else {
      // window.location.replace("https://account.test.xjjk.com/oauth2/authorize?response_type=code&client_id=dc9af31456a04fc1ade26019200b2d5c&redirect_uri=http://localhost:3000/auth&scope=profile")
    }
  }, [access.accessCode]);
  const goHome = () => navigate(Path.Home);

  return (
    <div className={styles["auth-page"]}>
      <div className={`no-dark ${styles["auth-logo"]}`}>
        <BotIcon />
      </div>

      <div className={styles["auth-title"]}>{Locale.Auth.Title}</div>
      <div className={styles["auth-tips"]}>{Locale.Auth.Tips}</div>

      <input
        className={styles["auth-input"]}
        type="password"
        placeholder={Locale.Auth.Input}
        value={access.accessCode}
        onChange={(e) => {
          access.updateCode(e.currentTarget.value);
        }}
      />

      <div className={styles["auth-actions"]}>
        <IconButton
          text={Locale.Auth.Confirm}
          type="primary"
          onClick={goHome}
        />
        <IconButton text={Locale.Auth.Later} onClick={goHome} />
      </div>
    </div>
  );
}
