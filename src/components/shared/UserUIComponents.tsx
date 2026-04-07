import React from 'react';
import { Lock } from 'lucide-react';

interface PremiumCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const PremiumCard = ({ children, onClick, className = '' }: PremiumCardProps) => (
  <div 
    onClick={onClick}
    className={`bg-white p-5 rounded-[2rem] border-2 border-transparent transition-all shadow-sm hover:shadow-md ${onClick ? 'cursor-pointer active:scale-[0.98] hover:border-brand-soft' : ''} ${className}`}
    style={onClick ? { boxShadow: '0 8px 30px rgba(var(--primary-rgb), 0.06)' } : {}}
  >
    {children}
  </div>
);

export const ReadOnlyBanner = ({ text }: { text: string }) => (
  <div className="bg-brand-soft border border-brand-soft text-brand p-4 rounded-[2rem] mb-8 flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 border border-brand-soft/50">
      <Lock size={16} className="opacity-70" /> 
    </div>
    <div className="flex-1 mt-1">
      <p className="text-sm font-bold leading-relaxed">{text}</p>
    </div>
  </div>
);

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="text-center py-12 px-6 bg-white rounded-[2rem] border-2 border-brand-soft shadow-sm mt-4">
    <div className="w-20 h-20 bg-brand-soft rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner border border-brand-soft/50">
      <Icon size={32} className="text-brand opacity-40" strokeWidth={1.5} />
    </div>
    <h3 className="text-xl text-brand font-black tracking-tight mb-2">{title}</h3>
    <p className="opacity-60 font-medium text-sm leading-relaxed mb-6">{description}</p>
    {action}
  </div>
);

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ElementType;
}

export const FloatingLabelInput = ({ label, type = "text", value, onChange, icon: Icon, required, ...props }: FloatingLabelInputProps) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold opacity-70 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
    <div className="relative">
      {Icon && <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Icon size={18} className="text-brand opacity-40" /></div>}
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        required={required}
        autoComplete="off"
        className={`w-full bg-brand-soft/30 hover:bg-brand-soft/50 border-[1.5px] border-brand-soft focus:border-brand ring-brand focus:ring-4 rounded-2xl outline-none transition-all font-bold placeholder:opacity-30 ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-4`}
        {...props}
      />
    </div>
  </div>
);
