import React, { MouseEvent, ReactNode } from "react";
import classes from "./DataTable.module.css";

const { iconBtn } = classes;

type Props = {
  onClickPrev: (ev: MouseEvent<HTMLSpanElement>) => void;
  onClickNext: (ev: MouseEvent<HTMLSpanElement>) => void;
  children?: ReactNode;
};

const PaginationButtons = ({ onClickPrev, onClickNext, children }: Props) => {
  return (
    <div className="flex flex-row gap-6 items-center">
      {children}
      <div className="flex flex-row gap-2 items-center">
        <span
          className={`bi bi-chevron-left ${iconBtn}`}
          onClick={onClickPrev}
        />
        <span
          className={`bi bi-chevron-right ${iconBtn}`}
          onClick={onClickNext}
        />
      </div>
    </div>
  );
};

export default PaginationButtons;
