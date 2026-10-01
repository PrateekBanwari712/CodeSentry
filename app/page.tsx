import { requireAuth } from "@/module/auth/utils/auth_utils";
import { DashboardSkeleton } from "@/module/dashboard/components/Dashboard-Skeleton";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function Home_Fnc() {
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

export default async function Home() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Home_Fnc />
    </Suspense>
  );
}
