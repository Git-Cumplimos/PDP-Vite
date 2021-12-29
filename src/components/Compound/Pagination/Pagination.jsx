import { useCallback, useRef, useState } from "react";
import Button from "../../Base/Button/Button";
import ButtonBar from "../../Base/ButtonBar/ButtonBar";
import Form from "../../Base/Form/Form";

const Pagination = ({
  maxPage = 0,
  onChange: _onChange = () => {},
  lgButtons = true,
  children,
  grid = false,
}) => {
  const [page, setPage] = useState(1);
  const ref = useRef();

  const onChange = useCallback((e) => _onChange?.(e), [_onChange]);

  return (
    <Form onLazyChange={{ callback: onChange, timeOut: 300 }} grid={grid}>
      {children}
      <input type="hidden" name={"page"} value={page} ref={ref} readOnly />
      {maxPage !== 1 && maxPage !== 0 ? (
        <ButtonBar className={`${lgButtons ? "lg:col-span-2" : ""}`}>
          <Button
            type="button"
            onClick={(e) =>
              setPage((oldPage) => {
                ref.current.value = oldPage - 1;
                onChange(e);
                return oldPage - 1;
              })
            }
            disabled={page < 2}
          >
            Anterior
          </Button>
          <Button
            type="button"
            onClick={(e) =>
              setPage((oldPage) => {
                ref.current.value = oldPage + 1;
                onChange(e);
                return oldPage + 1;
              })
            }
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
