import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Bell, Warehouse, Sliders, Globe, Shield, ChevronRight, CheckCircle2
} from 'lucide-react';

const TABS = [
  { id: 'general', label: 'General', icon: Sliders },
  { id: 'locations', label: 'Locations', icon: Warehouse },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API & Access', icon: Globe },
  { id: 'security', label: 'Security', icon: Shield },
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
        className={`w-10 h-5.5 rounded-full relative transition-colors focus:outline-none ${on ? 'bg-charcoal-800' : 'bg-sand-400'}`}
        style={{ minWidth: '40px', height: '22px' }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform"
          style={{
            width: '18px', height: '18px',
            transform: on ? 'translateX(18px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
};

const GeneralTab: React.FC = () => (
  <div className="space-y-5">
    <Card header={<h3 className="text-sm font-semibold text-charcoal-900">Organization Settings</h3>}>
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1">Organization Name</label>
          <input
            type="text"
            defaultValue="Central Logistics Ops"
            className="w-full px-3 py-2 bg-sand-200 border border-sand-400 rounded-lg text-sm text-charcoal-800 focus:outline-none focus:ring-1 focus:ring-charcoal-700"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1">Default Currency</label>
          <select className="w-full px-3 py-2 bg-sand-200 border border-sand-400 rounded-lg text-sm text-charcoal-700 focus:outline-none">
            <option value="INR">₹ INR — Indian Rupee</option>
            <option value="USD">$ USD — United States Dollar</option>
            <option value="EUR">€ EUR — Euro</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1">Timezone</label>
          <select className="w-full px-3 py-2 bg-sand-200 border border-sand-400 rounded-lg text-sm text-charcoal-700 focus:outline-none">
            <option>Asia/Kolkata (IST +5:30)</option>
            <option>UTC</option>
            <option>America/New_York</option>
          </select>
        </div>
        <div className="flex justify-end">
          <Button variant="primary" size="sm">Save Changes</Button>
        </div>
      </div>
    </Card>

    <Card header={<h3 className="text-sm font-semibold text-charcoal-900">Replenishment Defaults</h3>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1">Default Lead Time (days)</label>
            <input type="number" min="1" defaultValue={7} className="w-full px-3 py-2 bg-sand-200 border border-sand-400 rounded-lg text-sm text-charcoal-800 focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1">Default Safety Stock Buffer</label>
            <input type="number" min="1" defaultValue={20} className="w-full px-3 py-2 bg-sand-200 border border-sand-400 rounded-lg text-sm text-charcoal-800 focus:outline-none" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="primary" size="sm">Save Defaults</Button>
        </div>
      </div>
    </Card>
  </div>
);

const NotificationsTab: React.FC = () => (
  <Card header={<h3 className="text-sm font-semibold text-charcoal-900">Alert Preferences</h3>}>
    <div className="space-y-0">
      <Toggle label="Critical Stockout Alerts" description="Notify when a SKU crosses the critical stock threshold." defaultChecked={true} />
      <Toggle label="Reorder Recommendations" description="Daily digest of SKUs approaching the reorder point." defaultChecked={true} />
      <Toggle label="Inbound Restock Confirmation" description="Confirm when a restock event is processed and reflected in stock." defaultChecked={false} />
      <Toggle label="Transfer Activity Notifications" description="Alert when an inter-location stock transfer is initiated." defaultChecked={false} />
      <Toggle label="Overstocked Warnings" description="Notify when a SKU exceeds 200% of its safety stock." defaultChecked={false} />
    </div>
  </Card>
);

const ApiTab: React.FC = () => (
  <div className="space-y-4">
    <Card header={<h3 className="text-sm font-semibold text-charcoal-900">Live Backend</h3>}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-charcoal-600">
          <CheckCircle2 className="w-4 h-4 text-olive-500" />
          <span>Connected to AWS API Gateway</span>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1">API Base URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={import.meta.env.VITE_API_BASE_URL || 'https://1d1j9fcft5.execute-api.ap-south-1.amazonaws.com/prod'}
              className="flex-1 px-3 py-2 bg-sand-200 border border-sand-400 rounded-lg text-sm font-mono text-charcoal-700 focus:outline-none"
            />
            <Button variant="outline" size="sm">Copy</Button>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1">Stack</label>
          <p className="text-xs text-charcoal-600 font-mono">AWS Lambda → SQS → DynamoDB → OpenSearch</p>
        </div>
      </div>
    </Card>
  </div>
);

const PlaceholderTab: React.FC<{ name: string }> = ({ name }) => (
  <Card>
    <div className="py-10 text-center">
      <p className="text-sm font-medium text-charcoal-700">{name} settings</p>
      <p className="text-xs text-charcoal-400 mt-1">This panel is not yet connected to a backend configuration endpoint.</p>
    </div>
  </Card>
);

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const renderTab = () => {
    switch (activeTab) {
      case 'general': return <GeneralTab />;
      case 'notifications': return <NotificationsTab />;
      case 'api': return <ApiTab />;
      default: return <PlaceholderTab name={TABS.find(t => t.id === activeTab)?.label || ''} />;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        subtitle="Manage your Innvora workspace, replenishment defaults, and notification preferences."
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="md:w-52 shrink-0">
          <nav className="bg-sand-100 border border-sand-400 rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(39,37,34,0.06)' }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors border-b border-sand-300 last:border-0 ${
                    activeTab === tab.id
                      ? 'bg-sand-300 text-charcoal-900 font-semibold'
                      : 'text-charcoal-600 hover:bg-sand-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-charcoal-400" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {renderTab()}
        </div>
      </div>
    </PageContainer>
  );
};
