import React from 'react';

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

export default function Button(props: ButtonProps) {
  const {
    children,
    onClick = () => undefined,
    className = '',
    loading = false
  } = props;
  return (
    <button
      onClick={!loading ? onClick : undefined} // 加载时禁用点击事件
      disabled={loading} // 加载时禁用按钮
      className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors relative ${loading ? 'opacity-75 cursor-not-allowed' : ''
        } ${className}`}
    >
      {/* 加载动画 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        </div>
      )}
      {/* 按钮内容 */}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  );
}