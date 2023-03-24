import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Form from "../../../components/Base/Form";
import classes from "./TableVertical.module.css";

const {
  tableVertical,
  tooling,
  iconBtn,
  filterDiv,
  wrapper,
  staticBar,
  limitsBtn,
} = classes;

const TableVertical = ({
  title = "Titulo tabla",
  headers = ["Header 1", "Header 2"],
  data = [
    [1, 2],
    ["a", "b"],
  ],
  onSelectRow = null,
  maxPage = 1,
  onChange = () => {},
  onSubmit = (e) => e.preventDefault(),
  onSetPageData = () => {},
  onSetUtilsFuncs = () => {},
  children = null,
  actions = {}
}) => {
  const [showFilters, setShowFilters] = useState(true);

  const [{ page, limit }, setPaginationData] = useState({ page: 1, limit: 15 });

  useEffect(() => {
    data.forEach((val) => {
      const objtemp = Array.isArray(val) ? val : Object.entries(val);
      if (headers.length !== objtemp.length) {
        console.error(headers, objtemp);
        throw new Error("Bad 'data' format, wrong count columns in data row");
      }
    });
  }, [headers, data]);

  const sortedData = useMemo(
    () =>
      data.map((obj) =>
        Array.isArray(obj)
          ? obj.map((value, key) => [key, value])
          : Object.entries(obj)
      ),
    [data]
  );



  return (
    <div className={`${wrapper}`}>
      <div className={`grid grid-cols-12 rounded-t-md ${staticBar}`}>
        <div className="col-start-2 col-span-6 text-left text-2xl">{title}</div>
   

      </div>

      <div className="overflow-x-auto">
        <table className={`${tableVertical}`}>
          <thead>
            <tr>
              {headers.map((name, index) => {
                return (
                  <th
                    key={index}
                  >
                    <div className="flex flex-row justify-center">
                      <div >{name}</div>
                    </div>
                  </th>
                );
              })}
            </tr>
           
          </thead>
          <tbody>
            {!sortedData?.length ? (
              <tr>
                <td colSpan={headers?.length}>No hay datos</td>
              </tr>
            ) : (
              sortedData.map((obj, index) => (
                <tr
                  key={index}
                  onClick={onSelectRow ? (e) => onSelectRow(e, index) : null}
                >
                  {obj.map(([key, value], idx) => {
                
                   if(key=="clave"){
                    return (
                      <td
                        key={`${key}_${index}`}
                        className={`${
                          onSelectRow ? "cursor-pointer" : "cursor-auto"
                        } whitespace-pre z-0 text-right text-base font-medium`}
                      >
                        {value}
                      </td>
                    );}
                    else{
                        return (
                            <td
                              key={`${key}_${index}`}
                              className={`${
                                onSelectRow ? "cursor-pointer" : "cursor-auto"
                              } whitespace-pre z-0 text-left`}
                            >
                              {value}
                            </td>
                          );  
                    }
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div
        className={`flex flex-row justify-between gap-2 rounded-b-md ${staticBar}`}
      >
        <select
          name="limits"
          className={`5 appearance-none`}
        >

        </select>
    
      </div>
    </div>
  );
};

TableVertical.propTypes = {
  title: PropTypes.string.isRequired,
  headers: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.array])
  ),
  onSelectRow: PropTypes.func,
  maxPage: PropTypes.number,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  onSetPageData: PropTypes.func,
  children: PropTypes.any,
};

export default TableVertical;