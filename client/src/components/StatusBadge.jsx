import React from 'react';
import { Clock, Package, Truck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { getStatusConfig } from '../utils/formatters';

const StatusBadge = ({ status, size = 'md' }) => {
  const config = getStatusConfig(status);

  const getIcon = () => {
    const iconProps = { className: size === 'sm' ? 'w-3 h-3' : 'w-4 h-4' };
    switch (status) {
      case 'Pending':
        return <Clock {...iconProps} />;
      case 'Packed':
        return <Package {...iconProps} />;
      case 'Out for Delivery':
        return <Truck {...iconProps} />;
      case 'Delivered':
        return <CheckCircle2 {...iconProps} />;
      case 'Cancelled':
        return <XCircle {...iconProps} />;
      default:
        return <AlertCircle {...iconProps} />;
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {getIcon()}
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
