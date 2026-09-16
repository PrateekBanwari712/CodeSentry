import { ShieldCheck } from "lucide-react";
import React from "react";

const Logo = () => {
  return (
    <a href="/" className="flex items-center gap-3 group">
      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-chart-1 p-px shadow-sm">
        <div className="w-full h-full bg-card rounded-[11px] flex items-center justify-center transition group-hover:bg-accent">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xl font-bold tracking-tight text-card-foreground">
          CodeSentry
        </span>
        <span className="text-[10px] uppercase font-mono tracking-wider font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          AI
        </span>
      </div>
    </a>
  );
};

export default Logo;
