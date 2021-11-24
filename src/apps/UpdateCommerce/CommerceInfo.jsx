import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../components/Base/Button/Button";
import ButtonBar from "../../components/Base/ButtonBar/ButtonBar";
import Card from "../../components/Base/Card/Card";
import Form from "../../components/Base/Form/Form";
import Input from "../../components/Base/Input/Input";
import fetchData from "../../utils/fetchData";

const capitalize = (word = "") => {
  if (word.length === 0) {
    return "";
  }
  return `${word.at(0).toUpperCase()}${word.slice(1)}`;
};

const capitalizePhrase = (words = "") => {
  if (words.length === 0) {
    return "";
  }
  const caps = [];
  for (const word of words.split(" ")) {
    caps.push(capitalize(word));
  }
  return caps.join(" ");
};

const ViewUbication = ({ location }) => {
  const {
    Barrio,
    Direccion,
    Localidad,
    Nombre_departamento,
    Nombre_municipio,
    id_departamento,
  } = location;
  return (
    <ul>
      <li>Departamento: {Nombre_departamento}</li>
      <li>Municipio: {Nombre_municipio}</li>
      {id_departamento === "11" ? <li>Localidad: {Localidad}</li> : ""}
      <li>Barrio: {Barrio}</li>
      <li>Direccion: {Direccion}</li>
    </ul>
  );
};

const url_form = process.env.REACT_APP_URL_FORM_COMMERCE;

