import LoginPage_UI from "@/module/auth/components/Login_UI";
import { requireUnAuth } from "@/module/auth/utils/auth_utils";
import React, { Suspense } from "react";

async function LoginGate() {
  await requireUnAuth();
  return <LoginPage_UI />;
}

const LoginPage = async () => {
  return (
    <Suspense fallback={null}>
      <LoginGate />
    </Suspense>
  );
};

export default LoginPage;
