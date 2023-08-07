import { useCallback, useState } from "react";
import Button from "../../Base/Button";
import ButtonBar from "../../Base/ButtonBar";
import FileInput from "../../Base/FileInput/FileInput";
import Form from "../../Base/Form";
import Input from "../../Base/Input";
import Select from "../../Base/Select";

const PaginationAuth = ({
  filters,
  maxPage = 0,
  onChange: _onChange = () => {},
  lgButtons = true,
}) => {
  const [page, setPage] = useState(1);

  const onChange = useCallback(
    (e, _page) => {
      const form = e.target.form;
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
    <Form onLazyChange={{ callback: onChange, timeOut: 300 }} grid>
      {Object.entries(filters).map(
        ([key, { type, label, maxLength = 60, options = {}, ...rest }]) => {
          if (options && Object.entries(options).length > 0) {
            return (
              <Select
                key={`${key}_filter`}
                id={`${key}_filter`}
                name={key}
                label={label}
                options={options ?? { "": "" }}
                {...rest}
              />
            );
          }
          if (type === "file") {
            return (
              <FileInput
                key={`${key}_filter`}
                id={`${key}_filter`}
                name={key}
                label={label}
                {...rest}
              />
            );
          }
          return (
            <Input
              key={`${key}_filter`}
              id={`${key}_filter`}
              name={key}
              label={label}
              maxLength={maxLength}
              type={type || "search"}
              autoComplete="off"
              {...rest}
            />
          );
        }
      )}
      {Object.entries(filters).length === 1 ? <ButtonBar></ButtonBar> : ""}
      {maxPage !== 1 && maxPage !== 0 ? (
        <ButtonBar className={`${lgButtons ? "lg:col-span-2" : ""}`}>
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

export default PaginationAuth;
