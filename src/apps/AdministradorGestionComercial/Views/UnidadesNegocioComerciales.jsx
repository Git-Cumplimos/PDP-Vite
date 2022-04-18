import { useState, useEffect, Fragment, useCallback, useMemo } from "react";
import Table from "../../../components/Base/Table";
import Button from "../../../components/Base/Button";
import fetchData from "../../../utils/fetchData";
import Pagination from "../../../components/Compound/Pagination";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import { notify, notifyError } from "../../../utils/notify";
import Form from "../../../components/Base/Form";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import Input from "../../../components/Base/Input";
import useQuery from "../../../hooks/useQuery";
import InputSuggestions from "../../../components/Base/InputSuggestions";

const url = process.env.REACT_APP_URL_SERVICE_COMMERCE_SS;

const UnidadesNegocioComerciales = () => {
  const [{ page = 1 }] = useQuery();

  const [unidadesDeNegocio, setUnidadesDeNegocio] = useState([]);
  const [cantidadPaginas, setCantidadPaginas] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  /**
   * Input Suggestions vars
   */
  const [foundResponsables, setFoundResponsables] = useState([]);
  const [searchResponsable, setSearchResponsable] = useState("");
  const [selectedResponsable, setSelectedResponsable] = useState([]);
  const [selectedOrigResponsable, setSelectedOrigResponsable] = useState([]);

  const suggestionsResp = useMemo(() => {
    return (
      foundResponsables.map((val) => {
        const foundIdx = val
          .toLowerCase()
          .indexOf(searchResponsable.toLowerCase());
        if (foundIdx === -1) {
          return <h1 className="text-sm">{val}</h1>;
        }
        const str1 = val.substring(0, foundIdx);
        const str2 = val.substring(
          foundIdx,
          foundIdx + searchResponsable.length
        );
        const str3 = val.substring(foundIdx + searchResponsable.length);
        return (
          <div className="grid grid-cols-1 place-items-center px-4 py-2">
            <h1 className="text-sm">
              {str1}
              <strong>{str2}</strong>
              {str3}
            </h1>
          </div>
        );
      }) || []
    );
  }, [searchResponsable, foundResponsables]);

  const onSelectSugg = useCallback(
    (index) => {
      const copy = [...selectedResponsable];
      if (
        !copy
          .map((val) => parseInt(val.split(") ")[0]))
          .includes(parseInt(foundResponsables[index].split(") ")[0]))
      ) {
        copy.push(foundResponsables[index]);
        setSelectedResponsable([...copy]);
      }
      setSearchResponsable("");
      setFoundResponsables([]);
    },
    [foundResponsables, selectedResponsable]
  );

  const inputSuggResp = useMemo(() => {
    return (
      <div className="flex flex-col justify-center items-center text-center my-4 mx-4 gap-4">
        <InputSuggestions
          id="responsablesUnidNego"
          label={"Buscar responsables"}
          type={"search"}
          suggestions={suggestionsResp}
          onSelectSuggestion={onSelectSugg}
          minLength="4"
          autoComplete="off"
          value={searchResponsable}
          onInput={(e) => setSearchResponsable(e.target.value)}
          onLazyInput={{
            callback: (e) => {
              const _responsable = e.target.value;
              if (_responsable.length > 0) {
                fetchData(`${url}/responsables`, "GET", {
                  nombre: _responsable,
                  limit: 3,
                })
                  .then((res) => {
                    if (res?.status) {
                      setFoundResponsables(
                        res?.obj?.results.map(
                          ({ id_responsable, nombre }) =>
                            `${id_responsable}) ${nombre}`
                        )
                      );
                    }
                  })
                  .catch(() => {});
              } else {
                setFoundResponsables([]);
              }
            },
            timeOut: 500,
          }}
        />
        {selectedResponsable.length > 0 ? (
          <ul className="grid grid-cols-1 gap-2">
            {selectedResponsable.map((el, idx) => {
              return (
                <li key={idx} className="grid grid-cols-8">
                  <span className="bi bi-person-fill text-xl" />
                  <h1 className="col-span-6">{el}</h1>
                  <span
                    onClick={() => {
                      const copy = [...selectedResponsable];
                      copy.splice(idx, 1);
                      setSelectedResponsable([...copy]);
                    }}
                    className="bi bi-x text-3xl"
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          ""
        )}
      </div>
    );
  }, [onSelectSugg, searchResponsable, selectedResponsable, suggestionsResp]);
  /**
   * End
   */

  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelected(null);
    setSelectedResponsable([]);
    setSelectedOrigResponsable([]);
    setSearchResponsable("");
  }, []);

  const fetchUnidadesDeNegocio = useCallback(() => {
    fetchData(`${url}/unidades-de-negocio`, "GET", { page })
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        setUnidadesDeNegocio(res?.obj?.results);
        setCantidadPaginas(res?.obj?.maxPages);
      })
      .catch((err) => console.error(err));
  }, [page]);

  const onCrearUnidadesDeNegocio = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.target);

      fetchData(
        `${url}/unidades-de-negocio`,
        "POST",
        {},
        {
          ...Object.fromEntries(formData.entries()),
          responsable_id_responsable: selectedResponsable.map(
            (val) => val.split(") ")[0]
          ),
        }
      ).then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        ev.target.reset();
        notify("La Unidad de Negocio Ha Sido Creada Con Exito.");
        fetchUnidadesDeNegocio();
        handleClose();
      });
    },
    [handleClose, fetchUnidadesDeNegocio, selectedResponsable]
  );

  const onEditUnidadesDeNegocio = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.target);

      const body = Object.fromEntries(formData.entries());
      const { id_negocio } = body;
      delete body.id_negocio;

      fetchData(
        `${url}/unidades-de-negocio`,
        "PUT",
        {
          id_negocio,
        },
        {
          ...body,
          responsable_id_responsable: {
            remove: selectedOrigResponsable.filter(
              (id_resp) =>
                !selectedResponsable
                  .map((val) => parseInt(val.split(") ")[0]))
                  .reduce((prev, curr) => prev || id_resp === curr, false)
            ),
            add: selectedResponsable
              .map((val) => parseInt(val.split(") ")[0]))
              .filter(
                (id_resp) =>
                  !selectedOrigResponsable.reduce(
                    (prev, curr) => prev || id_resp === curr,
                    false
                  )
              ),
          },
        }
      ).then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        ev.target.reset();
        notify("La Unidad de Negocio Ha Sido Editada Con Exito.");
        fetchUnidadesDeNegocio();
        handleClose();
      });
    },
    [
      handleClose,
      fetchUnidadesDeNegocio,
      selectedResponsable,
      selectedOrigResponsable,
    ]
  );

  useEffect(() => {
    fetchUnidadesDeNegocio();
  }, [fetchUnidadesDeNegocio]);

  return (
    <Fragment>
      <ButtonBar>
        <Button type="" onClick={() => setShowModal(true)}>
          Agregar Unidad de Negocio
        </Button>
      </ButtonBar>
      <Pagination maxPage={cantidadPaginas} grid></Pagination>
      {Array.isArray(unidadesDeNegocio) && unidadesDeNegocio.length > 0 ? (
        <Table
          headers={["Id unidad de negocio", "Nombre unidad de negocio"]}
          data={unidadesDeNegocio.map(({ id_negocio, nom_unidad_neg }) => ({
            id_negocio,
            nom_unidad_neg,
          }))}
          onSelectRow={(e, i) => {
            setSelected(unidadesDeNegocio[i]);
            setSelectedResponsable(
              unidadesDeNegocio[i]?.responsables?.map(
                ({ id_responsable, nombre }) => `${id_responsable}) ${nombre}`
              )
            );
            setSelectedOrigResponsable(
              unidadesDeNegocio[i]?.responsables?.map(
                ({ id_responsable }) => id_responsable
              )
            );
            setShowModal(true);
          }}
        />
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={handleClose}>
        {selected ? (
          <Fragment>
            <PaymentSummary
              title="Editar unidad de negocio"
              subtitle="Datos unidad de negocio"
              summaryTrx={{
                "Nombre unidad de negocio": selected?.nom_unidad_neg ?? "",
              }}
            ></PaymentSummary>
            <Form onSubmit={onEditUnidadesDeNegocio} grid>
              <input
                type="hidden"
                name="id_negocio"
                value={selected?.id_negocio}
              />
              <Input
                label={"Codigo unidad de negocio"}
                id="cod_unidad_d_negocio_editar_unidad_de_negocio"
                name="cod_unidad_d_negocio"
                type={"text"}
                defaultValue={selected?.cod_unidad_d_negocio}
                required
              />
              {inputSuggResp}
              <ButtonBar>
                <Button type={"submit"}>Editar unidad de negocio</Button>
              </ButtonBar>
            </Form>
          </Fragment>
        ) : (
          <Fragment>
            <PaymentSummary
              title="Crear unidad de negocio"
              subtitle="Datos unidad de negocio"
            ></PaymentSummary>
            <Form onSubmit={onCrearUnidadesDeNegocio} grid>
              <Input
                label={"Nombre unidad de negocio"}
                id="nom_unidad_neg_crear_unidad_de_negocio"
                name="nom_unidad_neg"
                type={"text"}
                required
              />
              <Input
                label={"Codigo unidad de negocio"}
                id="cod_unidad_d_negocio_crear_unidad_de_negocio"
                name="cod_unidad_d_negocio"
                type={"text"}
                required
              />
              {inputSuggResp}
              <ButtonBar>
                <Button type={"submit"}>Crear unidad de negocio</Button>
              </ButtonBar>
            </Form>
          </Fragment>
        )}
      </Modal>
    </Fragment>
  );
};
export default UnidadesNegocioComerciales;
