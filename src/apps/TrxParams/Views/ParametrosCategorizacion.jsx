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
  fetchCreatePresignedUrl,
  postCreateCategoria,
  postCreateSubCategoria,
  postDeleteCategoria,
  // postDeleteCategoria,
  putEditCategoria,
  putEditSubCategoria,
  uploadFilePresignedUrl,
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
  const [allCategorias, setAllCategorias] = useState([]);
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
        subcategorias: [
          ...selected.subcategorias.map((sub) => {
            return {
              ...sub,
              deletion: false,
            };
          }),
        ],
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
    fetchCategorias({ page: 1, limit: 1000 })
      .then((res) => {
        setAllCategorias(res?.results);
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchCategoriasPages = useCallback(() => {
    fetchCategorias({ page, limit })
      .then((res) => {
        setCategorias(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  }, [page, limit]);

  const fetchAllZonas = useCallback(() => {
    fetchZonas({ page: 1, limit: 1000 })
      .then((res) => {
        setZonas(res?.results);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetchAllZonas();
    fetchAllCategorias();
    fetchCategoriasPages();
  }, [
    page,
    limit,
    searchAuto,
    fetchCategoriasPages,
    fetchAllZonas,
    fetchAllCategorias,
  ]);

  const createCategoria = useCallback(async () => {
    // Validar que la categoria no tenga el mismo nombre, validando mayúsculas y minúsculas
    const categoriasNames = allCategorias.map((cat) =>
      cat.nombre.toLowerCase()
    );
    if (categoriasNames.includes(selectedCategoria.nombre.toLowerCase())) {
      notifyError("No pueden existir categorias con el mismo nombre");
      return;
    }
    // Validar que las subcategorias no tengan el mismo nombre, validando mayúsculas y minúsculas
    const subcategorias = selectedCategoria.subcategorias;
    const subcategoriasNames = subcategorias.map((sub) =>
      sub.nombre.toLowerCase()
    );
    const subcategoriasNamesSet = new Set(subcategoriasNames);
    if (subcategoriasNames.length !== subcategoriasNamesSet.size) {
      notifyError("No pueden existir subcategorias con el mismo nombre");
      return;
    }
    const formData = new FormData();
    formData.append("nombre", selectedCategoria.nombre);
    formData.append("fk_zona", selectedCategoria.fk_zona);

    // Cargar imagen de categoria
    const formImgCategoria = new FormData();
    // const img_name = selectedCategoria.img_url[0].name
    //   .replace(/ /g, "-")
    //   .replace(/\//g, "-");
    const img_name = `${selectedCategoria.img_url[0].name
      .replace(/ /g, "-")
      .replace(/\//g, "-")}-${new Date().toISOString().slice(0, 10)}`;

    const extension = selectedCategoria.img_url[0].name.split(".").pop();

    const img_name_with_extension = `${img_name}.${extension}`;
    formImgCategoria.append("img_name", img_name_with_extension);
    formImgCategoria.append("img_type", selectedCategoria.img_url[0].type);

    try {
      const data = await fetchCreatePresignedUrl(formImgCategoria);
      const response = await uploadFilePresignedUrl(
        data?.obj,
        selectedCategoria.img_url[0]
      );
      if (response.ok) {
        // console.log("Archivo cargado exitosamente.", response);
        formData.append("img_url", img_name_with_extension);
      } else {
        console.error("Error al cargar el archivo:", response.statusText);
        // Detener la ejecución si hay un error
        return;
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
    }

    // Iterar sobre FormData y mostrar en la consola
    // for (const pair of formData.entries()) {
    //   console.log(pair[0] + ", " + pair[1]);
    // }
    // console.log(Object.fromEntries(formData));

    try {
      const res = await postCreateCategoria(formData);
      // console.log("CREACION DE CATEGORIA", res);
      if (res?.status) {
        notify("Categoria creada correctamente. Creando subcategorias...");
        if (selectedCategoria.subcategorias.length > 0) {
          selectedCategoria.subcategorias.forEach(async (sub) => {
            const formSubcat = new FormData();
            formSubcat.append(`nombre`, sub.nombre);
            formSubcat.append(`pk_padre`, res?.obj?.id_categoria);
            formSubcat.append(`fk_zona`, selectedCategoria.fk_zona);
            // Cargar imagen de cada subcategoria
            const formImgSubCategoria = new FormData();
            const img_name = `${sub.img_url[0].name
              .replace(/ /g, "-")
              .replace(/\//g, "-")}-${new Date().toISOString().slice(0, 10)}`;

            const extension = sub.img_url[0].name.split(".").pop();

            const img_name_with_extension = `${img_name}.${extension}`;
            formImgSubCategoria.append("img_name", img_name_with_extension);
            formImgSubCategoria.append("img_type", sub.img_url[0].type);

            try {
              const data = await fetchCreatePresignedUrl(formImgSubCategoria);
              const response = await uploadFilePresignedUrl(
                data?.obj,
                sub.img_url[0]
              );
              if (response.ok) {
                // console.log("Archivo cargado exitosamente.", response);
                formSubcat.append(`img_url`, img_name_with_extension);
              } else {
                console.error(
                  "Error al cargar el archivo:",
                  response.statusText
                );
                notifyError(
                  `Error al cargar imagen de subcategoria ${sub.nombre}`
                );
              }
              const resSub = await postCreateSubCategoria(formSubcat);
              console.log("CREACION DE SUBCATEGORIA", resSub);
              if (resSub?.status) {
                notify(`Subcategoria ${sub.nombre} creada correctamente`);
              } else {
                notifyError(`Error al crear subcategoria ${sub.nombre}`);
              }
            } catch (error) {
              console.error("Error al procesar la solicitud:", error);
            }
          });
        }
      } else {
        notifyError("Error al crear categoria");
      }
    } catch (err) {
      notifyError("Error al crear categoria");
      console.error(err);
    } finally {
      fetchAllCategorias();
      fetchCategoriasPages();
      handleClose();
    }
  }, [
    selectedCategoria,
    fetchCategoriasPages,
    handleClose,
    allCategorias,
    fetchAllCategorias,
  ]);

  const editCategoria = useCallback(async () => {
    // Validar que la categoria no tenga el mismo nombre, validando mayúsculas y minúsculas
    const categoriasNames = allCategorias.map((cat) =>
      cat.nombre.toLowerCase()
    );
    if (categoriasNames.includes(selectedCategoria.nombre.toLowerCase())) {
      notifyError("No pueden existir categorias con el mismo nombre");
      return;
    }
    // Validar que las subcategorias no tengan el mismo nombre, validando mayúsculas y minúsculas
    const subcategorias = selectedCategoria.subcategorias;
    const subcategoriasNames = subcategorias.map((sub) =>
      sub.nombre.toLowerCase()
    );
    const subcategoriasNamesSet = new Set(subcategoriasNames);
    if (subcategoriasNames.length !== subcategoriasNamesSet.size) {
      notifyError("No pueden existir subcategorias con el mismo nombre");
      return;
    }
    const formData = new FormData();
    formData.append("id_categoria", selectedCategoria.id_categoria);
    formData.append("nombre", selectedCategoria.nombre);
    formData.append("fk_zona", selectedCategoria.fk_zona);
    formData.append("comercios", selectedCategoria.comercios);
    if (typeof selectedCategoria.img_url === "string") {
      formData.append("img_url", selectedCategoria.img_url);
    } else {
      const formImgCategoria = new FormData();
      const img_name = selectedCategoria.img_url[0].name
        .replace(/ /g, "-")
        .replace(/\//g, "-");
      formImgCategoria.append("img_name", img_name);
      formImgCategoria.append("img_type", selectedCategoria.img_url[0].type);

      // Iterar sobre FormData y mostrar en la consola
      // for (const pair of formData.entries()) {
      //   console.log(pair[0] + ", " + pair[1]);
      // }
      // console.log(Object.fromEntries(formData));
      try {
        const data = await fetchCreatePresignedUrl(formImgCategoria);
        const response = await uploadFilePresignedUrl(
          data?.obj,
          selectedCategoria.img_url[0]
        );
        if (response.ok) {
          // console.log("Archivo cargado exitosamente.", response);
          formData.append("img_url", img_name);
        } else {
          console.error("Error al cargar el archivo:", response.statusText);
          // Detener la ejecución si hay un error
          return;
        }
      } catch (error) {
        console.error("Error al procesar la solicitud:", error);
      }
    }
    try {
      const res = await putEditCategoria(formData);
      // console.log(res);
      if (res?.status) {
        if (selectedCategoria.subcategorias.length > 0) {
          selectedCategoria.subcategorias.forEach(async (sub) => {
            let creation = false;
            const formSubcat = new FormData();
            formSubcat.append(`nombre`, sub.nombre);
            formSubcat.append(`pk_padre`, selectedCategoria.id_categoria);
            formSubcat.append(`fk_zona`, selectedCategoria.fk_zona);
            if (sub.id_categoria) {
              formSubcat.append(`id_categoria`, sub.id_categoria);
              formSubcat.append(`status`, sub.status);
            } else {
              creation = true;
            }
            formSubcat.append(`comercios`, sub.comercios);
            if (typeof sub.img_url === "string") {
              formSubcat.append(`img_url`, sub.img_url);
            } else {
              const formImgSubCategoria = new FormData();
              const img_name = sub.img_url[0].name
                .replace(/ /g, "-")
                .replace(/\//g, "-");
              formImgSubCategoria.append("img_name", img_name);
              formImgSubCategoria.append("img_type", sub.img_url[0].type);

              try {
                const data = await fetchCreatePresignedUrl(formImgSubCategoria);
                const response = await uploadFilePresignedUrl(
                  data?.obj,
                  sub.img_url[0]
                );
                if (response.ok) {
                  // console.log("Archivo cargado exitosamente.", response);
                  formSubcat.append(`img_url`, img_name);
                } else {
                  console.error(
                    "Error al cargar el archivo:",
                    response.statusText
                  );
                  notifyError(
                    `Error al cargar imagen de subcategoria ${sub.nombre}`
                  );
                }
              } catch (error) {
                console.error("Error al procesar la solicitud:", error);
              }
            }

            // Iterar sobre FormData y mostrar en la consola
            // for (const pair of formSubcat.entries()) {
            //   console.log(pair[0] + ", " + pair[1]);
            // }

            try {
              if (sub.deletion) {
                const body = {
                  id_categoria: parseInt(sub.id_categoria),
                };
                const res = await postDeleteCategoria(body);
                // console.log("ELIMINACIÓN DE SUBCATEGORIA", res);
                if (res?.status) {
                  // notify("Categoria eliminada correctamente");
                }
              } else if (creation) {
                const resSub = await postCreateSubCategoria(formSubcat);
                // console.log("CREACION DE SUBCATEGORIA", resSub);
                if (resSub?.status) {
                  notify(`Subcategoria ${sub.nombre} creada correctamente`);
                } else {
                  notifyError(`Error al crear subcategoria ${sub.nombre}`);
                }
              } else {
                const resSub = await putEditSubCategoria(formSubcat);
                console.log("EDICION DE SUBCATEGORIA", resSub);
                if (resSub?.status) {
                  notify(`Subcategoria ${sub.nombre} editada correctamente`);
                } else {
                  notifyError(`Error al editar subcategoria ${sub.nombre}`);
                }
              }
            } catch (error) {
              console.error("Error al procesar la solicitud:", error);
            }
          });
        }
      } else {
        notifyError("Error al editar categoria");
      }
    } catch (err) {
      notifyError("Error al editar categoria");
      console.error(err);
    } finally {
      notify("Categoria editada correctamente");
      fetchAllCategorias();
      fetchCategoriasPages();
      handleClose();
    }
  }, [
    selectedCategoria,
    fetchCategoriasPages,
    handleClose,
    allCategorias,
    fetchAllCategorias,
  ]);

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
  //       fetchCategoriasPages();
  //       handleClose();
  //     } else {
  //       notifyError("Error al eliminar categoria");
  //     }
  //   } catch (err) {
  //     notifyError("Error al eliminar categoría");
  //     console.error(err);
  //   }
  // }, [selectedCategoria, fetchCategoriasPages, handleClose]);

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
            {selectedCategoria.subcategorias?.map(
              (subcategoria, index) =>
                !subcategoria.deletion && (
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
                    {selectedCategoria.edit && subcategoria.img_url && (
                      <div className="flex flex-col items-center justify-center">
                        <img
                          src={
                            typeof subcategoria.img_url === "string"
                              ? subcategoria.img_url
                              : subcategoria.img_url[0]
                              ? URL.createObjectURL(subcategoria.img_url[0])
                              : ""
                          }
                          alt="Imagen sub-categoria"
                          width="100"
                          height="100"
                          className="max-w-xs"
                        />
                        {subcategoria.img_url && (
                          <p>
                            Peso de la imagen:{" "}
                            {subcategoria.img_url[0]?.size
                              ? (
                                  subcategoria.img_url[0].size / 1000000
                                ).toFixed(2)
                              : 0}{" "}
                            MB
                          </p>
                        )}
                      </div>
                    )}

                    {!selectedCategoria.edit && (
                      <p className="text-center">
                        La imagen no debe superar los 1MB y debe tener formato
                        PNG, JPEG o JPG
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
                            subcategorias: old.subcategorias.map((sub) => {
                              if (sub === subcategoria) {
                                return {
                                  ...sub,
                                  deletion: true,
                                };
                              }
                              return sub;
                            }),
                          }));
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )
            )}
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
          {/* {JSON.stringify(selectedCategoria)} */}
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
                  (sub) => !sub.nombre || !sub.img_url
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
