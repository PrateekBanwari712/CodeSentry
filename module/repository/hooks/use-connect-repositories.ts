"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { connectRepositories } from "../actions";
import { toast } from "@/components/ui/toast";

export const useConnectRepository = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async({owner, repo, githubId} : {owner: string, repo:string, githubId: number})=>{
            return await connectRepositories(owner, repo, githubId);
        },
        onSuccess:()=>{
            toast.add({
                type:"success",
                title:"Repository Connected Successfully"
            })
            queryClient.invalidateQueries({
                queryKey:["repositories"]
            })
        },
        onError: (error) => {
            toast.add({
                type:"error",
                title:`${error}`
            })
            console.log(error)
        }
    })
}
