import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, iconColor = 'from-quotla-green to-emerald-500' }: StatCardProps) {
  const changeColors = {
    positive: 'text-emerald-400',
    negative: 'text-rose-400',
    neutral: 'text-primary-400',
  };

  return (
    <Card className="bg-quotla-dark border-primary-600 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-primary-400 text-sm mb-1">{title}</p>
          <h3 className="text-2xl text-primary-100 mb-2">{value}</h3>
          {change && (
            <p className={`text-sm ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${iconColor} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}
