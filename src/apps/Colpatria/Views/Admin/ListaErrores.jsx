import { Fragment, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
// import Modal from "../../../../components/Base/Modal";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { onChangeNumber } from "../../../../utils/functions";
import { notifyError } from "../../../../utils/notify";

import { getErrorList, modErrorList } from "../../utils/fetchFunctions";

const ListaErrores = () => {
  const [listaErrores, setListaErrores] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });

  // const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getErrorList({ ...pageData })
      .then((res) => {
        setListaErrores(res?.obj?.results ?? []);
        setMaxPages(res?.obj?.maxPages ?? []);
      })
      .catch((err) => {
        if (err?.cause === "custom") {
          notifyError(err?.message);
          return;
        }
        console.error(err?.message);
      });
  }, [pageData]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Lista de errores Colpatria</h1>
      <TableEnterprise
        title="Lista de errores"
        headers={[
          "Id error",
          "Codigo de error",
          "Codigo de error base 64",
          "Mensaje de error",
        ]}
        data={listaErrores.map(
          ({ error_code, error_code_b64, error_msg, pk_error_id }, index) => ({
            pk_error_id,
            error_code: (
              <input
                className="px-4 py-2 rounded bg-gray-100 text-black outline-none"
                size={1}
                type="tel"
                autoComplete="off"
                minLength={"2"}
                maxLength={"2"}
                value={error_code}
                onInput={(ev) =>
                  setListaErrores((old) => {
                    const copy = [...old];
                    copy.splice(index, 1, {
                      ...copy[index],
                      error_code: onChangeNumber(ev),
                    });
                    return copy;
                  })
                }
                required
              />
            ),
            error_code_b64: (
              <input
                className="px-4 py-2 rounded bg-gray-100 text-black outline-none"
                size={1}
                type="tel"
                autoComplete="off"
                minLength={"3"}
                maxLength={"3"}
                value={error_code_b64}
                onInput={(ev) =>
                  setListaErrores((old) => {
                    const copy = [...old];
                    copy.splice(index, 1, {
                      ...copy[index],
                      error_code_b64: onChangeNumber(ev),
                    });
                    return copy;
                  })
                }
                required
              />
            ),
            error_msg: (
              <textarea
                className="px-4 py-2 rounded bg-gray-100 text-black outline-none resize-y max-h-60"
                autoComplete="off"
                value={error_msg}
                onInput={(ev) =>
                  setListaErrores((old) => {
                    const copy = [...old];
                    copy.splice(index, 1, {
                      ...copy[index],
                      error_msg: ev.target.value,
                    });
                    return copy;
                  })
                }
                required
              />
            ),
          })
        )}
        maxPage={maxPages}
        onSetPageData={setPageData}
        // onSelectRow={() => setShowModal(true)}
      >
        <ButtonBar>
          <Button
            onClick={() => {
              modErrorList({ pk_error_id: "" }, listaErrores)
                .then((res) => {
                  console.log(res);
                })
                .catch((err) => {
                  if (err?.cause === "custom") {
                    notifyError(err?.message);
                    return;
                  }
                  console.error(err?.message);
                });
            }}
          >
            Actualizar datos
          </Button>
        </ButtonBar>
      </TableEnterprise>
      {/* <Modal show={showModal} handleClose={() => setShowModal(false)}></Modal> */}
    </Fragment>
  );
};

export default ListaErrores;
