import { useCallback } from "react";
import useQuery from "../../../hooks/useQuery";
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
  const [{ page = 1 }, setQuery] = useQuery();

  const onChange = useCallback((e) => _onChange?.(e), [_onChange]);
  const setPage = useCallback(
    (val) => setQuery?.({ page: page + val }, { replace: true }),
    [setQuery, page]
  );

  return (
    <Form onLazyChange={{ callback: onChange, timeOut: 300 }} grid={grid}>
      {children}
      {maxPage !== 1 && maxPage !== 0 ? (
        <ButtonBar className={`${lgButtons ? "lg:col-span-2" : ""}`}>
          <Button type="button" onClick={() => setPage(-1)} disabled={page < 2}>
            Anterior
          </Button>
          <Button
            type="button"
            onClick={() => setPage(1)}
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
