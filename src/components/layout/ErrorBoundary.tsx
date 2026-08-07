import i18n from '../../i18n';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router';

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Auto-reload once on stale chunk import errors after a build deployment
    const isChunkError = error?.message?.includes('Failed to fetch dynamically imported module') ||
                         error?.message?.includes('Importing a module script failed') ||
                         error?.name === 'ChunkLoadError';
                         
    if (isChunkError && typeof window !== 'undefined') {
      const storageKey = 'echlearn_chunk_reload_retry';
      const lastRetry = sessionStorage.getItem(storageKey);
      if (!lastRetry) {
        sessionStorage.setItem(storageKey, 'true');
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">{i18n.t('error.something_went_wrong', { defaultValue: 'Đã xảy ra lỗi' })}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {this.state.error?.message || i18n.t('error.page_load_failed', { defaultValue: 'Tải trang không thành công.' })}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <RefreshCcw size={15} /> Tải Lại Trang
            </button>
            <Link
              to="/app"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl text-xs transition-colors"
            >
              Bảng Điều Khiển
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
