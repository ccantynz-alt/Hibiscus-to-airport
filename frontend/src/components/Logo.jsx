import React from 'react';

const Logo = ({ className = "", size = "default" }) => {
  // Size configurations
  const sizeConfig = {
    small: {
      textSize: "text-lg",
      taglineSize: "text-xs",
      gap: "gap-2"
    },
    default: {
      textSize: "text-xl",
      taglineSize: "text-xs",
      gap: "gap-4"
    },
    large: {
      textSize: "text-2xl", 
      taglineSize: "text-sm",
      gap: "gap-4"
    }
  };

  const config = sizeConfig[size] || sizeConfig.default;

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`flex items-center ${config.gap}`}>
        {/* Clean Typography Only */}
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-3">
            <span className={`${config.textSize} font-light text-white tracking-widest uppercase`}>
              Hibiscus
            </span>
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60"></div>
            <span className={`${config.textSize} font-light text-white tracking-widest uppercase`}>
              Airport
            </span>
          </div>
          <div className="mt-1 text-center">
            <span className={`${config.taglineSize} font-medium text-amber-200/80 tracking-[0.25em] uppercase`}>
              Premium Transport
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logo;