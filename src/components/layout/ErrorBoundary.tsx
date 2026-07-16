import i18n from '../../i18n';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router';

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };
  public static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error('Uncaught error:', error, errorInfo); }
  public render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
          <h2 className="text-xl font-bold text-white mb-2">{i18n.t('error.something_went_wrong')}</h2>
          <p className="text-sm text-dark-400 mb-6">{this.state.error?.message || i18n.t('error.page_load_failed')}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => this.setState({ hasError: false, error: null })} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-xl flex items-center gap-2"><RefreshCcw size={16} /> {i18n.t('error.try_again')}</button>
            <Link to="/app" onClick={() => this.setState({ hasError: false, error: null })} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl">{i18n.t('error.go_dashboard')}</Link>
          </div>
        </div>
      </div>
    );
  }
}
