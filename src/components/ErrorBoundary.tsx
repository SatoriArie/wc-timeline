import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message: string;
}

/** Ловит ошибки рендера, чтобы один сбойный раздел не ронял весь сайт. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Сбой раздела:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="boundary">
          <div className="boundary-card">
            <span className="rune-symbol">✦</span>
            <h2>Письмена смазались</h2>
            <p>Произошла ошибка при отображении этого раздела.</p>
            <code>{this.state.message}</code>
            <button className="icon-btn active" onClick={() => location.reload()}>
              Перезагрузить хроники
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
