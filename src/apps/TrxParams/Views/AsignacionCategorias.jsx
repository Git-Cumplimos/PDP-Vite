import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import useQuery from "../../../hooks/useQuery";
import { useUrls } from "../../../hooks/UrlsHooks";
import { notify, notifyError } from "../../../utils/notify";
import Select from "../../../components/Base/Select";
import { fetchZonas } from "../utils/fetchZonas";
import Fieldset from "../../../components/Base/Fieldset";
import Accordion from "../../../components/Base/Accordion";
import { fetchAllCategorias } from "../../../pages/Categorias/utils/fetchHome";
import TextArea from "../../../components/Base/TextArea";
import { postAssign } from "../utils/fetchParametrosAsignaciones";

const AsignacionCategorias = () => {
  const { allRoutes } = useUrls();
  const [allRoutesArray, setAllRoutesArray] = useState([]);
  // Chatgpt me ayudó
  const hasExtractedData = useRef(false);
  const extractData = useCallback(() => {
    if (
      !hasExtractedData.current &&
      allRoutes?.props?.children?.[0]?.props?.children
    ) {
      const extractedData = allRoutes.props.children[0].props.children.reduce(
        (accumulator, currentArray) => {
          const arrayData = currentArray.map((route) => ({
            link: route.props.path ?? "",
            label:
              route.props.element?.props?.children?.props?.label?.props?.name ??
              "",
          }));
          return [...accumulator, ...arrayData];
        },
        []
      );

      // console.log("extractedData", extractedData);
      setAllRoutesArray(extractedData);

      // Marcar como ejecutado para evitar futuras ejecuciones
      hasExtractedData.current = true;
    }
  }, [allRoutes, setAllRoutesArray]);

  useEffect(() => {
    extractData();
  }, [extractData]); // Solo depende de extractData

  const [{ searchAuto = "" }, setQuery] = useQuery();

  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  // Data zonas y categorias
  const [zonas, setZonas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedAsignacion, setSelectedAsignacion] = useState({
    app: "",
    id_categoria: "",
    id_subcategoria: "",
    subcategorias: [],
    edit: false,
  });
  const tableCategorias = useMemo(() => {
    return [
      ...(categorias || []).map((cat) => {
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

  const selectCategorias = useMemo(() => {
    const cats = [
      {
        value: "",
        label: "Seleccione",
      },
      ...categorias.map((cat) => {
        return {
          value: cat.id_categoria,
          label: cat.nombre,
        };
      }),
    ];
    return cats;
  }, [categorias]);

  const selectApps = useMemo(() => {
    const apps = [
      {
        value: "",
        label: "Seleccione",
      },
      ...allRoutesArray
        .filter((app) => app.label !== "")
        .map((app) => {
          return {
            value: app.link,
            label: app.label,
          };
        }),
    ];
    return apps;
  }, [allRoutesArray]);

  const [maxPages, setMaxPages] = useState(0);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedAsignacion({
      app: "",
      id_categoria: "",
      id_subcategoria: "",
      subcategorias: [],
      edit: false,
    });
  }, []);
  const handleShowModal = useCallback(() => {
    setShowModal(true);
    setSelectedAsignacion({
      app: "",
      id_categoria: "",
      id_subcategoria: "",
      subcategorias: [],
      edit: false,
    });
  }, []);

  const onSelectCategorias = useCallback(
    async (e, i) => {
      const selected = categorias[i];
      setSelectedAsignacion({
        app: "",
        id_categoria: selected.id_categoria,
        id_subcategoria: "",
        subcategorias: selected.subcategorias,
        edit: true,
      });
      const subcategorias = categorias.find(
        (cat) => cat.id_categoria === parseInt(selected.id_categoria)
      )?.subcategorias;
      if (subcategorias) {
        const res = subcategorias.map((subcat) => {
          return {
            value: subcat.id_subcategoria,
            label: subcat.nombre,
          };
        });
        setSelectSubcategorias([
          {
            value: "",
            label: "Seleccione",
          },
          ...res,
        ]);
      } else {
        setSelectSubcategorias([
          {
            value: "",
            label: "Seleccione",
          },
        ]);
      }
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

  const [selectSubcategorias, setSelectSubcategorias] = useState([]);

  const onChangeForm = useCallback(
    (ev) => {
      const { name, value } = ev.target;
      setSelectedAsignacion((old) => ({ ...old, [name]: value }));
      if (name === "id_categoria") {
        const subcategorias = categorias.find(
          (cat) => cat.id_categoria === parseInt(value)
        )?.subcategorias;
        if (subcategorias) {
          const res = subcategorias.map((subcat) => {
            return {
              value: subcat.id_subcategoria,
              label: subcat.nombre,
            };
          });
          setSelectSubcategorias([
            {
              value: "",
              label: "Seleccione",
            },
            ...res,
          ]);
        } else {
          setSelectSubcategorias([
            {
              value: "",
              label: "Seleccione",
            },
          ]);
        }
      }
    },
    [setSelectedAsignacion, categorias]
  );

  const fetchAllCategoriasFunc = useCallback(() => {
    fetchAllCategorias({ page, limit })
      .then((res) => {
        if (res?.status) {
          setCategorias(res.obj);
        }
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  }, [page, limit]);

  const fetchAllZonas = useCallback(() => {
    fetchZonas({ page, limit })
      .then((res) => {
        setZonas(Object.values(res));
        // setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  }, [page, limit]);

  useEffect(() => {
    fetchAllZonas();
    fetchAllCategoriasFunc();
  }, [page, limit, searchAuto, fetchAllCategoriasFunc, fetchAllZonas]);

  const asignCommerces = useCallback(async () => {
    for (const subcat of selectedAsignacion.subcategorias) {
      const body = {
        id_categoria: subcat.id_categoria,
        comercios: subcat.comercios,
      };
      try {
        const res = await postAssign(body);
        // console.log(res);
        if (res?.status) {
          // notify(`Asignación creada correctamente a la subcategoria ${subcat.nombre}`);
        } else {
          notifyError(`Error al asignar la subcategoria ${subcat.nombre}`);
        }
      } catch (err) {
        notifyError(`Error al asignar la subcategoria ${subcat.nombre}`);
        console.error(err);
      }
    }
  
    // Después de que se completen todas las asignaciones
    fetchAllCategoriasFunc();
    notify(`Asignaciones creadas correctamente`);
    handleClose();
  }, [selectedAsignacion, fetchAllCategoriasFunc, handleClose]);
  

  return (
    <Fragment>
      <ButtonBar>
        <Button type="submit" onClick={handleShowModal}>
          Crear Asignación
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Categorias"
        maxPage={maxPages}
        headers={["Id categoria", "Nombre Categoria", "Zona"]}
        data={tableCategorias}
        onSelectRow={onSelectCategorias}
        // onSetPageData={setPageData}
        onChange={onChange}
      >
        <Input
          id="searchAuto"
          name="searchAuto"
          label={"Id categoria"}
          type="number"
          autoComplete="off"
          defaultValue={searchAuto}
          maxLength={100}
        />
      </TableEnterprise>
      <Modal show={showModal} handleClose={handleClose}>
        <Form onSubmit={() => asignCommerces()} grid>
          {JSON.stringify(selectedAsignacion)}
          <Fieldset legend="Asignación">
            <Select
              id="app"
              name="app"
              label={"Comercio o Transacción"}
              value={selectedAsignacion.app}
              onChange={onChangeForm}
              options={selectApps}
            />
            <TextArea
              id="ruta"
              name="ruta"
              label={"Ruta"}
              type="text"
              autoComplete="off"
              value={selectedAsignacion.app}
              disabled
            />
            <Select
              id="id_categoria"
              name="id_categoria"
              label={"Categoría"}
              value={selectedAsignacion.id_categoria}
              onChange={onChangeForm}
              disabled={selectedAsignacion.edit}
              options={selectCategorias}
            />
            <Select
              id="id_subcategoria"
              name="id_subcategoria"
              label={"Subcategoría"}
              value={selectedAsignacion.id_subcategoria}
              onChange={onChangeForm}
              options={selectSubcategorias}
            />
            <Button
              type="button"
              onClick={(e) => {
                setSelectedAsignacion((old) => {
                  const subcat = old.subcategorias.find((subcat) => {
                    return subcat.nombre === old.id_subcategoria;
                  });
                  if (subcat) {
                    return {
                      ...old,
                      subcategorias: old.subcategorias.map((subcat) => {
                        if (subcat.nombre === old.id_subcategoria) {
                          return {
                            ...subcat,
                            comercios: [...subcat.comercios, old.app],
                          };
                        }
                        return subcat;
                      }),
                    };
                  }
                });
              }}
            >
              Asignar
            </Button>
          </Fieldset>
          <Fieldset legend="Asignados a la categoría">
            {selectedAsignacion.subcategorias &&
              selectedAsignacion.subcategorias.length > 0 &&
              selectedAsignacion.subcategorias.map((subcat) => {
                return (
                  <Accordion
                    titulo={subcat.nombre}
                    key={subcat.nombre}
                    type="button"
                  >
                    <div className="overflow-x-auto">
                      <table className="table table-auto border-collapse border border-black mx-auto">
                        <thead>
                          <tr>
                            <th
                              scope="col"
                              className="border border-black px-2"
                            >
                              Ruta
                            </th>
                            <th
                              scope="col"
                              className="border border-black px-2"
                            >
                              Comercio
                            </th>
                            <th
                              scope="col"
                              className="border border-black px-2"
                            >
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {subcat.comercios.map((campo) => {
                            return (
                              <tr key={campo}>
                                <td className="border border-black px-2">
                                  {campo}
                                </td>
                                <td className="border border-black px-2">
                                  {allRoutesArray.find(
                                    (app) => app.link === campo
                                  )?.label ?? "No encontrado"}
                                </td>
                                <td className="border border-black px-2">
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      const nombreSubcat = subcat.nombre;
                                      setSelectedAsignacion((old) => {
                                        return {
                                          ...old,
                                          subcategorias: old.subcategorias.map(
                                            (subcat) => {
                                              if (
                                                subcat.nombre === nombreSubcat
                                              ) {
                                                return {
                                                  ...subcat,
                                                  comercios:
                                                    subcat.comercios.filter(
                                                      (comercio) =>
                                                        comercio !== campo
                                                    ),
                                                };
                                              }
                                              return subcat;
                                            }
                                          ),
                                        };
                                      });
                                    }}
                                  >
                                    Eliminar
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Accordion>
                );
              })}
          </Fieldset>
          <ButtonBar>
            {/* {selectedAsignacion.edit && (
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
                selectedAsignacion.edit
                  ? false
                  : !selectedAsignacion.app ||
                    !selectedAsignacion.id_categoria ||
                    !selectedAsignacion.id_subcategoria
              }
            >
              {selectedAsignacion.edit ? "Editar" : "Crear"}
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default AsignacionCategorias;
