import React, { useState, useRef } from 'react';

interface Button {
  id: string; // 按钮的唯一标识
  label: string; // 按钮显示文本
  type: 'click' | 'self-toggle' | 'single-toggle'; // 按钮类型
}

interface Column {
  key: string; // 数据字段的 key
  name: string; // 列名
  width: number; // 列宽
  editable?: boolean; // 是否可编辑
}

interface Data {
  [key: string]: any; // 数据对象
}

export interface ResizableTableProps {
  columns: Column[]; // 列配置
  data: Data[]; // 数据
  buttons?: Button[]; // 操作按钮
  onValueChange?: (rowIndex: number, key: string, value: any) => void; // 值改变回调
  onClickButton?: (rowIndex: number, buttonId: string, isActive?: boolean) => void; // 按钮点击回调
}

const ResizableTable: React.FC<ResizableTableProps> = ({
  columns,
  data,
  buttons = [],
  onValueChange,
  onClickButton,
}) => {
  const [localColumns, setLocalColumns] = useState<Column[]>(columns);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; key: string } | null>(null);
  const [activeToggleIndex, setActiveToggleIndex] = useState<number | null>(null); // 全局唯一 Toggle 的状态
  const tableRef = useRef<HTMLTableElement>(null);

  // 开始调整列宽
  const startResize = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = localColumns[index].width;

    const doResize = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      const newColumns = [...localColumns];
      newColumns[index].width = newWidth;
      setLocalColumns(newColumns);
    };

    const stopResize = () => {
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    };

    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  };

  // 进入编辑模式
  const handleCellDoubleClick = (rowIndex: number, key: string) => {
    const column = localColumns.find((col) => col.key === key);
    if (column?.editable) {
      setEditingCell({ rowIndex, key });
    }
  };

  // 完成编辑
  const handleCellBlur = (rowIndex: number, key: string, value: string) => {
    setEditingCell(null);
    if (onValueChange) {
      onValueChange(rowIndex, key, value);
    }
  };

  // 处理按钮点击事件
  const handleButtonClick = (rowIndex: number, button: Button) => {
    if (!data[rowIndex]._action) {
      data[rowIndex]._action = {}; // 初始化 _action 对象
    }

    let isActive: boolean | undefined;

    if (button.type === 'self-toggle') {
      // 自身 Toggle
      isActive = !data[rowIndex]._action[button.id];
      data[rowIndex]._action[button.id] = isActive;
    } else if (button.type === 'single-toggle') {
      // 全局唯一 Toggle
      isActive = activeToggleIndex !== rowIndex;
      if (isActive) {
        setActiveToggleIndex(rowIndex);
      } else {
        setActiveToggleIndex(null);
      }
      data[rowIndex]._action[button.id] = isActive;
    }

    // 触发按钮点击回调
    if (onClickButton) {
      onClickButton(rowIndex, button.id, isActive);
    }
  };

  return (
    <div className="overflow-auto">
      <table ref={tableRef} className="w-full border-collapse">
        <thead>
          <tr>
            {buttons.length > 0 && ( // 操作列
              <th className="border border-gray-300 p-2 bg-gray-100">Actions</th>
            )}
            {localColumns.map((col, index) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className="relative border border-gray-300 p-2 bg-gray-100"
              >
                {col.name}
                <div
                  className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-gray-400 hover:bg-gray-600"
                  onMouseDown={(e) => startResize(index, e)}
                ></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {buttons.length > 0 && ( // 操作列
                <td className="border border-gray-300 p-2">
                  <div className="flex space-x-2">
                    {buttons.map((button) => (
                      <button
                        key={button.id}
                        onClick={() => handleButtonClick(rowIndex, button)}
                        className={`px-2 py-1 text-xs rounded ${button.type === 'self-toggle' && row._action?.[button.id]
                            ? 'bg-blue-500 text-white'
                            : button.type === 'single-toggle' && activeToggleIndex === rowIndex
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                      >
                        {button.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
              {localColumns.map((col) => (
                <td
                  key={col.key}
                  style={{ width: col.width }}
                  className="border border-gray-300 p-2"
                  onDoubleClick={() => handleCellDoubleClick(rowIndex, col.key)}
                >
                  {editingCell?.rowIndex === rowIndex && editingCell?.key === col.key ? ( // 编辑模式
                    <input
                      type="text"
                      defaultValue={row[col.key]}
                      onBlur={(e) => handleCellBlur(rowIndex, col.key, e.target.value)}
                      className="w-full outline-none"
                      autoFocus
                    />
                  ) : (
                    row[col.key] // 普通单元格
                  )}
                </td>
              ))}

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResizableTable;