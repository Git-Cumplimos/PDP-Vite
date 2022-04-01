import { Fragment, useCallback, useEffect, useState } from "react";
import { fetchAutorizadores } from "../../../apps/TrxParams/utils/fetchRevalAutorizadores";
import { fetchConveniosMany } from "../../../apps/TrxParams/utils/fetchRevalConvenios";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import useQuery from "../../../hooks/useQuery";
import { notify, notifyError } from "../../../utils/notify";
import { postObtenerReporteComisionesAplicadas } from "../utils/fetchReportesComisiones";

const ReporteComisiones = () => {
  const [{ selectedOpt, convenio = "", autorizador = "" }, setQuery] =
    useQuery();
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [headersTable, setHeadersTable] = useState([]);
  const [data, setdata] = useState([]);
  const [report, setReport] = useState({
    "Id comercio": "",
    "Fecha inicio": "",
    "Fecha fin": new Date().toISOString().substring(0, 10),
    // .replace("/", "-"),
  });

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
    ["Id comercio", "Fecha inicio", "Fecha fin"].forEach((col) => {
      let data = null;
      data = formData.get(col);
      newData.push([col, data]);
    });
    console.log(report);
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
  const removeReport = useCallback(
    (name) => (ev) => {
      ev.preventDefault();
      setReport((old) => {
        return { ...old, [name]: "" };
      });
    },
    []
  );
  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      if (new Date(report["Fecha fin"]) > new Date()) {
        notifyError("La fecha final no puede ser mayor al dia de hoy");
        return;
      }

      if (report["Fecha fin"] !== "") {
        if (report["Fecha inicio"] !== "") {
          if (
            new Date(report["Fecha fin"]) <= new Date(report["Fecha inicio"])
          ) {
            notifyError("La fecha final debe ser mayor a la inicial");
            return;
          }
        } else {
          notifyError("Debe existir una fecha inicial");
          return;
        }
      }
      let obj = {};
      if (report["Id comercio"] !== "") {
        obj["id_comercio"] = report["Id comercio"];
      }
      if (report["Autorizador"] !== "" && report["Autorizador"]) {
        obj["id_autorizador"] = report["Id autorizador"];
      }
      if (report["Convenio"] !== "" && report["Convenio"]) {
        obj["id_convenio"] = report["Id convenio"];
      }
      if (report["Fecha inicio"] !== "") {
        obj["date_ini"] = report["Fecha inicio"];
      }
      if (report["Fecha fin"] !== "") {
        obj["date_end"] = report["Fecha fin"];
      }
      setIsUploading(true);
      postObtenerReporteComisionesAplicadas(obj)
        .then((res) => {
          if (res?.status) {
            notify(res?.msg);
            window.open(res?.obj?.url);
            setIsUploading(false);
          } else {
            notifyError(res?.msg);
            setIsUploading(false);
          }
        })
        .catch((err) => console.error(err));
    },
    [report]
  );
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl'>Reporte historico comisiones:</h1>
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
            info={
              <button
                className='bi bi-x'
                style={{
                  position: "absolute",
                  top: "-35px",
                  right: "-235px",
                  fontSize: "30px",
                  backgroundColor: "#f4f4f5",
                }}
                onClick={removeReport("Convenio")}></button>
            }
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
            info={
              <button
                className='bi bi-x'
                style={{
                  position: "absolute",
                  top: "-35px",
                  right: "-235px",
                  fontSize: "30px",
                  backgroundColor: "#f4f4f5",
                }}
                onClick={removeReport("Autorizador")}></button>
            }
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
        <Input
          id='Fecha inicio'
          name='Fecha inicio'
          label={"Fecha inicio"}
          type='date'
          autoComplete='off'
          value={report?.["Fecha inicio"]}
          onChange={() => {}}
        />
        <Input
          id='Fecha fin'
          name='Fecha fin'
          label={"Fecha fin"}
          type='date'
          autoComplete='off'
          value={report?.["Fecha fin"]}
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
        <Button type='submit' onClick={onSubmit}>
          Generar reporte
        </Button>
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
