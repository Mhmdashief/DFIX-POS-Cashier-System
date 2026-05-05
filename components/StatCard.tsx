import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  colorClass: string; // e.g., "text-blue-500 bg-blue-50"
}

export function StatCard({ title, value, sub, icon: Icon, colorClass }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-zinc-900">{value}</h3>
      <p className={`text-xs mt-1 font-medium ${sub.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
        {sub}
      </p>
    </div>
  );
}