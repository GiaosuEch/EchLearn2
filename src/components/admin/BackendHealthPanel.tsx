import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { CheckCircle2, Activity, Server, Database, ShieldAlert, Key } from 'lucide-react';

export default function BackendHealthPanel() {
  const { user } = useAuthStore();
  const [readStatus, setReadStatus] = useState<'pending' | 'success' | 'fail'>('pending');
  const [writeStatus, setWriteStatus] = useState<'pending' | 'success' | 'fail'>('pending');
  
  useEffect(() => {
    const sb = supabase;
    if (!isSupabaseConfigured() || !sb) {
      setReadStatus('fail');
      setWriteStatus('fail');
      return;
    }

    const testConnection = async () => {
      try {
        // Read test
        const { error: readError } = await sb.from('study_groups').select('id').limit(1);
        setReadStatus(readError ? 'fail' : 'success');

        // Write test - only if logged in, test by writing an admin_activity_log if admin, 
        // or just update profile last_seen if we have a user
        if (user) {
          const { error: writeError } = await sb.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', user.id);
          setWriteStatus(writeError ? 'fail' : 'success');
        } else {
          setWriteStatus('fail'); // Need auth for most writes
        }
      } catch (err) {
        setReadStatus('fail');
        setWriteStatus('fail');
      }
    };

    testConnection();
  }, [user]);

  const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
  const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center">
          <Activity size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Backend Health Status</h2>
          <p className="text-sm text-dark-400">Diagnostic panel for Supabase integration</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatusItem 
          icon={<Server size={18} />} 
          label="Data Mode" 
          value={isSupabaseConfigured() ? 'Supabase Live' : 'Local Storage'} 
          status={isSupabaseConfigured() ? 'success' : 'warning'} 
        />
        <StatusItem 
          icon={<Key size={18} />} 
          label="Supabase URL / Key" 
          value={hasUrl && hasKey ? 'Configured' : 'Missing'} 
          status={hasUrl && hasKey ? 'success' : 'fail'} 
        />
        <StatusItem 
          icon={<ShieldAlert size={18} />} 
          label="Auth Session" 
          value={user ? 'Active' : 'Not Logged In'} 
          status={user ? 'success' : 'warning'} 
        />
        <StatusItem 
          icon={<Database size={18} />} 
          label="Profile Loaded" 
          value={user ? 'Yes' : 'No'} 
          status={user ? 'success' : 'warning'} 
        />
        <StatusItem 
          icon={<CheckCircle2 size={18} />} 
          label="Last Read Test" 
          value={readStatus === 'pending' ? 'Testing...' : readStatus === 'success' ? 'Success' : 'Failed'} 
          status={readStatus} 
        />
        <StatusItem 
          icon={<CheckCircle2 size={18} />} 
          label="Last Write Test" 
          value={writeStatus === 'pending' ? 'Testing...' : writeStatus === 'success' ? 'Success' : 'Failed (Auth req)'} 
          status={writeStatus} 
        />
      </div>
    </div>
  );
}

function StatusItem({ icon, label, value, status }: { icon: React.ReactNode, label: string, value: string, status: 'success' | 'fail' | 'warning' | 'pending' }) {
  const colors = {
    success: 'text-green-400 bg-green-500/10 border-green-500/20',
    fail: 'text-red-400 bg-red-500/10 border-red-500/20',
    warning: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    pending: 'text-dark-400 bg-dark-800 border-dark-700'
  };

  const currentColors = colors[status];

  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between ${currentColors}`}>
      <div className="flex items-center gap-3">
        <div className="opacity-80">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}
