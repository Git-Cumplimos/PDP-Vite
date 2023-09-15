import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import { fetchAsignacionesComisiones } from "../../utils/fetchAssignComission";

const MainAsignaciones = () => {
  const navigate = useNavigate();
  const [asignaciones, setAsignaciones] = useState([]);
  const [dataAsignaciones, setDataAsignaciones] = useState({
    pk_asignacion_comisiones: "",
    nombre_asignacion_comision: "",
    nombre_operacion: "",
    fk_tipo_op: "",
    nombre_plan_comision: "",
    nombre_grupo_convenios: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const dataTable = useMemo(() => {
    return asignaciones.map(
      ({
        pk_asignacion_comisiones,
        nombre_asignacion_comision,
        nombre_operacion,
        nombre_plan_comision,
        nombre_grupo_convenios,
      }) => {
        return {
          nombre_asignacion_comision,
          nombre_operacion,
          nombre_plan_comision,
          nombre_grupo_convenios,
        };
      }
    );
  }, [asignaciones]);
  const selectAssign = useCallback(
    (ev, i) => {
      ev.preventDefault();
      navigate(`edit/${asignaciones[i].pk_asignacion_comisiones}`);
    },
    [asignaciones]
  );
  useEffect(() => {
    fetchAssignsFunc();
  }, [dataAsignaciones, page, limit]);
  const onChangeFormat = useCallback((ev) => {
    let valor = ev.target.value;
    valor = valor.replace(/[^\w\s]/g, "");
    setDataAsignaciones((old) => {
      return { ...old, [ev.target.name]: valor };
    });
  }, []);
  const fetchAssignsFunc = () => {
    let obj = {
      page,
      limit,
      sortDir: "DESC",
      sortBy: "pk_asignacion_comisiones",
    };
    if (dataAsignaciones.pk_asignacion_comisiones !== "")
      obj["pk_asignacion_comisiones"] =
        dataAsignaciones.pk_asignacion_comisiones;
    if (dataAsignaciones.nombre_asignacion_comision !== "")
      obj["nombre_asignacion_comision"] =
        dataAsignaciones.nombre_asignacion_comision;
    if (dataAsignaciones.nombre_operacion !== "")
      obj["nombre_operacion"] = dataAsignaciones.nombre_operacion;
    if (dataAsignaciones.nombre_plan_comision !== "")
      obj["nombre_plan_comision"] = dataAsignaciones.nombre_plan_comision;
    if (dataAsignaciones.nombre_grupo_convenios !== "")
      obj["nombre_grupo_convenios"] = dataAsignaciones.nombre_grupo_convenios;
    if (dataAsignaciones.fk_tipo_op !== "")
      obj["fk_tipo_op"] = dataAsignaciones.fk_tipo_op;
    fetchAsignacionesComisiones(obj)
      .then((res) => {
        setAsignaciones(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  // const generateReport = () => {
  //   setIsUploading(true);
  //   reportGenerationGeneralComisions({ type: "ComisionesPagar" })
  //     .then((res) => {
  //       if (res?.status) {
  //         notify(res?.msg);
  //         window.open(res?.obj?.url);
  //         setIsUploading(false);
  //       } else {
  //         notifyError(res?.msg);
  //         setIsUploading(false);
  //       }
  //     })
  //     .catch((err) => console.error(err));
  // };
  return (
    <>
      <ButtonBar>
        <Button type='submit' onClick={() => navigate("crear")}>
          Crear asignación de comisión
        </Button>
        {/* <Button onClick={generateReport}>
              Generar reporte de comisiones
            </Button> */}
      </ButtonBar>
      <TableEnterprise
        title='Lista de asignaciones de comisión'
        maxPage={maxPages}
        headers={[
          "Asignación",
          "Operación",
          "Plan comisión",
          "Grupo convenios",
        ]}
        data={dataTable}
        onSelectRow={selectAssign}
        onSetPageData={setPageData}>
        <Input
          id='pk_asignacion_comisiones'
          name='pk_asignacion_comisiones'
          label={"Id asignación"}
          type='number'
          autoComplete='off'
          value={dataAsignaciones.pk_asignacion_comisiones}
          onChange={onChangeFormat}
        />
        <Input
          id='fk_tipo_op'
          name='fk_tipo_op'
          label={"Id operación"}
          type='number'
          autoComplete='off'
          value={dataAsignaciones.fk_tipo_op}
          onChange={onChangeFormat}
        />
        <Input
          id='nombre_asignacion_comision'
          name='nombre_asignacion_comision'
          label={"Asignación"}
          type='text'
          autoComplete='off'
          value={dataAsignaciones.nombre_asignacion_comision}
          onChange={onChangeFormat}
        />
        <Input
          id='nombre_operacion'
          name='nombre_operacion'
          label={"Operación"}
          type='text'
          autoComplete='off'
          value={dataAsignaciones.nombre_operacion}
          onChange={onChangeFormat}
        />
        <Input
          id='nombre_plan_comision'
          name='nombre_plan_comision'
          label={"Plan comisión"}
          type='text'
          autoComplete='off'
          value={dataAsignaciones.nombre_plan_comision}
          onChange={onChangeFormat}
        />
        <Input
          id='nombre_grupo_convenios'
          name='nombre_grupo_convenios'
          label={"Grupo convenios"}
          type='text'
          autoComplete='off'
          value={dataAsignaciones.nombre_grupo_convenios}
          onChange={onChangeFormat}
        />
      </TableEnterprise>
    </>
  );
};

export default MainAsignaciones;
