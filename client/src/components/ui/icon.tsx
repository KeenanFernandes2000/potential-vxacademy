import React from "react";

interface IconProps {
  Component: React.ComponentType<any>;
  size?: number;
  color?: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({
  Component,
  size = 24,
  color = "currentColor",
  className = "",
}) => {
  return (
    <Component
      style={{
        fontSize: size,
        color: color,
      }}
      className={className}
    />
  );
};

export default Icon;
