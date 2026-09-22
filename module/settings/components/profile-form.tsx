"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../actions";
import { toast } from "@/components/ui/toast";

export function ProfileForm () {
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const {data: profile, isLoading} = useQuery({
        queryKey:["user-profile"],
        queryFn:async () => await getUserProfile(),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })

    useEffect(() => {
        if(profile){
            setName(profile.name || "")
            setEmail(profile.email || "")
        }
    },[profile])

    const updateMutation = useMutation({
        mutationFn: async (data: {name: string, email: string}) => {
            return await updateUserProfile(data);
        },
        onSuccess: (result) => {
            if(result.success) {
                queryClient.invalidateQueries({queryKey: ["user-profile"]})
                toast.add({
                    type: "success",
                    title: "Profile updated successfully",
                })
            }
        },
        onError: () => 
            toast.add({
                type: "error",
                title: "Failed to update profile",
            }),
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle> Profile Settings</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <form
        //  onSubmit={handleSubmit}
         className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={updateMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Email</Label>
            <Input
              id="email"
              placeholder="john@doe.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={updateMutation.isPending}
            />
          </div>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
