import { requireAuth } from "@/module/auth/utils/auth_utils";
import { redirect } from "next/navigation";

export const instant = false;

export default function Home() {
   requireAuth();
   return redirect("/dashboard");

}
