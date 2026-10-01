import { requireAuth } from "@/module/auth/utils/auth_utils";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

export const Home = async () => {
  try {
    await requireAuth();
    return redirect("/dashboard");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error(error);
  }
}
