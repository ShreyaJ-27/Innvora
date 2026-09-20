import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { LOCATIONS } from '../components/layout/LocationSelector';
import {
  Bell,
  Warehouse,
  Sliders,
  Globe,
  Shield,
  ChevronRight,
  CheckCircle2,
  Copy,
  MapPin,
  Key,
  Lock,
  UserCheck,
  RefreshCw,
  Server,
  Database,
  ExternalLink,
} from 'lucide-react';

const TABS = [
  { id: 'general', label: 'General', icon: Sliders },
  { id: 'locations', label: 'Fulfillment Hubs', icon: Warehouse },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API & Infrastructure', icon: Globe },
  { id: 'security', label: 'Security & Access', icon: Shield },
];

interface ToggleProps {
  label: string;
  description?: string;
  defaultChecked?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ label, description, defaultChecked = false }) => {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3 border-b border-sand-300 last:border-0">
      <div>
        <p className="text-sm font-medium text-charcoal-800">{label}</p>
        {description && <p className="text-xs text-charcoal-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`w-10 rounded-full relative transition-colors focus:outline-none ${on ? 'bg-charcoal-800' : 'bg-sand-400'}`}
        style={{ minWidth: '40px', height: '22px' }}
      >
        <span
          className="absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform"
          style={{
            width: '18px',
            height: '18px',
            transform: on ? 'translateX(18px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
};

const GeneralTab: React.FC = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      <Card header={<h3 className="text-sm font-semibold text-charcoal-900">Organization Settings</h3>}>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              defaultValue="Innvora Operations"
              className="w-full px-3 py-2 bg-sand-200 border border-sand-400 rounded-lg text-sm text-charcoal-800 focus:outline-none focus:ring-1 focus:ring-charcoal-700"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1">
                Default Currency
              </label>
              <select className="w-full px-3 py-2 bg-sand-200 border border-sand-400 rounded-lg text-sm text-charcoal-700 focus:outline-none">
                <option value="INR">₹ INR — Indian Rupee</option>
                <option value="USD">$ USD — United States Dollar</option>
                <option value="EUR">€ EUR — Euro</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1">
                Timezone
              </label>
              <select className="w-full px-3 py-2 bg-sand-200 border border-sand-400 rounded-lg text-sm text-charcoal-700 focus:outline-none">
                <option>Asia/Kolkata (IST +5:30)</option>
                <option>UTC</option>
                <option>America/New_York (EST)</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            {saved && (
              <span className="text-xs font-semibold text-olive-700 flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-olive-600" /> Preferences saved locally
              </span>
            )}
            <div className="ml-auto">
              <Button variant="primary" size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card header={<h3 className="text-sm font-semibold text-charcoal-900">Replenishment Engine Defaults</h3>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1">
                Default Lead Time (days)
              </label>
              <input
                type="number"
                min="1"
                defaultValue={7}
                className="w-full px-3 py-2 bg-sand-200 border border-sand-400 rounded-lg text-sm text-charcoal-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1">
                Safety Stock Buffer (%)
              </label>
              <input
                type="number"
                min="1"
                defaultValue={20}
                className="w-full px-3 py-2 bg-sand-200 border border-sand-400 rounded-lg text-sm text-charcoal-800 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Defaults
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const LocationsTab: React.FC = () => {
  const hubs = LOCATIONS.filter((l) => l.id !== 'ALL').map((loc) => ({
    ...loc,
    code: loc.id.toUpperCase(),
    sqft: loc.id === 'blr-wh' ? '45,000 sq.ft' : loc.id === 'mum-central' ? '62,000 sq.ft' : loc.id === 'del-hub' ? '54,000 sq.ft' : '38,000 sq.ft',
    manager: loc.id === 'blr-wh' ? 'S. Sharma (Hub Lead)' : loc.id === 'mum-central' ? 'R. Patel (Ops Mgr)' : loc.id === 'del-hub' ? 'A. Verma (Lead)' : 'K. Reddy (Manager)',
    capacity: loc.id === 'blr-wh' ? '82%' : loc.id === 'mum-central' ? '91%' : loc.id === 'del-hub' ? '76%' : '68%',
    tier: 'Primary Tier 1 Hub',
  }));

  return (
    <div className="space-y-5">
      <Card header={<h3 className="text-sm font-semibold text-charcoal-900">Configured Fulfillment Hubs</h3>}>
        <div className="space-y-3">
          {hubs.map((hub) => (
            <div
              key={hub.id}
              className="p-4 rounded-lg border border-sand-400 bg-sand-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-charcoal-700" />
                  <span className="font-bold text-sm text-charcoal-900">{hub.name}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sand-300 border border-sand-400 text-charcoal-700">
                    {hub.code}
                  </span>
                  <span className="text-[10px] font-bold text-olive-700 bg-olive-50 border border-olive-200 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal-500">
                  <span>Region: {hub.city}</span>
                  <span>Footprint: {hub.sqft}</span>
                  <span>Lead: {hub.manager}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-charcoal-400">Capacity</p>
                  <p className="text-sm font-black text-charcoal-900">{hub.capacity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card header={<h3 className="text-sm font-semibold text-charcoal-900">Hub Routing Protocol</h3>}>
        <div className="text-xs text-charcoal-600 leading-relaxed space-y-2">
          <p>
            Innvora dynamically routes replenishment recommendations and stock adjustments based on regional fulfillment clusters. Hub routing priorities are synced directly with your SQS event consumer.
          </p>
          <div className="p-3 bg-sand-200 rounded border border-sand-300 font-mono text-[11px] text-charcoal-700">
            Routing Mode: NEAREST_ACTIVE_DEPOT_WITH_SLA
          </div>
        </div>
      </Card>
    </div>
  );
};

const NotificationsTab: React.FC = () => (
  <Card header={<h3 className="text-sm font-semibold text-charcoal-900">Alert Preferences</h3>}>
    <div className="space-y-0">
      <Toggle
        label="Critical Stockout Alerts"
        description="Notify immediately when a SKU crosses below the critical safety stock threshold."
        defaultChecked={true}
      />
      <Toggle
        label="Reorder Recommendations"
        description="Daily digest of SKUs approaching their calculated reorder point."
        defaultChecked={true}
      />
      <Toggle
        label="Inbound Restock Confirmation"
        description="Confirm when a restock event is processed by SQS and updated in DynamoDB."
        defaultChecked={true}
      />
      <Toggle
        label="Inter-Hub Transfer Activity"
        description="Alert when an inventory transfer between regional fulfillment hubs is initiated."
        defaultChecked={false}
      />
      <Toggle
        label="Overstocked Capacity Warnings"
        description="Notify when a SKU exceeds 200% of maximum modeled inventory."
        defaultChecked={false}
      />
    </div>
  </Card>
);

const ApiTab: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://1d1j9fcft5.execute-api.ap-south-1.amazonaws.com/prod';

  const handleCopy = () => {
    navigator.clipboard.writeText(apiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card header={<h3 className="text-sm font-semibold text-charcoal-900">AWS Infrastructure</h3>}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-olive-800 bg-olive-50 border border-olive-200 px-3 py-2 rounded-md">
            <CheckCircle2 className="w-4 h-4 text-olive-600 shrink-0" />
            <span>Connected to AWS API Gateway (ap-south-1)</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1">
              API Base URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={apiUrl}
                className="flex-1 px-3 py-2 bg-sand-200 border border-sand-400 rounded-lg text-xs font-mono text-charcoal-800 focus:outline-none select-all"
              />
              <Button variant="outline" size="sm" onClick={handleCopy} leftIcon={<Copy className="w-3.5 h-3.5" />}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-sand-300">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-charcoal-700 mb-2">
              Architecture Pipelines
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-sand-200 rounded-lg border border-sand-300">
                <div className="flex items-center gap-2 font-bold text-charcoal-900 mb-1">
                  <Server className="w-3.5 h-3.5 text-charcoal-700" />
                  <span>Ingestion Engine</span>
                </div>
                <p className="text-charcoal-500 text-[11px]">API Gateway → Lambda Ingestion → SQS FIFO Queue</p>
              </div>
              <div className="p-3 bg-sand-200 rounded-lg border border-sand-300">
                <div className="flex items-center gap-2 font-bold text-charcoal-900 mb-1">
                  <Database className="w-3.5 h-3.5 text-charcoal-700" />
                  <span>Storage & Search</span>
                </div>
                <p className="text-charcoal-500 text-[11px]">DynamoDB (State) + OpenSearch Cluster (Search)</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const SecurityTab: React.FC = () => {
  return (
    <div className="space-y-5">
      <Card header={<h3 className="text-sm font-semibold text-charcoal-900">Security & Authentication</h3>}>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-sand-200 border border-sand-300">
            <UserCheck className="w-5 h-5 text-olive-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-charcoal-900">Operational Role: Administrator (Full Access)</p>
              <p className="text-[11px] text-charcoal-500 mt-0.5">
                Session authenticated with IAM-scoped security tokens. Audit trail active for all manual event dispatches.
              </p>
            </div>
          </div>

          <div className="border-t border-sand-300 pt-3 space-y-3">
            <h4 className="text-xs font-bold text-charcoal-800">Access Policies</h4>
            <div className="space-y-2">
              <Toggle
                label="Require Multi-Factor Authentication (MFA)"
                description="Enforce hardware or authenticator app confirmation on dispatching purchase orders."
                defaultChecked={true}
              />
              <Toggle
                label="IP Range Allowlisting"
                description="Restrict control center access to corporate VPN and warehouse subnet ranges."
                defaultChecked={false}
              />
              <Toggle
                label="Immutable Event Ledger Enforcement"
                description="Prevent destructive rollback of recorded inventory movements."
                defaultChecked={true}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card header={<h3 className="text-sm font-semibold text-charcoal-900">Active Sessions</h3>}>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded bg-sand-200 border border-sand-300 text-xs">
            <div>
              <p className="font-bold text-charcoal-800">Current Web Session (Control Center)</p>
              <p className="text-[11px] text-charcoal-500 font-mono">Chrome / Windows • Current IP • Active Now</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-olive-100 text-olive-800 border border-olive-200 font-semibold text-[10px]">
              CURRENT
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const renderTab = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab />;
      case 'locations':
        return <LocationsTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'api':
        return <ApiTab />;
      case 'security':
        return <SecurityTab />;
      default:
        return <GeneralTab />;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        subtitle="Manage your Innvora workspace, regional fulfillment hubs, replenishment engine, and access policies."
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="md:w-56 shrink-0">
          <nav
            className="bg-sand-100 border border-sand-400 rounded-xl overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(39,37,34,0.06)' }}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors border-b border-sand-300 last:border-0 ${
                    activeTab === tab.id
                      ? 'bg-sand-300 text-charcoal-900 font-bold border-l-4 border-l-charcoal-900'
                      : 'text-charcoal-600 hover:bg-sand-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-charcoal-700" />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-charcoal-400" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">{renderTab()}</div>
      </div>
    </PageContainer>
  );
};
