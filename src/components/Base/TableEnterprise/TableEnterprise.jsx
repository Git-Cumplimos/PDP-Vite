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
} = classes;

const onSelectRowFunction = (e, i) => {};

const TableEnterprise = ({
  title = "Titulo tabla",
  headers = ["Header 1", "Header 2"],
  data = [
    [1, 2],
    ["a", "b"],
  ],
  onSelectRow = null || onSelectRowFunction,
  maxPage = 1,
  onChange = () => {},
  onSubmit = (e) => e.preventDefault(),
  onSetPageData = (inf) => {},
  onSetUtilsFuncs = () => {},
  children = null,
  actions = {},
}) => {
  const [showFilters, setShowFilters] = useState(true);

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

  const sortedData = useMemo(
    () =>
      data.map((obj) =>
        Array.isArray(obj)
          ? obj.map((value, key) => [key, value])
          : Object.entries(obj)
      ),
    [data]
  );

  useEffect(() => {
    onSetPageData({ page, limit });
  }, [onSetPageData, page, limit]);

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
        <div className="col-start-2 col-span-6 text-left text-2xl">{title}</div>
        <div className="col-span-2"></div>
        <div className={`col-span-2 place-self-end ${tooling}`}>
          {children ? (
            <span
              className={`bi bi-funnel-fill ${iconBtn}`}
              onClick={() => setShowFilters((old) => !old)}
            />
          ) : (
            ""
          )}
          {Object.entries(actions).map(([item, action]) => (
            <span className={`bi bi-${item} ${iconBtn}`} onClick={action} />
          ))}
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
                    className={`cursor-pointer hover:bg-opacity-80`}
                  >
                    <div className="flex flex-row justify-center">
                      <div className="py-2 px-3 w-max">{name}</div>
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
              {val} items por página
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
