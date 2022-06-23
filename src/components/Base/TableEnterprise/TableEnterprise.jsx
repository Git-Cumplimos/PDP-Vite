import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Form from "../Form";
import classes from "./TableEnterprise.module.css";

const {
  tableEnterprise,
  tooling,
  iconBtn,
  filterDiv,
  wrapper,
  staticBar,
  limitsBtn,
  slidersBtn,
  menuOthers,
} = classes;

const TableEnterprise = ({
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
}) => {
  const [showFilters, setShowFilters] = useState(true);
  const [showHidden, setShowHidden] = useState(false);
  const [tableOpts, setTableOpts] = useState([]);

  const [{ page, limit }, setPaginationData] = useState({ page: 1, limit: 10 });

  useEffect(() => {
    data.forEach((val) => {
      const objtemp = Array.isArray(val) ? val : Object.entries(val);
      if (headers.length !== objtemp.length) {
        console.error(headers, objtemp);
        throw new Error("Bad 'data' format, wrong count columns in data row");
      }
    });
  }, [headers, data]);

  const sortedData = useMemo(() => {
    const newData = data.map((obj) =>
      Array.isArray(obj)
        ? obj.map((value, key) => [key, value])
        : Object.entries(obj)
    );
    if (
      !tableOpts
        .map(({ sort: { state } }) => state)
        .reduce((prev, curr) => prev || curr, false)
    ) {
      return newData;
    }
    const sorted = [
      ...newData.sort((a, b) => {
        const sortRet = [];
        for (const ind in tableOpts) {
          const { state, dir } = tableOpts?.[ind]?.sort;
          if (state) {
            const temp1 = dir ? a[ind][1] : b[ind][1];
            const temp2 = dir ? b[ind][1] : a[ind][1];
            sortRet.push(
              temp1 instanceof Number
                ? temp1 - temp2
                : temp1.localeCompare(temp2)
            );
          }
        }
        return sortRet.reduce((prev, curr) => prev || curr, false);
      }),
    ];
    return sorted;
  }, [data, tableOpts]);

  useEffect(() => {
    onSetPageData({ page, limit });
  }, [onSetPageData, page, limit]);

  useEffect(() => {
    if (headers.length !== tableOpts.length) {
      const temp = [
        ...headers.map(() => ({
          hide: false,
          sort: { state: false, dir: false },
        })),
      ];
      setTableOpts([...temp]);
    }
  }, [headers, tableOpts]);

  useEffect(() => {
    if (maxPage < page) {
      setPaginationData(({ limit }) => ({ limit, page: 1 }));
    }
  }, [maxPage, page]);

  useEffect(() => {
    onSetUtilsFuncs({
      resetPage: () => setPaginationData(({ limit }) => ({ limit, page: 1 })),
    });
  }, [onSetUtilsFuncs]);

  return (
    <div className={`${wrapper}`}>
      <div className={`grid grid-cols-12 rounded-t-md ${staticBar}`}>
        <div className="col-start-2 col-span-3 text-left text-2xl">{title}</div>
        <div className="col-span-6"></div>
        <div className={`${tooling}`}>
          {children ? (
            <span
              className={`bi bi-funnel-fill ${iconBtn}`}
              onClick={() => setShowFilters((old) => !old)}
            />
          ) : (
            ""
          )}
          <span
            className={`bi bi-eye-slash-fill ${iconBtn} ${slidersBtn}`}
            onClick={() =>
              setShowHidden(
                (old) => tableOpts.filter(({ hide }) => hide).length > 0 && !old
              )
            }
          >
            <div
              className={`absolute z-20 top-full right-0 bg-secondary-dark rounded-md text-white w-max ${
                showHidden ? "block" : "hidden"
              }`}
            >
              {tableOpts.map(({ hide }, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-2 hover:bg-secondary w-full text-xs ${
                    !hide ? "hidden" : "block"
                  } ${
                    tableOpts.length - 1
                      ? "rounded-md"
                      : idx === 0
                      ? "rounded-t-md"
                      : idx === tableOpts.length - 1
                      ? "rounded-b-md"
                      : ""
                  }`}
                  onClick={() =>
                    setTableOpts((old) => {
                      const copy = [...old];
                      copy[idx] = {
                        ...copy[idx],
                        hide: !copy[idx]?.hide,
                      };
                      return [...copy];
                    })
                  }
                >
                  {headers?.[idx]}
                </div>
              ))}
            </div>
          </span>
        </div>
      </div>
      {children ? (
        <div className={`${filterDiv} ${showFilters ? "block" : "hidden"}`}>
          <Form
            onLazyChange={{ callback: onChange, timeOut: 300 }}
            onSubmit={onSubmit}
            grid
          >
            {children}
          </Form>
        </div>
      ) : (
        ""
      )}
      <div className="overflow-x-auto">
        <table className={`${tableEnterprise}`}>
          <thead>
            <tr>
              {headers.map((name, index) => {
                return (
                  <th
                    key={index}
                    className={`cursor-pointer hover:bg-opacity-80 ${
                      tableOpts?.[index]?.hide ? "hidden" : "table-cell"
                    }`}
                    onClick={() =>
                      setTableOpts((old) => {
                        const copy = [...old];
                        copy.splice(index, 1, {
                          ...copy[index],
                          sort: {
                            state: true,
                            dir: !copy[index]?.sort?.dir,
                          },
                        });
                        return [...copy];
                      })
                    }
                  >
                    <div className="flex flex-row justify-center">
                      <div className="py-2 px-3 w-max">{name}</div>
                      <span
                        className={`bi bi-sliders ${iconBtn} ${slidersBtn}`}
                      >
                        <div className={`${menuOthers}`}>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setTableOpts((old) => {
                                const copy = [...old];
                                copy.splice(index, 1, {
                                  ...copy[index],
                                  sort: {
                                    state: !copy[index]?.sort?.state,
                                    dir: false,
                                  },
                                });
                                return [...copy];
                              });
                            }}
                          >
                            <span className="bi bi-sort-down" />
                          </div>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setTableOpts((old) => {
                                const copy = [...old];
                                copy[index] = {
                                  ...copy[index],
                                  hide: !copy[index]?.hide,
                                };
                                return [...copy];
                              });
                            }}
                          >
                            <span className="bi bi-eye-slash-fill" />
                          </div>
                        </div>
                      </span>
                      {tableOpts[index]?.sort?.state ? (
                        tableOpts[index]?.sort?.dir ? (
                          <span className={`bi bi-caret-up-fill ${iconBtn}`} />
                        ) : (
                          <span
                            className={`bi bi-caret-down-fill ${iconBtn}`}
                          />
                        )
                      ) : (
                        ""
                      )}
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
                    return (
                      <td
                        key={`${key}_${index}`}
                        className={`${
                          tableOpts?.[idx]?.hide ? "hidden" : "table-cell"
                        } ${
                          onSelectRow ? "cursor-pointer" : "cursor-auto"
                        } whitespace-pre z-0`}
                      >
                        {value}
                      </td>
                    );
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
          className={`${limitsBtn} appearance-none`}
          value={limit}
          onChange={(e) =>
            setPaginationData?.(({ page }) => ({
              page,
              limit: Number(e.target.value),
            }))
          }
        >
          {[5, 10, 20, 50].map((val, idx) => (
            <option value={val} key={idx}>
              {val} items por pagina
            </option>
          ))}
        </select>
        <div className="flex flex-row gap-6 items-center">
          <h1>
            {page} de {maxPage}
          </h1>
          <div className="flex flex-row gap-2 items-center">
            <span
              className={`bi bi-chevron-left ${iconBtn}`}
              onClick={useCallback(() => {
                if (page < 2) {
                  return;
                }
                setPaginationData?.(({ limit }) => ({
                  limit,
                  page: page - 1,
                }));
              }, [page])}
            />
            <span
              className={`bi bi-chevron-right ${iconBtn}`}
              onClick={useCallback(() => {
                if (page >= maxPage) {
                  return;
                }
                setPaginationData?.(({ limit }) => ({
                  limit,
                  page: page + 1,
                }));
              }, [page, maxPage])}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

TableEnterprise.propTypes = {
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

export default TableEnterprise;
