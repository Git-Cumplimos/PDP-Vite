import classes from "./Table.module.css";

const Table = ({ headers, data, onSelectRow }) => {
  const { table } = classes;
  return (
    <table className={table}>
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
