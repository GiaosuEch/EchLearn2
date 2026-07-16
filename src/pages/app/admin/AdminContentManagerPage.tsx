import { useState } from 'react';
import { Search, Plus, Shield, Users, Activity, MessageSquare, AlertTriangle, CheckCircle, XCircle, BarChart3, Database } from 'lucide-react';
import PageShell from '../../PageShell';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { MascotCoachCard } from '../../../components/mascot/MascotCoachCard';
import { motion } from 'motion/react';
import BackendHealthPanel from '../../../components/admin/BackendHealthPanel';

export default function AdminContentManagerPage() {
  const tabs = ['Analytics', 'Moderation', 'Content', 'Users'];
  const [activeTab, setActiveTab] = useState('Analytics');
  const hasSupabase = isSupabaseConfigured();

  const renderAnalytics = () => {
    if (!hasSupabase) {
      return (
        <div className="glass-card p-10 text-center flex flex-col items-center justify-center border-dashed border-2 border-dark-700 bg-dark-900/50">
          <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4 text-dark-400">
            <Database size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Connect Supabase for Analytics</h3>
          <p className="text-dark-400 text-sm max-w-sm mx-auto mb-6">Real-time admin analytics require a Supabase backend to track platform-wide user and content data.</p>
          <a href="https://supabase.com" target="_blank" rel="noreferrer" className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors">
            Setup Supabase
          </a>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: '1,245', icon: <Users size={20} className="text-primary-400" /> },
            { label: 'Active Today', value: '432', icon: <Activity size={20} className="text-accent-400" /> },
            { label: 'Total Posts', value: '8,901', icon: <MessageSquare size={20} className="text-blue-400" /> },
            { label: 'Storage', value: '2.4 GB', icon: <Database size={20} className="text-purple-400" /> },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-dark-800 rounded-lg">{stat.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-dark-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2"><BarChart3 size={18} /> User Growth</h3>
          <div className="h-64 flex items-end gap-2">
            {/* Real chart data would go here when connected */}
            {[40, 55, 45, 60, 75, 65, 80, 95, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-primary-500/20 hover:bg-primary-500/40 rounded-t-lg transition-colors relative group" style={{ height: `${h}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {h * 12}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderModeration = () => {
    if (!hasSupabase) {
      return (
        <div className="glass-card p-10 text-center flex flex-col items-center justify-center border-dashed border-2 border-dark-700 bg-dark-900/50">
          <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4 text-dark-400">
            <Shield size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Connect Supabase for Moderation</h3>
          <p className="text-dark-400 text-sm max-w-sm mx-auto mb-6">Community moderation tools require a Supabase backend to manage posts, reports, and users.</p>
          <a href="https://supabase.com" target="_blank" rel="noreferrer" className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors">
            Setup Supabase
          </a>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-4">
          <button className="px-4 py-2 bg-error/20 text-error font-bold rounded-xl text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> Pending Review (12)
          </button>
          <button className="px-4 py-2 bg-dark-800 text-dark-300 font-medium rounded-xl text-sm hover:text-white transition-colors">
            Resolved
          </button>
        </div>

        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card p-5 border-l-4 border-error">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-dark-800 rounded text-xs text-dark-400">Reported Post</span>
                  <span className="text-xs text-dark-500">2 hours ago</span>
                </div>
                <p className="text-white font-medium">"Can someone help me cheat on the IELTS speaking test? I will pay."</p>
                <p className="text-sm text-dark-400 mt-2">Posted by <span className="text-primary-400">@user_{i}492</span> in IELTS Prep</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button className="px-3 py-1.5 bg-error hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors">
                  <XCircle size={14} /> Remove & Warn
                </button>
                <button className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-dark-300 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors">
                  <CheckCircle size={14} /> Ignore
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-dark-800 px-3 py-2 rounded-xl w-64">
          <Search size={16} className="text-dark-500" />
          <input type="text" placeholder="Search content..." className="bg-transparent border-none outline-none text-sm text-dark-300 placeholder-dark-500 w-full" />
        </div>
        <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm flex items-center gap-1 font-bold">
          <Plus size={16} /> Add New Course
        </button>
      </div>
      
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-700 text-left text-dark-400">
            <th className="py-3 px-4 font-medium">Title</th>
            <th className="py-3 px-4 font-medium">Type</th>
            <th className="py-3 px-4 font-medium">Status</th>
            <th className="py-3 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: 1, title: 'IELTS Speaking Part 1', type: 'Course', status: 'Published' },
            { id: 2, title: 'Advanced Grammar', type: 'Course', status: 'Draft' },
            { id: 3, title: 'Vocabulary: Travel', type: 'Lesson', status: 'Published' },
          ].map((item) => (
            <tr key={item.id} className="border-b border-dark-700/50 hover:bg-dark-800/30">
              <td className="py-3 px-4 font-medium text-white">{item.title}</td>
              <td className="py-3 px-4 text-dark-400">{item.type}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.status === 'Published' ? 'bg-success/20 text-success' : 'bg-dark-700 text-dark-400'}`}>
                  {item.status}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <button className="text-primary-400 hover:text-primary-300 text-xs font-bold mr-3">Edit</button>
                <button className="text-error hover:text-red-400 text-xs font-bold">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <PageShell title="Admin Dashboard" description="Manage platform data and moderation" icon={<Shield size={20} />}>
      {!hasSupabase && (
        <div className="mb-6">
          <MascotCoachCard
            type="error"
            title="Database Not Connected"
            message="Admin Panel requires Supabase to manage real users and content. Hiện tại đang hiển thị dữ liệu mẫu."
            actionLabel="View Setup Guide"
            onAction={() => window.open('https://supabase.com/docs', '_blank')}
          />
        </div>
      )}

      <BackendHealthPanel />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'Analytics' && renderAnalytics()}
        {activeTab === 'Moderation' && renderModeration()}
        {activeTab === 'Content' && renderContent()}
        {activeTab === 'Users' && (
          <div className="glass-card p-12 text-center text-dark-400">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>User management view coming soon.</p>
          </div>
        )}
      </motion.div>
    </PageShell>
  );
}
