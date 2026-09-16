import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home() {
  // return (
  //  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
  //       <div className="absolute -top-40 -left-40 w-96 h-96 bg-muted rounded-full blur-3xl" />
  //       <div className="absolute top-1/2 -right-40 w-120 h-120 bg-cyan-500/10 rounded-full blur-3xl" />
  //       <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
  //       <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-size-[32px_32px]" />
  //     </div>
   
  // );
  return redirect("/dashboard")
}
