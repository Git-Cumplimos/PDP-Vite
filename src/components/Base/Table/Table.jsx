import classes from "./Table.module.css";

const Table = ({ headers, data, onSelectRow, className = "", ...tableAtt }) => {
  const { table } = classes;
  return (
    <table className={`${table} ${className}`} {...tableAtt}>
      <thead>
        <tr>
          {headers.map((name, index) => {
            return <th key={index}>{name}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {data.map((obj, index) => {
          return (
            <tr
              key={index}
              onClick={
                onSelectRow !== undefined ? (e) => onSelectRow(e, index) : null
              }
            >
              {Object.entries(obj).map(([key, value]) => {
                return (
                  <td
                    key={`${key}_${index}`}
                    style={{
                      cursor: onSelectRow !== undefined ? "pointer" : "initial",
                      whiteSpace: "pre",
                    }}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