const CommerceInfo = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [countFilled, setCountFilled] = useState(0);
  const [maxPage, setMaxPage] = useState(1);

  const [fechaIni, setFechaIni] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [commerceName, setCommerceName] = useState("");

  const notifyError = (msg) => {
    toast.error(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  useEffect(() => {
    fetchData(`${url_form}/review-count`)
      .then((res) => {
        if (res?.status) {
          setCountFilled(res?.obj.comercios_actualizados);
        } else {
          notifyError(res?.msg ?? "Respuesta de servicio vacia");
        }
      })
      .catch((err) => {});
    fetchData(`${url_form}/review-all`)
      .then((res) => {
        if (res?.status) {
          setMaxPage(res?.obj.max_pages);
          setData(res?.obj.results);
        } else {
          notifyError(res?.msg ?? "Respuesta de servicio vacia");
        }
      })
      .catch((err) => {});
  }, []);

  useEffect(() => {
    const queries = {
      page,
    };
    if (fechaIni && fechaFin) {
      queries.date_ini = fechaIni;
      queries.date_fin = fechaFin;
    }
    if (commerceName) {
      queries.$q_name = commerceName;
    }
    fetchData(`${url_form}/review-all`, "GET", queries)
      .then((res) => {
        if (res?.status) {
          setMaxPage(res?.obj.max_pages);
          setData(res?.obj.results);
        } else {
          notifyError(res?.msg ?? "Respuesta de servicio vacia");
        }
      })
      .catch((err) => {});
  }, [page, commerceName, fechaFin, fechaIni]);

  return (
    <div className="flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl text-center">Revisar actualizacion de datos</h1>
      <h1 className="text-xl">Comercios actualizados: {countFilled}</h1>
      <h1 className="text-xl">Viendo {data.length} comercio(s)</h1>
      <Form grid>
        <Input
          id="init_date_commerce"
          label="Fecha inicial"
          type="date"
          value={fechaIni}
          onInput={(e) => setFechaIni(e.target.value)}
          onLazyInput={{
            callback: (e) => {
              const _fechaIni = e.target.value;
              const queries = {
                page: 1,
              };
              if (_fechaIni && fechaFin) {
                queries.date_ini = _fechaIni;
                queries.date_fin = fechaFin;
              }
              if (commerceName) {
                queries.$q_name = commerceName;
              }
              console.log(_fechaIni);
              console.log(fechaFin);
              if ("date_ini" in queries) {
                fetchData(`${url_form}/review-all`, "GET", queries)
                  .then((res) => {
                    if (res?.status) {
                      setPage(1);
                      setMaxPage(res?.obj.max_pages);
                      setData(res?.obj.results);
                    } else {
                      notifyError(res?.msg ?? "Respuesta de servicio vacia");
                    }
                  })
                  .catch((err) => {});
              }
            },
            timeOut: 250,
          }}
        />
        <Input
          id="end_date_commerce"
          label="Fecha Final"
          type="date"
          value={fechaFin}
          onInput={(e) => setFechaFin(e.target.value)}
          onLazyInput={{
            callback: (e) => {
              const _fechaFin = e.target.value;
              const queries = {
                page: 1,
              };
              if (fechaIni && _fechaFin) {
                queries.date_ini = fechaIni;
                queries.date_fin = _fechaFin;
              }
              if (commerceName) {
                queries.$q_name = commerceName;
              }
              if ("date_fin" in queries) {
                fetchData(`${url_form}/review-all`, "GET", queries)
                  .then((res) => {
                    if (res?.status) {
                      setPage(1);
                      setMaxPage(res?.obj.max_pages);
                      setData(res?.obj.results);
                    } else {
                      notifyError(res?.msg ?? "Respuesta de servicio vacia");
                    }
                  })
                  .catch((err) => {});
              }
            },
            timeOut: 250,
          }}
        />
        <Input
          id="name_commerce"
          label="Nombre de comercio"
          type="text"
          value={commerceName}
          onInput={(e) => setCommerceName(e.target.value)}
          onLazyInput={{
            callback: (e) => {
              const _commName = e.target.value;
              const queries = {
                page: 1,
              };
              if (fechaIni && fechaFin) {
                queries.date_ini = fechaIni;
                queries.date_fin = fechaFin;
              }
              if (_commName) {
                queries.$q_name = _commName;
              }
              fetchData(`${url_form}/review-all`, "GET", queries)
                .then((res) => {
                  if (res?.status) {
                    setPage(1);
                    setMaxPage(res?.obj.max_pages);
                    setData(res?.obj.results);
                  } else {
                    notifyError(res?.msg ?? "Respuesta de servicio vacia");
                  }
                })
                .catch((err) => {});
            },
            timeOut: 500,
          }}
        />
      </Form>
      {maxPage !== 1 && maxPage !== 0 ? (
        <ButtonBar>
          <Button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page < 2}
          >
            Anterior
          </Button>
          <Button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page >= maxPage}
          >
            Siguiente
          </Button>
        </ButtonBar>
      ) : (
        ""
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {data.map(
          (
            {
              Nombre_comercio,
              Tipo_comercio,
              Representante_legal: { Doc_show, Nombre },
              Contacto: { Correos, Numeros },
              Locations: { Comercio, Residencia },
              Tipos_negocio,
              Fecha_update,
              Gift_location,
            },
            index
          ) => {
            return (
              <Card key={index} className={`flex flex-col gap-4 px-4`}>
                <h1 className="text-lg font-medium">
                  {Nombre_comercio} ({Tipo_comercio})
                </h1>
                <div className="mx-4">
                  <h1 className="font-medium">Representante legal</h1>
                  <ul>
                    <li>{capitalizePhrase(Nombre?.toLowerCase() ?? "")}</li>
                    <li>{Doc_show}</li>
                  </ul>
                </div>
                <div className="mx-4">
                  <h1 className="font-medium">Contacto</h1>
                  <ul>
                    <li>
                      <ul className="list-disc list-inside">
                        {Numeros.map((val, idx) => {
                          return <li key={idx}>{val}</li>;
                        })}
                      </ul>
                    </li>
                    <li>
                      <ul className="list-disc list-inside">
                        {Correos.map((val, idx) => {
                          return <li key={idx}>{val}</li>;
                        })}
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="mx-4 w-full flex flex-row flex-wrap gap-6">
                  <div>
                    <h1 className="font-medium">Ubicacion comercio</h1>
                    <ViewUbication location={Comercio} />
                  </div>
                  <div>
                    <h1 className="font-medium">Ubicacion residencia</h1>
                    <ViewUbication location={Residencia} />
                  </div>
                </div>
                <div className="mx-4">
                  <h1 className="font-medium">Tipos de negocio</h1>
                  <ul className="list-disc list-inside">
                    {Object.entries(Tipos_negocio).map(([key, value]) => {
                      return <li key={key}>{value}</li>;
                    })}
                  </ul>
                </div>
                <div className="mx-4">
                  <h1>
                    <p className="font-medium">Lugar de envio de regalo:</p>
                    {Gift_location}
                  </h1>
                </div>
                <div className="mx-4">
                  <h1>
                    <p className="font-medium">Fecha de actualizacion:</p>
                    {Intl.DateTimeFormat("es", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      second: "numeric",
                    }).format(new Date(Fecha_update))}
                  </h1>
                </div>
              </Card>
            );
          }
        )}
      </div>
    </div>
  );
};

export default CommerceInfo;
