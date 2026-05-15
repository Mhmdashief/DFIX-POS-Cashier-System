"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  trend?: string;
  icon: React.ReactNode;
  isNeutral?: boolean;
}

export function StatCard({ title, value, sub, trend, icon, isNeutral = false }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-100 flex justify-between items-start h-[135px] w-full shadow-sm">
      <div className="flex flex-col h-full justify-between text-left">
        <p className="text-[13px] font-bold text-zinc-800 tracking-tight">{title}</p>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-bold text-zinc-900 leading-none">{value}</span>
            <span className="text-[11px] text-zinc-400 font-bold">{sub}</span>
          </div>
          {trend && (
            <p className={`text-[11px] mt-2 flex items-center gap-1 font-bold ${isNeutral ? 'text-zinc-400' : 'text-green-500'}`}>
              {!isNeutral && <ArrowUpRight size={14} strokeWidth={3} />} {trend}
            </p>
          )}
        </div>
      </div>
      <div className="p-2.5 rounded-lg border border-zinc-50 bg-white flex items-center justify-center text-amber-400 shadow-sm">
        {icon}
      </div>
    </div>
  );
}

export default StatCard;