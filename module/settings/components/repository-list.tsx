"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  disconnectAllRepository,
  disconnectRepository,
  getConnectedRepositories,
} from "../actions";
import { toast } from "@/components/ui/toast";

export function RepositoryList() {
  const queryClient = useQueryClient();

  const [disconnectAllOpen, setDisconnectAllOpen] = useState(false);

  const { data: repositories, isLoading } = useQuery({
    queryKey: ["connected-repositories"],
    queryFn: async () => await getConnectedRepositories(),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const disconnectMutation = useMutation({
    mutationFn: async (repositoryId: string) => {
      return await disconnectRepository(repositoryId);
    },
    //Invalidate the queries
    onSuccess: (result) => {
      if (result.success) {
        (queryClient.invalidateQueries({
          queryKey: ["connected-repository"],
        }),
          queryClient.invalidateQueries({
            queryKey: ["dashboard-stats"],
          }),
          toast.add({
            type: "success",
            title: "Repository disconnected successfully",
          }));
      } else {
        toast.add({
          type: "error",
          title: `${result.error || "Failed to disconnect repository"}`,
        });
      }
    },
  });

  const disconnectAllMutation = useMutation({
    mutationFn: async () => {
      return await disconnectAllRepository();
    },
    // Invalidate the queries
    onSuccess: (result) => {
      if (result.success) {
        (queryClient.invalidateQueries({
          queryKey: ["connected-repositories"],
        }),
          queryClient.invalidateQueries({
            queryKey: ["dashboard-stats"],
          }),
          toast.add({
            type: "success",
            title: "All Repositories disconnected successfully",
          }));
        setDisconnectAllOpen(true);
      } else {
        toast.add({
          type: "error",
          title: `${result.error || "Failed to disconnect repository"}`,
        });
      }
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>
            Manage your connected Github repository
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted-foreground"></div>
            <div className="h-20 bg-muted-foreground"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Connected Repositories</CardTitle>
            <CardDescription>
              Manage your connected Github repositories
            </CardDescription>
          </div>
          {repositories && repositories.length > 0 && (
            <AlertDialog
              open={disconnectAllOpen}
              onOpenChange={setDisconnectAllOpen}
            >
              <AlertDialogTrigger>
                <Button variant={"destructive"} size={"sm"}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Disconnect All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  {" "}
                  <AlertDialogTitle className={"flex items-center gap-2"}>
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Disconnect All Repositories?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will disconnect all {repositories.length} repositories
                    and delete all associated AI reviews. this action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => disconnectAllMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={disconnectAllMutation.isPending}
                  >
                    {disconnectAllMutation.isPending
                      ? "Disconnecting..."
                      : "Disconnect All"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!repositories || repositories.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No repositories connected yet.</p>
            <p className="mt-2 text-sm">
              Connect repositories from the Repository page.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {repositories.map((repo) => (
              <div
                id={repo.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex min-w-0 justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semiboldjj truncate">
                      {repo.fullName}
                    </h3>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button
                      variant={"ghost"}
                      size={"sm"}
                      className="ml-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Disconnect Repository?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will disconnect <strong>{repo.fullName}</strong>{" "}
                        and delete all associated AI reviews. This action cannot
                        be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => disconnectMutation.mutate(repo.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={disconnectMutation.isPending}
                      >
                        {disconnectMutation.isPending
                          ? "Disconnecting..."
                          : "Disconnect"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
