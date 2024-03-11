import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import Modal from "../../../../components/Base/Modal/Modal";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import useQuery from "../../../../hooks/useQuery";
import { notify, notifyError } from "../../../../utils/notify";
import {
  fetchZonas,
  postCreateZona,
  // postDeleteZona,
  putEditZona,
} from "../../utils/fetchZonas";

const ParametrosZonas = () => {
  const [{ searchAuto = "" }, setQuery] = useQuery();

  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  // Data zonas y categorias
  const [allZonas, setAllZonas] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [selectedZona, setSelectedZona] = useState({
    id_zona: "",
    nombre: "",
    edit: false,
  });

  const tableZonas = useMemo(() => {
    return [
      ...zonas.map((zona) => {
        return {
          "Id zona": zona.id_zona,
          "Nombre Zona": zona.nombre,
        };
      }),
    ];
  }, [zonas]);

  const [maxPages, setMaxPages] = useState(0);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedZona({
      id_zona: "",
      nombre: "",
      edit: false,
    });
  }, []);
  const handleShowModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const onSelectZonas = useCallback(
    (e, i) => {
      handleShowModal();
      setSelectedZona((old) => ({
        ...old,
        id_zona: zonas[i].id_zona,
        nombre: zonas[i].nombre,
        edit: true,
      }));
    },
    [zonas, handleShowModal]
  );

  const onChange = useCallback(
    (ev) => {
      const formData = new FormData(ev.target.form);
      const nameAuto = formData.get("searchAuto");
      setQuery({ searchAuto: nameAuto }, { replace: true });
    },
    [setQuery]
  );

  const fetchZonasPages = useCallback(() => {
    fetchZonas({ page, limit })
      .then((res) => {
        console.log("zonas", res);
        setZonas(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  }, [page, limit]);

  const fetchAllZonas = useCallback(() => {
    fetchZonas({ page: 1, limit: 1000 })
      .then((res) => {
        setAllZonas(res?.results);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetchZonasPages();
    fetchAllZonas();
  }, [page, limit, searchAuto, fetchZonasPages, fetchAllZonas]);

  const createZona = useCallback(async () => {
    // Validar que no existan zonas con el mismo nombre
    const exist = allZonas.find((zona) => zona.nombre === selectedZona.nombre);
    if (exist) {
      notifyError("Ya existe una zona con ese nombre");
      return;
    }
    const formData = new FormData();
    formData.append("nombre", selectedZona.nombre);
    try {
      const res = await postCreateZona(formData);
      console.log(res);
      if (res?.status) {
        notify("Zona creada correctamente");
        fetchZonasPages();
        fetchAllZonas();
        handleClose();
      } else {
        notifyError("Error al crear zona");
      }
    } catch (err) {
      notifyError("Error al crear zona");
      console.error(err);
    }
  }, [selectedZona, fetchZonasPages, fetchAllZonas, handleClose, allZonas]);

  const editZona = useCallback(async () => {
    // Validar que no existan zonas con el mismo nombre
    const exist = allZonas.find((zona) => zona.nombre === selectedZona.nombre);
    if (exist) {
      notifyError("Ya existe una zona con ese nombre");
      return;
    }
    const formData = new FormData();
    formData.append("id_zona", selectedZona.id_zona);
    formData.append("nombre", selectedZona.nombre);
    try {
      const res = await putEditZona(formData);
      // console.log(res);
      if (res?.status) {
        notify("Zona editada correctamente");
        fetchZonasPages();
        fetchAllZonas();
        handleClose();
      } else {
        notifyError("Error al editar zona");
      }
    } catch (err) {
      notifyError("Error al editar zona");
      console.error(err);
    }
  }, [selectedZona, fetchZonasPages, fetchAllZonas, handleClose, allZonas]);

  // const deleteZona = useCallback(async () => {
  //   const body = {
  //     id_zona: parseInt(selectedZona.id_zona),
  //   }
  //   console.log(body);
  //   try {
  //     const res = await postDeleteZona(body);
  //     console.log(res);
  //     if (res?.status) {
  //       notify("Zona eliminada correctamente");
  //       fetchAllZonas();
  //       handleClose();
  //     } else {
  //       notifyError("Error al eliminar zona");
  //     }
  //   } catch (err) {
  //     notifyError("Error al eliminar zona");
  //     console.error(err);
  //   }
  // }, [selectedZona, fetchAllZonas, handleClose]);

  return (
    <Fragment>
      <ButtonBar>
        <Button type="submit" onClick={handleShowModal}>
          Crear zona
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Zonas"
        maxPage={maxPages}
        headers={["ID", "Nombre Zona"]}
        data={tableZonas}
        onSelectRow={onSelectZonas}
        onSetPageData={setPageData}
        onChange={onChange}
        children={null}
      />
      <Modal show={showModal} handleClose={handleClose}>
        <Form
          onSubmit={() => (selectedZona.edit ? editZona() : createZona())}
          grid
        >
          <Input
            id="Nombre zona"
            name="nombre"
            label={"Nombre zona"}
            type="text"
            autoComplete="off"
            value={selectedZona.nombre}
            onChange={(e) => {
              setSelectedZona((old) => ({
                ...old,
                nombre: e.target.value,
              }));
            }}
            required
            maxLength={100}
          />
          <ButtonBar>
            {/* {selectedZona.edit && (
              <Button type="button"  onClick={deleteZona}>
                Eliminar zona
              </Button>
            )} */}
            <Button type="button" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedZona.nombre}>
              {selectedZona.edit ? "Editar la información" : "Crear zona"}
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default ParametrosZonas;
