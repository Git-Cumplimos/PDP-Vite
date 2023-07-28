import { useCallback, useEffect, useMemo, useState } from "react";

import classes from "../../../../../components/Base/TableEnterprise/TableEnterprise.module.css";
import Form from "../../../../../components/Base/Form";
import PropTypes from "prop-types";

import * as BusinessLineCons from "../utils/LineasNegocio.cons";

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
  actions = {},
  children = null,
  data = [],
  headers = [],
  maxPage = 1,
  updateEvent,
  title = "",
  onChange = () => {},
  onSelectRow = null || onSelectRowFunction,
  onSetPageData = (_) => {},
  onSetUtilsFuncs = () => {},
  onSubmit = (e) => e.preventDefault(),
}) => {
  const [showFilters, setShowFilters] = useState(true);

  const [{ page, limit }, setPaginationData] = useState({ page: 1, limit: 10 });

  useEffect(() => {
    data.forEach((val) => {
      const objtemp = Array.isArray(val) ? val : Object.entries(val);
      try {
        if (headers.length+2 !== objtemp.length) {
          console.error(headers, objtemp);
          throw new Error(BusinessLineCons.MESSAGE_BAD_FORMAT_TABLE);
        }
      } catch (error) {
        console.error("Error. ", error);
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
        <button
          onClick={()=> {updateEvent()}}
          title={BusinessLineCons.LABEL_UPDATE}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="#000000" 
            viewBox="0 0 27.971 27.971"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M23.92,14.746l-4.05-4.051h2.374l-0.068-0.177c-1.407-3.561-4.882-6.088-8.95-6.088c-5.312,0-9.62,4.307-9.62,9.616 c0,5.316,4.308,9.623,9.62,9.623c3.907,0,7.271-2.128,8.775-5.479l3.854,0.039c-0.013,0.03-3.032,8.918-12.693,8.918 C5.893,27.148,0,21.254,0,13.987C0,6.715,5.893,0.824,13.161,0.824c6.08,0,11.195,4.116,12.709,9.715l0.032,0.156h2.069 L23.92,14.746z"
            /> 
          </svg>
        </button>
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
                <td colSpan={headers?.length}>{BusinessLineCons.MESSAGE_NO_DATA}</td>
              </tr>
            ) : (
              sortedData.map((obj, index) => (
                <tr
                  key={index}
                  onClick={onSelectRow ? (e) => onSelectRow(e, index) : null}
                >
                  {obj.map(([key, value], idx) => {
                    if (key !== BusinessLineCons.TAG_DETAILED_LINE_ID && key !== BusinessLineCons.TAG_TRANSACTION_TYPE_ID) {
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
              {val} {BusinessLineCons.LABEL_ITEMS_PER_PAGE}
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
