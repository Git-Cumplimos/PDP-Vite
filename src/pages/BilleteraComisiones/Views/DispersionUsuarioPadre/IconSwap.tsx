import React, { MouseEventHandler } from "react";

type Props = {
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
  size?: string;
  colorName: string;
  bootstrapIcon: string;
  bootstrapIconHover: string;
};

const commonClasses = "cursor-pointer";
const defaultClasses = "opacity-100 group-hover:opacity-0";
const onHoverClasses = "absolute inset-0 opacity-0 group-hover:opacity-100";

const IconSwap = ({
  onClick,
  className,
  size = "text-3xl",
  colorName,
  bootstrapIcon,
  bootstrapIconHover,
}: Props) => {
  return (
    <div className={`group relative ${className}`} onClick={onClick}>
      <span
        className={`${size} ${commonClasses} ${colorName} ${defaultClasses} bi bi-${bootstrapIcon}`}
      />
      <span
        className={`${size} ${commonClasses} ${colorName} ${onHoverClasses} bi bi-${bootstrapIconHover}`}
      />
    </div>
  );
};

export default IconSwap;
