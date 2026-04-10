import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface MobileSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function MobileSection({ title, children, className = '' }: MobileSectionProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {title && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-1">
          {title}
        </p>
      )}
      <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50">
        {children}
      </div>
    </div>
  );
}

interface MobileRowProps {
  icon?: ReactNode;
  label: string;
  value?: string | ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
  badge?: ReactNode;
  className?: string;
}

export function MobileRow({ icon, label, value, onPress, chevron = false, destructive = false, badge, className = '' }: MobileRowProps) {
  const Tag = onPress ? 'button' : 'div';
  return (
    <Tag
      onClick={onPress}
      className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0 transition-colors
        ${onPress ? 'hover:bg-muted/60 active:bg-muted cursor-pointer' : ''}
        ${destructive ? 'hover:bg-red-50 dark:hover:bg-red-900/20' : ''}
        ${className}`}
    >
      {icon && (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${destructive ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary/10'}`}>
          <span className={destructive ? 'text-destructive' : 'text-primary'}>{icon}</span>
        </div>
      )}
      <span className={`flex-1 text-sm font-medium text-left ${destructive ? 'text-destructive' : 'text-foreground'}`}>
        {label}
      </span>
      {badge && <span className="mr-1">{badge}</span>}
      {value && <span className="text-sm text-muted-foreground">{value}</span>}
      {chevron && <ChevronRight className={`w-4 h-4 shrink-0 ${destructive ? 'text-destructive/60' : 'text-muted-foreground'}`} />}
    </Tag>
  );
}

interface MobileStatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
}

export function MobileStatCard({ icon, label, value, color = 'text-primary' }: MobileStatCardProps) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 flex flex-col items-center gap-1">
      <div className={`${color} mb-1`}>{icon}</div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground text-center">{label}</p>
    </div>
  );
}
