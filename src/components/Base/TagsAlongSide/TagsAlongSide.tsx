import { MouseEvent } from "react";

type Props = {
  data: Array<string>;
  onSelect?: (_: MouseEvent<HTMLSpanElement>, __: number) => void;
};

const TagsAlongSide = ({ data, onSelect }: Props) => {
  return (
    <div className="flex justify-center flex-wrap gap-4">
      {data.map((element, index) => (
        <button
          type="button"
          className="rounded-md bg-primary-light px-4 py-2 my-2 text-base text-white"
          title={element}
          key={index}
        >
          {element} &nbsp;&nbsp;
          <span
            className="bi bi-x-lg pointer-events-auto"
            onClick={(ev) => onSelect?.(ev, index)}
          />
        </button>
      ))}
    </div>
  );
};

export default TagsAlongSide;
