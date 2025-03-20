import React, { useRef, useState } from 'react';
import { SettingsMenu, SettingsMenuRef } from '@comp/settings-menu';
import { useGlobalState } from '@/lib/hooks/global-state';

type Button = {
  id: string;
  icon?: string;
  label: string;
  onClick?: () => void;
};

export type ButtonGroup = {
  group: string;
  buttons: Button[];
  showSelection?: boolean; // 是否显示选中状态
};

type SelectedButtons = {
  [group: string]: string;
};

export default function Toolbar({ buttonGroups }: { buttonGroups: ButtonGroup[] }) {
  const [selectedButtons, setSelectedButtons] = useState<SelectedButtons>({
    scene: 'move',
  });
  const [isExpanded, setIsExpanded] = useState(true); // 控制展开和收缩

  const handleButtonClick = (group: string, buttonId: string, onClick?: () => void) => {
    setSelectedButtons((prev) => ({
      ...prev,
      [group]: buttonId,
    }));
    onClick?.();
  };

  return (
    <>
      <div className={`fixed bottom-2 left-0 p-1 rounded-r-lg rounded-br-lg 
      flex items-center space-x-1 z-50 ${isExpanded ? 'bg-gray-100' : 'bg-gray-300/25'}`}>
        {buttonGroups.map((groupConfig, index) => (
          <React.Fragment key={groupConfig.group}>
            <div className={`flex ${isExpanded ? 'space-x-1' : 'space-x-0'} opacity-75`}>
              {groupConfig.buttons
                .map((button, i) => {
                  const show = isExpanded || button.id === 'pause';
                  return (
                    <button
                      key={button.id}
                      className={`py-1 rounded-lg relative group transition-width duration-300 ease-in-out
                    ${show ? 'px-1 w-auto' : 'px-0 w-0'}
                    ${groupConfig.showSelection && selectedButtons[groupConfig.group] === button.id
                          ? 'bg-blue-300/50 text-white'
                          : 'text-gray-700 hover:bg-gray-300/50'
                        }`}
                      onClick={() => handleButtonClick(groupConfig.group, button.id, button.onClick)}
                    >
                      {show ? button.icon ? (
                        <img src={button.icon} alt={button.label} className="w-6 h-6" />
                      ) : (
                        <span>{button.label}</span>
                      ) : null}
                      { // Tooltip
                        button.icon && <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1
                   bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100">
                          {button.label}
                        </span>}
                    </button>
                  )
                })}
            </div>
            {isExpanded && index < buttonGroups.length - 1 && <div className="h-6 w-px bg-gray-300" />}
          </React.Fragment>
        ))}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg hover:bg-gray-200"
        >
          {isExpanded ? '«' : '»'}
        </button>
      </div>
    </>
  );
}