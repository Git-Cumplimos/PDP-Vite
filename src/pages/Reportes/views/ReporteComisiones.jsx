import { Fragment, useCallback, useEffect, useState } from "react";
import { fetchAutorizadores } from "../../../apps/TrxParams/utils/fetchRevalAutorizadores";
import { fetchConveniosMany } from "../../../apps/TrxParams/utils/fetchRevalConvenios";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import useQuery from "../../../hooks/useQuery";

const ReporteComisiones = () => {
  const [{ selectedOpt, convenio = "", autorizador = "" }, setQuery] =
    useQuery();
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [headersTable, setHeadersTable] = useState([]);
  const [data, setdata] = useState([]);
  const [report, setReport] = useState({});
  const handleClose = useCallback(() => {
    setShowModal(false);
    setQuery(
      {
        ["selectedOpt"]: "",
        ["convenio"]: "",
        ["autorizador"]: "",
      },
      { replace: true }
    );
  }, []);
  useEffect(() => {
    if (selectedOpt === "convenio") {
      fetchConveniosFunc();
    } else if (selectedOpt === "autorizador") {
      fetchAutorizadoresFunc();
    } else {
      setdata([]);
    }
  }, [selectedOpt, page, limit, convenio, autorizador]);
  const fetchConveniosFunc = () => {
    fetchConveniosMany({ tags: convenio, page, limit })
      .then((res) => {
        setdata(
          [...res?.results].map(({ id_convenio, nombre_convenio }) => {
            return {
              "Id convenio": id_convenio,
              "Nombre convenio": nombre_convenio,
            };
          })
        );
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  const fetchAutorizadoresFunc = () => {
    fetchAutorizadores({ page, limit })
      .then((res) => {
        setdata(
          [...res?.results].map(({ id_autorizador, nombre_autorizador }) => {
            return {
              "Id autorizador": id_autorizador,
              "Nombre autorizador": nombre_autorizador,
            };
          })
        );
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  const onChangeReport = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const newData = [];
    ["Id comercio"].forEach((col) => {
      let data = null;
      data = formData.get(col);
      newData.push([col, data]);
    });
    setReport((old) => ({
      ...old,
      ...Object.fromEntries(newData),
    }));
  }, []);
  const onSelect = useCallback(
    (e, i) => {
      setShowModal(true);
      if (selectedOpt === "convenio") {
        setReport((old) => ({
          ...old,
          "Id convenio": data[i]?.["Id convenio"],
          Convenio: data[i]?.["Nombre convenio"],
        }));
      } else if (selectedOpt === "autorizador") {
        setReport((old) => ({
          ...old,
          "Id autorizador": data[i]?.["Id autorizador"],
          Autorizador: data[i]?.["Nombre autorizador"],
        }));
      }
      handleClose();
    },
    [data, selectedOpt, handleClose]
  );
  const onChange = useCallback(
    (ev) => setQuery({ [ev.target.name]: ev.target.value }, { replace: true }),
    [setQuery]
  );
  return (
    <>
      <h1 className='text-3xl'>Crear comisión a pagar:</h1>
      {/* <SearchComissions comissionFace="pay" onSelectItem={onSelectItem} /> */}
      <Form onChange={onChangeReport} grid>
        {report?.["Convenio"] && (
          <Input
            id='Convenio'
            name='Convenio'
            label={"Convenio"}
            type='text'
            autoComplete='off'
            // defaultValue={newComision?.["Convenio"]}
            value={report?.["Convenio"]}
            disabled
          />
        )}
        {report?.["Autorizador"] && (
          <Input
            id='Autorizador'
            name='Autorizador'
            label={"Autorizador"}
            type='text'
            autoComplete='off'
            // defaultValue={newComision?.["Autorizador"]}
            value={report?.["Autorizador"]}
            info={<button>sss</button>}
            disabled
          />
        )}
        <Input
          id='Id comercio'
          name='Id comercio'
          label={"Id comercio"}
          type='number'
          autoComplete='off'
          value={report?.["Id comercio"]}
          onChange={() => {}}
        />
      </Form>
      <ButtonBar>
        <Button
          type='button'
          onClick={() => {
            setShowModal(true);
            setQuery({ ["selectedOpt"]: "convenio" }, { replace: true });
            setHeadersTable(["Id convenio", "Nombre convenio"]);
          }}>
          {report?.["Convenio"] ? "Editar convenio" : "Agregar convenio"}
        </Button>
        <Button
          type='button'
          onClick={() => {
            setShowModal(true);
            setQuery({ ["selectedOpt"]: "autorizador" }, { replace: true });
            setHeadersTable(["Id autorizador", "Nombre autorizador"]);
          }}>
          {report?.["Autorizador"]
            ? "Editar autorizador"
            : "Agregar autorizador"}
        </Button>
        <Button type='submit'>Generar reporte</Button>
      </ButtonBar>
      <Modal
        show={showModal}
        handleClose={handleClose}
        className='flex align-middle'>
        {/* {selectedOpt === "convenio" && */}
        <Fragment>
          <TableEnterprise
            title={
              selectedOpt === "convenio"
                ? "Seleccionar convenio"
                : selectedOpt === "autorizador"
                ? "Seleccionar autorizador"
                : ""
            }
            maxPage={maxPages}
            headers={headersTable}
            data={data}
            onSelectRow={onSelect}
            onSetPageData={setPageData}
            onChange={onChange}>
            {selectedOpt === "convenio" && (
              <Input
                id={"convenioComissions"}
                label={"Convenio"}
                name={"convenio"}
                type={"text"}
                autoComplete='off'
                defaultValue={convenio}
              />
            )}
            {selectedOpt === "autorizador" && (
              <Input
                id={"autorizadorComissions"}
                label={"Autorizador"}
                name={"autorizador"}
                type={"text"}
                autoComplete='off'
                defaultValue={autorizador}
              />
            )}
          </TableEnterprise>
        </Fragment>
      </Modal>
    </>
  );
};

export default ReporteComisiones;
