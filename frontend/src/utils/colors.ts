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
  dotClass: string;
}

// Innvora warm status palette — restrained, operational
export const STATUS_CONFIG: Record<InventoryStatus, StatusStyle> = {
  HEALTHY: {
    label: 'Healthy',
    badgeBg: 'bg-olive-50',
    badgeText: 'text-olive-700',
    badgeBorder: 'border-olive-200',
    dotColor: 'bg-olive-500',
    dotClass: 'bg-olive-400',
    chartColor: '#7A9E5D', // muted sage green
  },
  REORDER_SOON: {
    label: 'Reorder Soon',
    badgeBg: 'bg-terracotta-50',
    badgeText: 'text-terracotta-700',
    badgeBorder: 'border-terracotta-200',
    dotColor: 'bg-terracotta-400',
    dotClass: 'bg-terracotta-400',
    chartColor: '#C6745A', // warm terracotta
  },
  CRITICAL: {
    label: 'Critical',
    badgeBg: 'bg-terracotta-100',
    badgeText: 'text-terracotta-800',
    badgeBorder: 'border-terracotta-300',
    dotColor: 'bg-terracotta-600',
    dotClass: 'bg-terracotta-600',
    chartColor: '#8E4530', // dark rust
  },
  OVERSTOCKED: {
    label: 'Overstocked',
    badgeBg: 'bg-sand-100',
    badgeText: 'text-charcoal-600',
    badgeBorder: 'border-sand-400',
    dotColor: 'bg-charcoal-400',
    dotClass: 'bg-charcoal-400',
    chartColor: '#A89580', // warm stone
  },
};

export const URGENCY_CONFIG: Record<ReorderUrgency, StatusStyle> = {
  CRITICAL: {
    label: 'Critical',
    badgeBg: 'bg-terracotta-100',
    badgeText: 'text-terracotta-800',
    badgeBorder: 'border-terracotta-300',
    dotColor: 'bg-terracotta-600',
    dotClass: 'bg-terracotta-600',
    chartColor: '#8E4530',
  },
  REORDER_SOON: {
    label: 'Reorder Soon',
    badgeBg: 'bg-terracotta-50',
    badgeText: 'text-terracotta-700',
    badgeBorder: 'border-terracotta-200',
    dotColor: 'bg-terracotta-400',
    dotClass: 'bg-terracotta-400',
    chartColor: '#C6745A',
  },
  HEALTHY: {
    label: 'Healthy',
    badgeBg: 'bg-olive-50',
    badgeText: 'text-olive-700',
    badgeBorder: 'border-olive-200',
    dotColor: 'bg-olive-400',
    dotClass: 'bg-olive-400',
    chartColor: '#7A9E5D',
  },
  OVERSTOCKED: {
    label: 'Overstocked',
    badgeBg: 'bg-sand-100',
    badgeText: 'text-charcoal-600',
    badgeBorder: 'border-sand-400',
    dotColor: 'bg-charcoal-400',
    dotClass: 'bg-charcoal-400',
    chartColor: '#A89580',
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
    badgeBg: 'bg-terracotta-50',
    badgeText: 'text-terracotta-700',
    badgeBorder: 'border-terracotta-200',
    iconColor: 'text-terracotta-600',
  },
  RESTOCK: {
    label: 'Restock',
    badgeBg: 'bg-olive-50',
    badgeText: 'text-olive-700',
    badgeBorder: 'border-olive-200',
    iconColor: 'text-olive-600',
  },
  RETURN: {
    label: 'Return',
    badgeBg: 'bg-olive-50',
    badgeText: 'text-olive-700',
    badgeBorder: 'border-olive-200',
    iconColor: 'text-olive-600',
  },
  TRANSFER_IN: {
    label: 'Transfer In',
    badgeBg: 'bg-sand-200',
    badgeText: 'text-charcoal-700',
    badgeBorder: 'border-sand-400',
    iconColor: 'text-charcoal-600',
  },
  TRANSFER_OUT: {
    label: 'Transfer Out',
    badgeBg: 'bg-sand-200',
    badgeText: 'text-charcoal-600',
    badgeBorder: 'border-sand-400',
    iconColor: 'text-charcoal-500',
  },
  ADJUSTMENT: {
    label: 'Adjustment',
    badgeBg: 'bg-sand-100',
    badgeText: 'text-charcoal-600',
    badgeBorder: 'border-sand-400',
    iconColor: 'text-charcoal-500',
  },
};
