import React, {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  ReactNode,
  useMemo,
  useState,
} from "react";
import Form from "../Form";
import classes from "./DataTable.module.css";
import LimitSelector from "./LimitSelector";
import PaginationButtons from "./PaginationButtons";

const { dataTable, tooling, iconBtn, filterDiv, wrapper, staticBar } = classes;

type Props = {
  title: ReactNode;
  headers: ReactNode[];
  data: ReactNode[][] | { [key: string]: ReactNode }[];
  onSubmit?: (ev: FormEvent<HTMLFormElement>) => void;
  onChange?: (ev: ChangeEvent<HTMLFormElement>) => void;
  actions?: { [key: string]: (ev: MouseEvent<HTMLSpanElement>) => void };
  onClickRow: (ev: MouseEvent<HTMLTableRowElement>, index: number) => void;
  children: ReactNode;
  tblFooter: ReactNode;
};

const DataTable = ({
  title,
  headers,
  data,
  children,
  tblFooter,
  onClickRow = (_, __) => {},
  onChange = (_) => {},
  onSubmit = (ev) => ev.preventDefault(),
  actions = {},
}: Props) => {
  const [showFilters, setShowFilters] = useState<boolean>(true);

  const fixedData = useMemo(
    () =>
      data.map((obj) =>
        Array.isArray(obj) ? obj : Object.entries(obj).map(([_, val]) => val)
      ),
    [data]
  );

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
            onChange={onChange}
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
        <table className={`${dataTable}`}>
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
            {!fixedData.length ? (
              <tr>
                <td colSpan={headers?.length}>No hay datos</td>
              </tr>
            ) : (
              fixedData.map((obj, index) => (
                <tr key={index} onClick={(ev) => onClickRow(ev, index)}>
                  {obj.map((value, idx) => {
                    return (
                      <td
                        key={`${idx}_${index}`}
                        className={"cursor-pointer whitespace-pre z-0"}
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
        {tblFooter}
      </div>
    </div>
  );
};

DataTable.LimitSelector = LimitSelector
DataTable.PaginationButtons = PaginationButtons

export default DataTable;
