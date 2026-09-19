import { InventoryStatus } from '../types/inventory';
import { InventoryEventType } from '../types/events';
import { ReorderUrgency } from '../types/reorder';

export interface StatusStyle {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  chartColor: string;
}

export const STATUS_CONFIG: Record<InventoryStatus, StatusStyle> = {
  HEALTHY: {
    label: 'Healthy',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    chartColor: '#10b981', // emerald-500
  },
  REORDER_SOON: {
    label: 'Reorder Soon',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    dotColor: 'bg-amber-500',
    chartColor: '#f59e0b', // amber-500
  },
  CRITICAL: {
    label: 'Critical',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    dotColor: 'bg-rose-500',
    chartColor: '#ef4444', // rose-500
  },
  OVERSTOCKED: {
    label: 'Overstocked',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    dotColor: 'bg-indigo-500',
    chartColor: '#6366f1', // indigo-500
  },
};

export const URGENCY_CONFIG: Record<ReorderUrgency, StatusStyle> = {
  CRITICAL: {
    label: 'Critical',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    dotColor: 'bg-rose-500',
    chartColor: '#ef4444',
  },
  REORDER_SOON: {
    label: 'Reorder Soon',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    dotColor: 'bg-amber-500',
    chartColor: '#f59e0b',
  },
  HEALTHY: {
    label: 'Healthy',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    chartColor: '#10b981',
  },
  OVERSTOCKED: {
    label: 'Overstocked',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    dotColor: 'bg-indigo-500',
    chartColor: '#6366f1',
  },
};

export interface EventTypeStyle {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconColor: string;
}

export const EVENT_TYPE_CONFIG: Record<InventoryEventType, EventTypeStyle> = {
  SALE: {
    label: 'Sale',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    iconColor: 'text-rose-600',
  },
  RESTOCK: {
    label: 'Restock',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    iconColor: 'text-emerald-600',
  },
  RETURN: {
    label: 'Customer Return',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    iconColor: 'text-emerald-600',
  },
  TRANSFER_IN: {
    label: 'Transfer In',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    iconColor: 'text-blue-600',
  },
  TRANSFER_OUT: {
    label: 'Transfer Out',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    iconColor: 'text-blue-600',
  },
  ADJUSTMENT: {
    label: 'Cycle Count / Adj',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    iconColor: 'text-amber-600',
  },
};
