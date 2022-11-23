import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import useQuery from "../../../../hooks/useQuery";
import { postConsultaComercio } from "../../utils/fetchComercios";

const ListarComercios = () => {
  const navigate = useNavigate();
  const [{ searchComercio = "", searchPkComercio = "" }, setQuery] = useQuery();
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [comercios, setComercios] = useState([]);
  const [maxPages, setMaxPages] = useState(0);

  const tableComercios = useMemo(() => {
    return [
      ...comercios.map(
        ({
          apellido_contacto1_comercio,
          apellido_contacto2_comercio,
          codigos_institucionales,
          comercio_padre,
          credito_comercio,
          dane_ciudad,
          dane_dpto,
          dane_pais,
          descripcion_tipo_nivel,
          direccion_comercio,
          email_comercio,
          fecha_actualizacion,
          fecha_registro,
          fk_comercio_padre,
          fk_tipo_identificacion,
          fk_tipo_nivel,
          latitud_comercio,
          longitud_comercio,
          nombre_comercio,
          nombre_contacto1_comercio,
          nombre_contacto2_comercio,
          numero_identificacion,
          obtener_mejor_tarifa,
          pk_comercio,
          razon_social_comercio,
          tel_contacto1_comercio,
          tel_contacto2_comercio,
          telefono_fijo_comercio,
        }) => {
          return {
            Id: pk_comercio,
            Comercio: nombre_comercio,
            Documento: numero_identificacion,
            "Comercio padre": comercio_padre ?? "Vacio",
          };
        }
      ),
    ];
  }, [comercios]);

  const onSelectComercios = useCallback(
    (e, i) => {
      navigate("../params-operations/comercios/crear", {
        state: {
          id: tableComercios[i]["Id"],
        },
      });
    },
    [tableComercios, navigate]
  );

  const onChange = useCallback(
    (ev) => {
      const formData = new FormData(ev.target.form);
      const comercio = formData.get("searchComercio");
      const pkComercio = formData.get("searchPkComercio");
      setQuery(
        { searchPkComercio: pkComercio, searchComercio: comercio },
        { replace: true }
      );
    },
    [setQuery]
  );

  useEffect(() => {
    fetchComerciosFunc();
  }, [page, limit, searchComercio, searchPkComercio]);
  const fetchComerciosFunc = useCallback(() => {
    let obj = {};
    if (parseInt(searchPkComercio))
      obj["co1.pk_comercio"] = parseInt(searchPkComercio);
    if (searchComercio) obj["co1.nombre_comercio"] = searchComercio;
    postConsultaComercio({ ...obj, page, limit })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setComercios(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, searchComercio, searchPkComercio]);

  return (
    <Fragment>
      <ButtonBar>
        <Button
          type='submit'
          onClick={() => {
            navigate("../params-operations/comercios/crear");
          }}>
          Crear comercio
        </Button>
      </ButtonBar>
      <TableEnterprise
        title='Comercios'
        maxPage={maxPages}
        headers={["Id", "Comercio", "Documento", "Comercio padre"]}
        data={tableComercios}
        onSelectRow={onSelectComercios}
        onSetPageData={setPageData}
        onChange={onChange}>
        <Input
          id='searchPkComercio'
          name='searchPkComercio'
          label={"Id comercio"}
          type='number'
          autoComplete='off'
          defaultValue={searchPkComercio}
        />
        <Input
          id='searchComercio'
          name='searchComercio'
          label={"Nombre comercio"}
          type='text'
          autoComplete='off'
          defaultValue={searchComercio}
        />
      </TableEnterprise>
    </Fragment>
  );
};

export default ListarComercios;
