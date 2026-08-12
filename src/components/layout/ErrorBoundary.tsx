import i18n from '../../i18n';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Link } from 'react-router';
import EchBuriAnimated from '../mascot/EchBuriAnimated';
import { platformEventBus } from '../../services/platformEventBus';

type ErrorCategory = 'chunk' | 'network' | 'auth' | 'render' | 'data' | 'unknown';

function classifyRenderError(error: Error): ErrorCategory {
  const msg = error?.message?.toLowerCase() ?? '';
  const name = error?.name?.toLowerCase() ?? '';

  if (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    name === 'chunkloaderror'
  )
    return 'chunk';

  if (msg.includes('fetch') || msg.includes('network') || msg.includes('econnrefused'))
    return 'network';

  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('session'))
    return 'auth';

  if (msg.includes('json') || msg.includes('parse') || msg.includes('undefined is not'))
    return 'data';

  return 'render';
}

function getRecoveryHint(category: ErrorCategory): string {
  switch (category) {
    case 'chunk':
      return i18n.t('error.chunk_hint', {
        defaultValue: 'Ứng dụng vừa được cập nhật. Tải lại trang để nhận phiên bản mới.',
      });
    case 'network':
      return i18n.t('error.network_hint', {
        defaultValue: 'Không thể kết nối mạng. Kiểm tra kết nối và thử lại.',
      });
    case 'auth':
      return i18n.t('error.auth_hint', {
        defaultValue: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      });
    case 'data':
      return i18n.t('error.data_hint', {
        defaultValue: 'Dữ liệu không hợp lệ. Vui lòng thử lại hoặc quay về trang chính.',
      });
    default:
      return i18n.t('error.render_hint', {
        defaultValue: 'Tải trang không thành công. Thử tải lại hoặc quay về bảng điều khiển.',
      });
  }
}

interface Props { children: ReactNode }
interface State {
  hasError: boolean;
  error: Error | null;
  category: ErrorCategory;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null, category: 'unknown', errorCount: 0 };

  private lastErrorMessage = '';
  private lastErrorTime = 0;

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, category: classifyRenderError(error) };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const now = Date.now();
    const isDuplicate =
      error.message === this.lastErrorMessage && now - this.lastErrorTime < 3000;
    this.lastErrorMessage = error.message;
    this.lastErrorTime = now;

    if (isDuplicate) return;

    const category = classifyRenderError(error);

    console.error('Uncaught error:', error, errorInfo);

    platformEventBus.emit('error:boundary-caught', {
      category,
      errorName: error.name,
      componentStack: errorInfo.componentStack
        ? errorInfo.componentStack.slice(0, 200)
        : 'unavailable',
    });

    this.setState((prev) => ({ errorCount: prev.errorCount + 1 }));

    if (category === 'chunk' && typeof window !== 'undefined') {
      const storageKey = 'echlearn_chunk_reload_retry';
      const lastRetry = sessionStorage.getItem(storageKey);
      if (!lastRetry) {
        sessionStorage.setItem(storageKey, 'true');
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null, category: 'unknown' });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, category: 'unknown' });
  };

  public render() {
    if (!this.state.hasError) return this.props.children;

    const { category } = this.state;
    const mascotState = category === 'network' ? 'thinking' : 'thinking';
    const hint = getRecoveryHint(category);
    const showLoginButton = category === 'auth';

    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="mx-auto mb-4 grid h-28 w-28 place-items-center rounded-3xl bg-emerald-50 dark:bg-emerald-500/10">
            <EchBuriAnimated size={104} state={mascotState} />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">{i18n.t('error.something_went_wrong', { defaultValue: 'Đã xảy ra lỗi' })}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {hint}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <RefreshCcw size={15} /> Tải Lại Trang
            </button>
            {showLoginButton ? (
              <Link
                to="/login"
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl text-xs transition-colors"
              >
                Đăng Nhập Lại
              </Link>
            ) : (
              <Link
                to="/app"
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl text-xs transition-colors"
              >
                Bảng Điều Khiển
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }
}

