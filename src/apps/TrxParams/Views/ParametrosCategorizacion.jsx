import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import useQuery from "../../../hooks/useQuery";
import { notify, notifyError } from "../../../utils/notify";
import FileInput from "../../../components/Base/FileInput";
import {
  // fetchCategoriaById,
  fetchCategorias,
  postCreateCategoria,
  // postDeleteCategoria,
  putEditCategoria,
} from "../utils/fetchParametrosCategorias";
import Select from "../../../components/Base/Select";
import { fetchZonas } from "../utils/fetchZonas";
import Fieldset from "../../../components/Base/Fieldset";
import ToggleInput from "../../../components/Base/ToggleInput";

const ParametrosCategorizacion = () => {
  const [{ searchAuto = "" }, setQuery] = useQuery();

  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  // Data zonas y categorias
  const [zonas, setZonas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState({
    id_categoria: "",
    fk_zona: null,
    nombre: "",
    img_url: "",
    edit: false,
    subcategorias: [],
  });
  const tableCategorias = useMemo(() => {
    return [
      ...categorias.map((cat) => {
        return {
          "Id categoria": cat.id_categoria,
          // "Imagen categoria": cat.img_url,
          "Nombre Categoria": cat.nombre,
          Zona:
            zonas.find((zona) => zona.id_zona === cat.fk_zona)?.nombre ??
            "No encontrado",
        };
      }),
    ];
  }, [zonas, categorias]);

  const selectZonas = useMemo(() => {
    return [
      { label: "Seleccione una opción", value: "" },
      ...zonas.map((zona) => {
        return {
          label: zona.nombre,
          value: zona.id_zona,
        };
      }),
    ];
  }, [zonas]);

  const [maxPages, setMaxPages] = useState(0);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedCategoria({
      id_categoria: "",
      fk_zona: null,
      nombre: "",
      img_url: "",
      edit: false,
      subcategorias: [],
    });
  }, []);
  const handleShowModal = useCallback(() => {
    setShowModal(true);
    setSelectedCategoria({
      id_categoria: "",
      fk_zona: null,
      nombre: "",
      img_url: "",
      edit: false,
      subcategorias: [],
    });
  }, []);

  const onSelectCategorias = useCallback(
    async (e, i) => {
      const selected = categorias[i];
      // console.log(selected);
      setSelectedCategoria({
        id_categoria: selected.id_categoria,
        fk_zona: selected.fk_zona,
        nombre: selected.nombre,
        img_url: selected.img_url,
        subcategorias: selected.subcategorias,
        edit: true,
      });
      setShowModal(true);
    },
    [categorias]
  );

  const onChange = useCallback(
    (ev) => {
      const formData = new FormData(ev.target.form);
      const nameAuto = formData.get("searchAuto");
      setQuery({ searchAuto: nameAuto }, { replace: true });
    },
    [setQuery]
  );

  const fetchAllCategorias = useCallback(() => {
    fetchCategorias({ page, limit })
      .then((res) => {
        setCategorias(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  }, [page, limit]);

  const fetchAllZonas = useCallback(() => {
    fetchZonas()
      .then((res) => {
        setZonas(res?.results);
        // setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetchAllZonas();
    fetchAllCategorias();
  }, [page, limit, searchAuto, fetchAllCategorias, fetchAllZonas]);

  const createCategoria = useCallback(async () => {
    const formData = new FormData();
    formData.append("nombre", selectedCategoria.nombre);
    formData.append("fk_zona", selectedCategoria.fk_zona);
    formData.append("img_url", selectedCategoria.img_url[0]);

    if (selectedCategoria.subcategorias.length > 0) {
      selectedCategoria.subcategorias.forEach((sub, index) => {
        formData.append(`subcategorias[${index}][nombre]`, sub.nombre);
        // Comentado por si se requiere subir imágenes de subcategorias
        formData.append(`subcategorias[${index}][img_url]`, sub.img_url[0]);
      });
    }

    // Iterar sobre FormData y mostrar en la consola
    // for (const pair of formData.entries()) {
    //   console.log(pair[0] + ", " + pair[1]);
    // }
    // console.log(Object.fromEntries(formData));

    try {
      const res = await postCreateCategoria(formData);
      // console.log(res);
      if (res?.status) {
        notify("Categoria creada correctamente");
        fetchAllCategorias();
        handleClose();
      } else {
        notifyError("Error al crear categoria");
      }
    } catch (err) {
      notifyError("Error al crear categoria");
      console.error(err);
    }
  }, [selectedCategoria, fetchAllCategorias, handleClose]);

  const editCategoria = useCallback(async () => {
    const formData = new FormData();
    formData.append("id_categoria", selectedCategoria.id_categoria);
    formData.append("nombre", selectedCategoria.nombre);
    formData.append("fk_zona", selectedCategoria.fk_zona);
    formData.append("status", selectedCategoria.status);
    formData.append("comercios", selectedCategoria.comercios);
    if (typeof selectedCategoria.img_url === "string") {
      formData.append("img_url", selectedCategoria.img_url);
    } else {
      formData.append("img_url", selectedCategoria.img_url[0]);
    }
    if (selectedCategoria.subcategorias.length > 0) {
      selectedCategoria.subcategorias.forEach((sub, index) => {
        formData.append(`subcategorias[${index}][nombre]`, sub.nombre);
        if (sub.id_categoria) {
          formData.append(
            `subcategorias[${index}][id_categoria]`,
            sub.id_categoria
          );
          formData.append(`subcategorias[${index}][status]`, sub.status);
        }
        formData.append(`subcategorias[${index}][comercios]`, sub.comercios);
        // Comentado por si se requiere subir imágenes de subcategorias
        typeof sub.img_url === "string"
          ? formData.append(`subcategorias[${index}][img_url]`, sub.img_url)
          : formData.append(`subcategorias[${index}][img_url]`, sub.img_url[0]);
      });
    }
    // Iterar sobre FormData y mostrar en la consola
    // for (const pair of formData.entries()) {
    //   console.log(pair[0] + ", " + pair[1]);
    // }
    // console.log(Object.fromEntries(formData));
    try {
      const res = await putEditCategoria(formData);
      // console.log(res);
      if (res?.status) {
        notify("Categoria editada correctamente");
        fetchAllCategorias();
        handleClose();
      } else {
        notifyError("Error al editar categoria");
      }
    } catch (err) {
      notifyError("Error al editar categoria");
      console.error(err);
    }
  }, [selectedCategoria, fetchAllCategorias, handleClose]);

  // const deleteCategoria = useCallback(async () => {
  //   const body = {
  //     id_categoria: parseInt(selectedCategoria.id_categoria),
  //   };
  //   console.log(body);
  //   try {
  //     const res = await postDeleteCategoria(body);
  //     console.log(res);
  //     if (res?.status) {
  //       notify("Categoria eliminada correctamente");
  //       fetchAllCategorias();
  //       handleClose();
  //     } else {
  //       notifyError("Error al eliminar categoria");
  //     }
  //   } catch (err) {
  //     notifyError("Error al eliminar categoría");
  //     console.error(err);
  //   }
  // }, [selectedCategoria, fetchAllCategorias, handleClose]);

  return (
    <Fragment>
      <ButtonBar>
        <Button type="submit" onClick={handleShowModal}>
          Crear categoría
        </Button>
      </ButtonBar>
      {/* {JSON.stringify(categorias)} */}
      <TableEnterprise
        title="Categorías"
        maxPage={maxPages}
        headers={["ID", "Nombre Categoría", "Zona"]}
        data={tableCategorias}
        onSelectRow={onSelectCategorias}
        onSetPageData={setPageData}
        onChange={onChange}
        children={null}
      />
      <Modal show={showModal} handleClose={handleClose}>
        {/* {JSON.stringify(selectedCategoria)} */}
        <Form
          onSubmit={() =>
            selectedCategoria.edit ? editCategoria() : createCategoria()
          }
          grid
        >
          <Input
            id="Nombre categoria"
            name="nombre"
            label={"Nombre categoria"}
            type="text"
            autoComplete="off"
            value={selectedCategoria.nombre}
            onChange={(e) => {
              setSelectedCategoria((old) => ({
                ...old,
                nombre: e.target.value,
              }));
            }}
            required
            maxLength={100}
          />
          <Select
            value={selectedCategoria.fk_zona}
            label="Zona"
            options={selectZonas}
            onChange={(e) => {
              setSelectedCategoria((old) => ({
                ...old,
                fk_zona: parseInt(e.target.value),
              }));
            }}
          />
          <FileInput
            id="Imagen categoria"
            name="img_url"
            label={"Seleccionar imagen"}
            type="file"
            autoComplete="off"
            required={selectedCategoria.edit ? false : true}
            onGetFile={(file) => {
              // console.log(file);
              if (file[0]?.size > 1000000) {
                notifyError("El peso de la imagen no debe ser mayor a 1MB");
                return;
              } else if (
                file[0]?.type !== "image/png" &&
                file[0]?.type !== "image/jpeg" &&
                file[0]?.type !== "image/jpg"
              ) {
                notifyError("El formato de la imagen debe ser PNG, JPG o JPEG");
                return;
              }
              setSelectedCategoria((old) => ({ ...old, img_url: file }));
            }}
            accept="image/png, image/jpeg, image/jpg"
          />
          {!selectedCategoria.edit && selectedCategoria.img_url && (
            <div className="flex flex-col items-center justify-center">
              <img
                src={
                  selectedCategoria?.img_url[0]
                    ? URL.createObjectURL(selectedCategoria?.img_url[0])
                    : ""
                }
                alt="Imagen sub-categoria"
                width="100"
                height="100"
                className="max-w-xs"
              />
              Peso de la imagen:{" "}
              {selectedCategoria.img_url[0]?.size
                ? selectedCategoria.img_url[0]?.size / 1000000
                : 0}{" "}
              MB
            </div>
          )}
          {selectedCategoria.edit &&
          typeof selectedCategoria.img_url === "string" ? (
            <div className="flex flex-col items-center justify-center">
              <img
                src={selectedCategoria.img_url}
                alt="Imagen sub-categoria"
                width="100"
                height="100"
                className="max-w-xs"
              />
            </div>
          ) : selectedCategoria.edit &&
            selectedCategoria.img_url &&
            selectedCategoria.img_url[0] ? (
            <div className="flex flex-col items-center justify-center">
              <img
                src={
                  selectedCategoria?.img_url[0]
                    ? URL.createObjectURL(selectedCategoria?.img_url[0])
                    : ""
                }
                alt="Imagen sub-categoria"
                width="100"
                height="100"
                className="max-w-xs"
              />
              Peso de la imagen:{" "}
              {selectedCategoria.img_url[0]?.size
                ? selectedCategoria.img_url[0]?.size / 1000000
                : 0}{" "}
              MB
            </div>
          ) : (
            <p className="text-center">
              La imagen no debe superar los 1MB y debe tener formato PNG, JPEG o
              JPG
            </p>
          )}
          <Fieldset legend="Sub-Categorias">
            {selectedCategoria.subcategorias?.map((subcategoria, index) => (
              <div className="py-2 my-2 border border-black" key={index}>
                <Input
                  key={index}
                  id="Nombre sub-categoria"
                  name="nombre"
                  label={"Nombre sub-categoria"}
                  type="text"
                  autoComplete="off"
                  value={subcategoria.nombre}
                  onChange={(e) => {
                    setSelectedCategoria((old) => ({
                      ...old,
                      subcategorias: old.subcategorias.map((sub) => {
                        if (sub === subcategoria) {
                          return {
                            ...sub,
                            nombre: e.target.value,
                          };
                        }
                        return sub;
                      }),
                    }));
                  }}
                  maxLength={100}
                />
                <FileInput
                  id={`Imagen sub-categoria ${subcategoria.nombre}`}
                  name="img_url"
                  label={"Seleccionar imagen"}
                  type="file"
                  autoComplete="off"
                  required={selectedCategoria.edit ? false : true}
                  onGetFile={(file) => {
                    // console.log(file);
                    if (file[0]?.size > 1000000) {
                      notifyError(
                        "El peso de la imagen no debe ser mayor a 1MB"
                      );
                      return;
                    } else if (
                      file[0]?.type !== "image/png" &&
                      file[0]?.type !== "image/jpeg" &&
                      file[0]?.type !== "image/jpg"
                    ) {
                      notifyError(
                        "El formato de la imagen debe ser PNG, JPG o JPEG"
                      );
                      return;
                    }
                    setSelectedCategoria((old) => ({
                      ...old,
                      subcategorias: old.subcategorias.map((sub) => {
                        if (sub.nombre === subcategoria.nombre) {
                          return {
                            ...sub,
                            img_url: file,
                          };
                        }
                        return sub;
                      }),
                    }));
                  }}
                  accept="image/png, image/jpeg, image/jpg"
                />
                {!selectedCategoria.edit && subcategoria.img_url && (
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src={
                        subcategoria?.img_url[0]
                          ? URL.createObjectURL(subcategoria?.img_url[0])
                          : ""
                      }
                      alt="Imagen sub-categoria"
                      width="100"
                      height="100"
                      className="max-w-xs"
                    />
                    Peso de la imagen:{" "}
                    {subcategoria.img_url[0]?.size
                      ? subcategoria.img_url[0]?.size / 1000000
                      : 0}{" "}
                    MB
                  </div>
                )}
                {selectedCategoria.edit &&
                typeof subcategoria.img_url === "string" ? (
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src={subcategoria.img_url}
                      alt="Imagen sub-categoria"
                      width="100"
                      height="100"
                      className="max-w-xs"
                    />
                  </div>
                ) : selectedCategoria.edit &&
                  subcategoria.img_url &&
                  subcategoria.img_url[0] ? (
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src={
                        subcategoria?.img_url[0]
                          ? URL.createObjectURL(subcategoria?.img_url[0])
                          : ""
                      }
                      alt="Imagen sub-categoria"
                      width="100"
                      height="100"
                      className="max-w-xs"
                    />
                    Peso de la imagen:{" "}
                    {subcategoria.img_url[0]?.size
                      ? subcategoria.img_url[0]?.size / 1000000
                      : 0}{" "}
                    MB
                  </div>
                ) : (
                  <p className="text-center">
                    La imagen no debe superar los 1MB y debe tener formato PNG,
                    JPEG o JPG
                  </p>
                )}
                {selectedCategoria.edit && (
                  <ToggleInput
                    id="status"
                    name="status"
                    label={"Activo"}
                    type="checkbox"
                    autoComplete="off"
                    checked={subcategoria.status}
                    onChange={(e) => {
                      setSelectedCategoria((old) => ({
                        ...old,
                        subcategorias: old.subcategorias.map((sub) => {
                          if (sub === subcategoria) {
                            return {
                              ...sub,
                              status: !sub.status,
                            };
                          }
                          return sub;
                        }),
                      }));
                    }}
                  />
                )}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedCategoria((old) => ({
                        ...old,
                        subcategorias: old.subcategorias.filter(
                          (sub) => sub !== subcategoria
                        ),
                      }));
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
            <ButtonBar>
              <Button
                type="button"
                onClick={() => {
                  setSelectedCategoria((old) => ({
                    ...old,
                    subcategorias: [
                      ...old.subcategorias,
                      {
                        nombre: "",
                        status: true,
                      },
                    ],
                  }));
                }}
              >
                Crear sub-categoria
              </Button>
            </ButtonBar>
          </Fieldset>
          <ButtonBar>
            {/* {selectedCategoria.edit && (
              <Button type="button" onClick={deleteCategoria}>
                Eliminar
              </Button>
            )} */}
            <Button type="button" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                !selectedCategoria.nombre ||
                !selectedCategoria.img_url?.length ||
                !selectedCategoria.fk_zona ||
                selectedCategoria.subcategorias.length === 0 ||
                selectedCategoria.subcategorias.some(
                  (sub) => !sub.nombre || !sub.img_url?.length
                )
              }
            >
              {selectedCategoria.edit ? "Editar la información" : "Aceptar"}
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default ParametrosCategorizacion;
