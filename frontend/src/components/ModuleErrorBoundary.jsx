import React from 'react';
import { AlertTriangle, RotateCcw, LayoutGrid } from 'lucide-react';

export default class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Module Error Boundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-3xl border border-rose-200 shadow-md p-8 text-center space-y-4 my-6 max-w-xl mx-auto">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">
              Module Encountered an Issue
            </h3>
            <p className="text-xs text-slate-500">
              {this.state.error?.message || 'An unexpected error occurred while loading this section.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry / Reload</span>
            </button>
            {this.props.onBackToMenu && (
              <button
                type="button"
                onClick={this.props.onBackToMenu}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Go to Menu</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
