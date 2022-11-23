import PropTypes from "prop-types";
import classes from "./TagsAlongSide.module.css";

const { buttonTag } = classes;

const TagsAlongSide = ({ data = [], onSelect = () => {} }) => {
  return (
    <div>
      {data.map((element, index) => (
        <button
          className={buttonTag}
          key={index}
          onClick={onSelect ? (e) => onSelect(e, index) : null}>
          {element}
          <label className='bi bi-x pointer-events-auto'></label>
        </button>
      ))}
    </div>
  );
};

TagsAlongSide.propTypes = {
  data: PropTypes.array,
  onSelect: PropTypes.func,
};

export default TagsAlongSide;
