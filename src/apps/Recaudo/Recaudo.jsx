import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppIcons from "../../components/Base/AppIcons/AppIcons";
import ButtonBar from "../../components/Base/ButtonBar";
import ButtonLink from "../../components/Base/ButtonLink/ButtonLink";
// import HNavbar from "../../components/Base/HNavbar";
import InputSuggestions from "../../components/Base/InputSuggestions";
import fetchData from "../../utils/fetchData";

// const urlConvenios = process.env.REACT_APP_URL_REVAL_CONVENIOS;
const urlConvenios =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

const urlBroker = "http://localhost:8000/api";

const initialItems = [
  {
    link: "/recaudo/manual?id_convenio=2",
    label: <AppIcons Logo="" name={"Mas transado 1"} />,
  },
  {
    link: "/recaudo/manual?id_convenio=3",
    label: (
      <AppIcons
        Logo="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/ETB_Bogot%C3%A1_logo.svg/800px-ETB_Bogot%C3%A1_logo.svg.png"
        name={"Mas transado 2"}
      />
    ),
  },
  {
    link: "/recaudo/manual?id_convenio=4",
    label: <AppIcons Logo="" name={"Mas transado 3"} />,
  },
];

const Recaudo = () => {
  const [, setMostUsed] = useState([]);

  const [foundConv, setFoundConv] = useState([]);

  const mapSuggestions = useMemo(
    () =>
      foundConv.map(({ pk_id_convenio, nombre_convenio }) => (
        <div
          onClick={() => {
            fetchData(
              `${urlBroker}/recaudo/consulta-autorizadores`,
              "POST",
              {},
              {
                comercio: {
                  id_comercio: 59,
                  id_usuario: 8202,
                  id_terminal: 133,
                  nombre_comercio: "PDP COTA",
                },
                ubicacion: {
                  address: "CL 12 # 4 - 29",
                  dane_code: "25214",
                  city: "Cota",
                  country: "CO",
                },
                info_transaccion: {
                  convenio: pk_id_convenio,
                  valor_transaccion: 20000,
                },
              }
            )
              .then((res) => {
                if (res?.status) {
                  console.log(res?.obj);
                } else {
                  console.error(res?.msg);
                }
              })
              .catch(() => {});
          }}
        >
          <div className="grid grid-cols-1 place-items-center px-4 py-2">
            <h1 className="text-lg">{nombre_convenio}</h1>
          </div>
        </div>
        // <Link to={`/recaudo/manual?id_convenio=${pk_id_convenio}`}>
        // </Link>
      )),
    [foundConv]
  );

  const searchConvenios = useCallback((e) => {
    const _nameConvenio = e.target.value;
    if (_nameConvenio.length > 2) {
      // setFoundConv(initialFounds);
      fetchData(`${urlConvenios}/convenios-pdp/administrar`, "GET", {
        tags: _nameConvenio,
        limit: 5,
      })
        .then((res) => {
          if (res?.status) {
            setFoundConv(res?.obj?.results);
          } else {
            console.error(res?.msg);
          }
        })
        .catch(() => {});
    } else {
      setFoundConv([]);
    }
  }, []);

  useEffect(() => {
    setMostUsed(initialItems);
    // fetchData(`${urlConvenios}/`, "GET", {})
    //   .then((res) => {
    //     if (res?.status) {
    //       setMostUsed(res?.obj);
    //     } else {
    //       console.error(res?.msg);
    //     }
    //   })
    //   .catch((err) => console.error(err));
  }, []);

  return (
    <Fragment>
      {/* <ButtonBar>
        <ButtonLink to="/recaudo/codigo">Leer codigo de barras</ButtonLink>
      </ButtonBar> */}
      {/* <HNavbar links={mostUsed} isIcon /> */}
      <InputSuggestions
        id={"searchConv"}
        label={"Buscar convenio"}
        name={"nameConvenio"}
        type={"search"}
        autoComplete="off"
        suggestions={mapSuggestions || []}
        onLazyInput={{
          callback: searchConvenios,
          timeOut: 500,
        }}
      />
    </Fragment>
  );
};

export default Recaudo;
