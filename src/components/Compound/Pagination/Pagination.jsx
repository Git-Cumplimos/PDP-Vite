import { useCallback, useRef, useState } from "react";
import Button from "../../Base/Button/Button";
import ButtonBar from "../../Base/ButtonBar/ButtonBar";
import Form from "../../Base/Form/Form";
import Input from "../../Base/Input/Input";
import Select from "../../Base/Select/Select";

const Pagination = ({ filters, maxPage, onChange: _onChange = () => {} }) => {
  const [page, setPage] = useState(1);

  const refFrom = useRef(null);

  const onChange = useCallback(
    (e, _page) => {
      const form = refFrom.current;
      const formData = new FormData(form);

      if (_page && !isNaN(_page)) {
        formData.append("page", _page);
      } else {
        formData.append("page", page);
      }

      _onChange?.(formData);
    },
    [page, _onChange]
  );

  return (
    <Form
      onLazyChange={{
        callback: onChange,
        timeOut: 300,
      }}
      reff={refFrom}
      grid
    >
      {Object.entries(filters).map(([key, { type, label, options = {} }]) => {
        if (options && Object.entries(options).length > 0) {
          return (
            <Select
              key={`${key}_filter`}
              id={`${key}_filter`}
              name={key}
              label={label}
              options={options ?? { "": "" }}
            />
          );
        }
        return (
          <Input
            key={`${key}_filter`}
            id={`${key}_filter`}
            name={key}
            label={label}
            type={type || "search"}
            autoComplete="off"
          />
        );
      })}
      {Object.entries(filters).length === 1 ? <ButtonBar></ButtonBar> : ""}
      {maxPage !== 1 && maxPage !== 0 ? (
        <ButtonBar className="lg:col-span-2">
          <Button
            type="button"
            onClick={(e) => {
              setPage(page - 1);
              onChange(e, page - 1);
            }}
            disabled={page < 2}
          >
            Anterior
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              setPage(page + 1);
              onChange(e, page + 1);
            }}
            disabled={page >= maxPage}
          >
            Siguiente
          </Button>
        </ButtonBar>
      ) : (
        ""
      )}
    </Form>
  );
};

export default Pagination;
