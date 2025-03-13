interface InputFieldProps {
  label?: string; // 输入框的标签
  defaultValue?: any; // 默认值
  value?: any; // 当前值
  onChange?: (value: string) => void; // 值变化时的回调函数
  showReset?: boolean; // 是否显示 Reset 按钮
}

export default function InputField({
  label = '',
  defaultValue = '',
  value = '',
  onChange = () => undefined,
  showReset = false, // 默认不显示 Reset 按钮
}: InputFieldProps) {
  // 重置为默认值
  const handleReset = () => {
    onChange(defaultValue);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {showReset && (
          <button
            onClick={handleReset}
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}