import classes from "./Card.module.css";

const Card = ({ children, className }) => {
  const { Card } = classes;
  return <div className={`${Card} ${className ?? ""}`}>{children}</div>;
};

export default Card;
