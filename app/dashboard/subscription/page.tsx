"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ExternalLink, Loader2, RefreshCcw, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getSubscriptionData,
  syncSubscriptionStatus,
} from "@/module/payment/actions";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { checkout, customer } from "@/lib/auth-client";

const PLAN_FEATURES = {
  free: [
    { name: "Up to 5 Repositories", included: true },
    { name: "Up to 5 reviews per repository", included: true },
    { name: "Basic code reviews", included: true },
    { name: "Community support", included: true },
    { name: "Advanced analytics", included: false },
    { name: "Priority Support", included: false },
  ],
  pro: [
    { name: "Unlimited repositories", included: true },
    { name: "Unlimited reviews", included: true },
    { name: "Advanced code reviews", included: true },
    { name: "Email support", included: true },
    { name: "Advanced analytics", included: true },
    { name: "Priority Support", included: true },
  ],
};

function SubscriptionContent() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription-data"],
    queryFn: getSubscriptionData,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (success === "true") {
      const sync = async () => {
        try {
          await syncSubscriptionStatus();
          refetch();
        } catch (error) {
          console.error("Failed to sync subscription on success: ", error);
        }
      };
    }
  }, [success, refetch]);

  if (isLoading) {
    return (
      <div className="items-center, flex min-h-100 justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-muted-foreground">
            Failed to load subscription data
          </p>
        </div>
        <Alert variant={"destructive"}>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load subscription data. Please try again.
            <Button
              variant={"outline"}
              size={"sm"}
              className={"ml-4"}
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-muted-foreground">
            Please sign in to view subscription options.
          </p>
        </div>
      </div>
    );
  }

  const currentTier = data.user.subscriptionTier as "FREE" | "PRO";
  const isPro = currentTier === "PRO";
  const isActive = data.user.subscriptionStatus === "ACTIVE";

  // const handleSync = async () => {
  //   try {
  //     setSyncLoading(true);
  //     const result = await syncSubscriptionStatus();

  //     if(!result) {
  //       throw new Error("No response from server")
  //     }

  //     if (result.success) {
  //       toast.add({
  //         type: "success",
  //         title: "Subscription status updated",
  //       });
  //     } else {
  //       toast.add({
  //         type:"error",
  //         title: result.error 
  //         // "Failed to sync subscription",
  //       });
  //     }
  //   } catch (error) {
  //     toast.add({
  //       type: "error",
  //       title:"Failed to sync subscription",
  //     });
  //   } finally {
  //     setSyncLoading(false);
  //   }
  // };

  const handleSync = async () => {
    try {
      setSyncLoading(true);
      const result = await syncSubscriptionStatus();

      console.log("Sync Result:", result); // Check what this prints

      if (!result) {
        throw new Error("Result is undefined");
      }

      if (result.success) {
        toast.add({
          type: "success",
          title: "Subscription status updated",
        });
      } else {
        toast.add({
          type: "error",
          title: result.error || "Failed to sync subscription",
        });
      }
    } catch (error: any) {
      console.error("Frontend Catch Triggered:", error); // <-- Look at browser console
      toast.add({
        type: "error",
        title: error?.message || "Failed to sync subscription",
      });
    } finally {
      setSyncLoading(false);
    }
  };
  const handleUpgradePlan = async () => {
    try {
      setCheckoutLoading(true);
      await checkout({
        slug: "code-review",
      });
    } catch (error) {
      console.error("Failed to initiate checkout:", error);
      setCheckoutLoading(false);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      await customer.portal();
    } catch (error) {
      console.error("Failed to open portal: ", error);
      setPortalLoading(false);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-muted-foreground">
            Choose the perfect plan for your needs.
          </p>
        </div>
        <Button
          variant={"outline"}
          size="sm"
          onClick={handleSync}
          disabled={syncLoading}
        >
          {syncLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="mr-2 h-4 w-4" />
          )}
          Sync Status
        </Button>
      </div>
      {success === "true" && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Your subscription has been updated successfully. Changes may take a
            few moment to reflect.
          </AlertDescription>
        </Alert>
      )}

      {/* Current usage */}
      {data.limits && (
        <Card>
          <CardHeader>
            <CardTitle>Current Usage</CardTitle>
            <CardDescription>
              Your current plan limits and usage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">repositories</span>
                  <Badge
                    variant={
                      data.limits.repositories.canAdd
                        ? "default"
                        : "destructive"
                    }
                  >
                    {data.limits.repositories.current} /{" "}
                    {data.limits.repositories.limit ?? "♾️"}
                  </Badge>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${data.limits.repositories.canAdd ? "bg-primary" : "bg-destructive"}`}
                    style={{
                      width: data.limits.repositories.limit
                        ? `${Math.min(
                            (data.limits.repositories.current /
                              data.limits.repositories.limit) *
                              100,
                            100,
                          )}%`
                        : "0%",
                    }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Reviews per Repository
                  </span>
                  <Badge variant={"outline"}>
                    {isPro ? "Unlimited" : "5 per repo"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {isPro
                      ? "No limits on reviews"
                      : "Free tier allows 5 reviews per repository"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Free Plans */}
      <div className=" grid md:grid-cols-2 gap-6">
        <Card className={!isPro ? "ring-2 ring-primary" : ""}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
              </div>
              {!isPro && <Badge className="ml-2">Current Plan</Badge>}
            </div>
            <div className="mt-2">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {PLAN_FEATURES.free.map((feature) => (
                <div key={feature.name} className="flex items-center gap-2">
                  {feature.included ? (
                    <Check className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span
                    className={feature.included ? "" : "text-muted-foreground"}
                  >
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
            <Button className="w-full" variant={"outline"} disabled>
              {isPro ? "Current Plan" : "Downgrade "}
            </Button>
          </CardContent>
        </Card>

        {/* PRO Plans */}
        <Card className={!isPro ? "ring-2 ring-primary" : ""}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Free</CardTitle>
                <CardDescription>For professional developers</CardDescription>
              </div>
              {isPro && <Badge className="ml-2">Current Plan</Badge>}
            </div>
            <div className="mt-2">
              <span className="text-3xl font-bold">$99.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {PLAN_FEATURES.pro.map((feature) => (
                <div key={feature.name} className="flex items-center gap-2">
                  {feature.included ? (
                    <Check className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span
                    className={feature.included ? "" : "text-muted-foreground"}
                  >
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
            {isPro && isActive ? (
              <Button
                className="w-full"
                variant="outline"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening Portal...
                  </>
                ) : (
                  <>
                    Manage Subscription
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleUpgradePlan}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening Checkout...
                  </>
                ) : (
                  <span>Upgrade to Pro</span>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function subscriptionPage() {
  return (
    <Suspense fallback={<div>Loading subscription details...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
}
