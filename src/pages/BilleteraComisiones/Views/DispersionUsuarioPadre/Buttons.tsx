import React, { MouseEventHandler } from "react";

type Props = {
  type: "plus" | "dash";
  callback?: MouseEventHandler<HTMLButtonElement>;
};

const DispersionButtons = ({ type, callback }: Props) => {
  return (
    <div className="flex flex-col justify-center content-center max-w-xs text-center my-4 mx-auto md:mx-4">
      <button
        type="button"
        className={`p-2 ${
          type === "plus" ? "bg-primary" : "bg-secondary-dark"
        } text-white rounded-full`}
        onClick={callback}
      >
        <span className={`bi bi-${type} text-4xl font-bold block w-10 h-10`} />
      </button>
    </div>
  );
};

export default DispersionButtons;
