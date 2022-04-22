import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import fetchData from "../../../../src/utils/fetchData";
import { useMujer } from "../utils/mujerHooks";
import { toast } from "react-toastify";
import { notifyError } from "../../../utils/notify";
import { useReactToPrint } from "react-to-print";
import Tickets from "../../../components/Base/Tickets";
import useForm from "../../../hooks/useForm";
import MoneyInput from "../../../components/Base/MoneyInput/MoneyInput";
import TextArea from "../../../components/Base/TextArea";
import { useAuth, infoTicket } from "../../../hooks/AuthHooks";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import useQuery from "../../../hooks/useQuery";

const url_permissions = `${process.env.REACT_APP_URL_IAM_PDP}/users-groups`;

/* URLS para consultar información de oficinas de donde hay que hacer el reverso*/
const url_USERS = process.env.REACT_APP_URL_IAM_PDP;
const url_datosComercio = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/login`;
const urlCiudad_dane = `${process.env.REACT_APP_URL_DANE_MUNICIPIOS}`;
/**/

const Reversos = () => {
  const {
    infoLoto: {},
    ingresoreversorecibo,
  } = useMujer();

  const { roleInfo, pdpUser } = useAuth();
  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  /*__________ Fechas para consulta de transacciones del día________________ */
  const fecha = new Date();
  const fecha_ini = fecha.toLocaleDateString();

  fecha.setDate(fecha.getDate() + 1);
  const fecha_fin = fecha.toLocaleDateString();
  /*_________________________________________________________ */

  const [selected, setSelected] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [value, setValue] = useState("");
  const [ticket, setTicket] = useState(false);
  const [comercio, setComercio] = useState(null);
  const [maxPages, setMaxPages] = useState(1);
  const [trxs, setTrxs] = useState([]);
  const [motivo, setMotivo] = useState("");
  const [maxPageUsers, setMaxPageUsers] = useState(1);
  const [usuariosDB, setUsuariosDB] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [stop, setStop] = useState("");

  const [{ page: pageUSER, limit: limitUSER }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const [{ page, limit }, setPageDataRecaudos] = useState({
    page: 1,
    limit: 10,
  });

  const [{ email = "", nombre = "" }, setQuery] = useQuery();

  const fetchDane = async (codigo_dane) => {
    try {
      const resp_ciudad = await fetchData(
        urlCiudad_dane,
        "GET",
        {
          c_digo_dane_del_municipio: codigo_dane,
        },
        {},
        {},
        false
      );
      setMunicipio(resp_ciudad[0].municipio);
    } catch (err) {}
  };

  const searchUsers = useCallback((email, uname, _page, limit) => {
    const queries = {};
    if (email && email !== "") {
      queries.email = email;
    }
    if (uname && uname !== "") {
      queries.uname = uname;
    }
    if (_page) {
      queries.page = _page;
    }
    if (limit) {
      queries.limit = limit;
    }
    if (Object.keys(queries).length > 0) {
      fetchData(`${url_USERS}/users`, "GET", queries)
        .then((res) => {
          if (res?.status) {
            console.log(res);
            setUsuariosDB(res?.obj?.results);
            setMaxPageUsers(res?.obj?.maxpages);
          }
        })
        .catch(() => {});
    } else {
      setUsuariosDB([]);
    }
  }, []);

  const onChange = useCallback(
    (ev) => {
      if (ev.target.name === "email") {
        setQuery({ email: ev.target.value }, { replace: true });
      } else if (ev.target.name === "nombre") {
        setQuery({ nombre: ev.target.value }, { replace: true });
      }
    },
    [setQuery]
  );

  useEffect(() => {
    searchUsers(email, nombre, pageUSER, limitUSER);
  }, [nombre, email, pageUSER, limitUSER]);
  console.log(pageUSER, limitUSER);

  useEffect(() => {
    reversosFDLM(page, comercio, 5, fecha_ini, fecha_fin, true, limit);
  }, [page, limit]);

  /*Consulta datos del comercio*/
  const ConsultaComercio = useCallback(async (email) => {
    const query = { correo: email };
    try {
      const res = await fetchData(url_datosComercio, "GET", query);
      console.log(res);
      if ("id_comercio" in res) {
        setComercio(res);
        reversosFDLM(page, res, 5, fecha_ini, fecha_fin, true, limit);
        fetchDane(res?.codigo_dane);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const [data, handleChange] = useForm({
    credit: "",
    reference: "",
  });

  const pageStyle = `
  @page {
    size: 80mm 50mm;
  }

  @media all {
    .pagebreak {
      display: none;
    }
  }

  @media print {
    .pagebreak {
      page-break-before: always;
    }
  }
`;
  const { infoTicket } = useAuth();

  // Envio del ticket para guardarolo en transacciones
  useEffect(() => {
    infoTicket(selected?.id_trx, 6, tickets);
  }, [infoTicket, selected, ticket]);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    pageStyle: pageStyle,
  });

  const notify = (msg) => {
    toast.info(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const reversosFDLM = useCallback(
    (page, Comercio, Tipo_operacion, date_ini, date_end, state, limit) => {
      setStop(true);
      const url = `${process.env.REACT_APP_URL_TRXS_TRX}/transaciones-view`;
      const queries = {};
      if (!(Comercio?.id_comercio === -1 || Comercio?.id_comercio === "")) {
        queries.id_comercio = Comercio?.id_comercio;
      }
      if (Tipo_operacion) {
        queries.id_tipo_transaccion = Tipo_operacion;
      }
      if (page) {
        queries.page = page;
      }
      if (date_ini && date_end) {
        queries.date_ini = date_ini;
        queries.date_end = date_end;
      }
      if (state !== undefined || state !== null) {
        queries.status_trx = state;
      }
      if (limit !== undefined || limit !== null) {
        queries.limit = limit;
      }
      console.log(queries);
      fetchData(url, "GET", queries)
        .then((res) => {
          console.log(res);
          if (res?.status) {
            setStop(false);
            if (res?.obj?.trxs.length < 1) {
              notifyError(
                "No se encontraron transacciones en el rango de fechas"
              );
            }
            setMaxPages(res?.obj?.maxpages);
            setTrxs(res?.obj?.trxs);
          } else {
            setStop(false);
            throw new Error(res?.msg);
          }
        })
        .catch(() => {});
    },
    []
  );

  const tickets = useMemo(() => {
    return {
      title: "Recibo de pago(Reverso recaudo)",
      timeInfo: {
        "Fecha de pago": Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(new Date()),
        Hora: Intl.DateTimeFormat("es-CO", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        }).format(new Date()),
      },
      commerceInfo: Object.entries({
        "Id Comercio": comercio?.id_comercio,
        "No. terminal": comercio?.id_dispositivo,
        Municipio: municipio,
        Dirección: comercio?.direccion,
        "Id Trx": selected.id_trx,
        "Id Confirmación": "Id FDLM",
      }),
      commerceName: "FUNDACIÓN DE LA MUJER",
      trxInfo: [
        ["CRÉDITO", selected?.res_obj?.info?.credito],
        ["VALOR", formatMoney.format(value)],
        ["Cliente", selected?.res_obj?.info?.cliente],
        ["", ""],
        ["Cédula", selected?.res_obj?.info?.cedula],
        ["", ""],
      ],
      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [
    comercio?.ciudad,
    comercio?.direccion,
    comercio?.id_comercio,
    comercio?.id_dispositivo,
    selected,
    value,
  ]);

  const closeModal = useCallback(async (ticket) => {
    setTicket(false);
    setShowModal(false);
    handleChange();
    console.log(ticket);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const reverse = (e) => {
    e.preventDefault();
    const values = {
      tipo: comercio?.tipo_comercio,
      dispositivo: comercio?.id_dispositivo,
      usuario: comercio?.id_usuario,
      comercio: comercio?.id_comercio,
      idtrx: selected?.id_trx,
      val: value,
      motivo: motivo,
      ...data,
    };
    ingresoreversorecibo(values)
      .then((res) => {
        console.log(res);
        setTicket(true);
        if (res?.status === false) {
          setTicket(false);
          console.log(res);
          notifyError(res?.obj?.Mensaje);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  console.log(selectedUsers);
  return (
    <>
      <h1 className="text-3xl mt-6">Reversos</h1>
      <TableEnterprise
        title="Comercios"
        maxPage={maxPageUsers}
        onChange={onChange}
        headers={["Id", "Nombre completo", "E-mail"]}
        data={usuariosDB.map(({ uuid, uname, email }) => {
          return { uuid, uname, email };
        })}
        onSelectRow={(e, i) => {
          ConsultaComercio(usuariosDB[i].email);
        }}
        onSetPageData={setPageData}
      >
        <Input
          id="email"
          name="email"
          label={"email"}
          type="text"
          autoComplete="off"
          defaultValue={email}
        />
        <Input
          id="nombre"
          name="nombre"
          label={"nombre"}
          type="text"
          autoComplete="off"
          defaultValue={nombre}
        />
      </TableEnterprise>

      <Modal show={showModal} handleClose={() => closeModal(ticket)}>
        {ticket !== false ? (
          <div className="flex flex-col justify-center items-center">
            <Tickets refPrint={printDiv} ticket={tickets} />
            <ButtonBar>
              <Button
                onClick={() => {
                  handlePrint();
                }}
              >
                Imprimir
              </Button>
              <Button
                onClick={() => {
                  closeModal(ticket);
                }}
              >
                Cerrar
              </Button>
            </ButtonBar>
          </div>
        ) : (
          <>
            <>
              <h1 className="sm:text-center font-semibold">
                ¿Esta seguro del reverso de la obligación?
              </h1>
              <Form onSubmit={reverse} grid>
                <Input
                  id="idTrx"
                  name="idTrx"
                  label="ID de transacción"
                  type="text"
                  autoComplete="off"
                  value={selected?.id_trx}
                  disabled
                ></Input>
                <Input
                  id="nroCredito"
                  name="credit"
                  label="Número crédito"
                  type="text"
                  autoComplete="off"
                  minLength={"7"}
                  maxLength={"12"}
                  value={data?.credit ?? ""}
                  onInput={handleChange}
                  required
                ></Input>
                <MoneyInput
                  id="valCredito"
                  name="val"
                  label="Valor crédito"
                  type="text"
                  autoComplete="off"
                  maxLength={"15"}
                  value={value ?? ""}
                  // onInput={(e, valor) => {
                  //   const num = valor || "";
                  //   setValue(num);
                  // }}
                  required
                ></MoneyInput>
                <Input
                  id="refCredito"
                  name="reference"
                  label="Referencia"
                  type="text"
                  autoComplete="off"
                  value={data?.reference ?? ""}
                  onInput={handleChange}
                ></Input>
                <TextArea
                  id="motivo"
                  label="Motivo"
                  type="text"
                  autoComplete="off"
                  value={motivo}
                  required
                  onInput={(e) => {
                    setMotivo(e.target.value);
                  }}
                />
                <ButtonBar>
                  <Button type="submit" disabled={stop}>
                    Aceptar
                  </Button>
                </ButtonBar>
              </Form>
            </>
          </>
        )}
      </Modal>
      {Array.isArray(trxs) && trxs.length > 0 ? (
        <>
          <h1 className="text-2xl mt-6">
            Transacciones de {comercio["nombre comercio"]}
          </h1>
          <TableEnterprise
            title="Recaudos"
            maxPage={maxPages}
            // onChange={onChangeRecaudos}
            headers={[
              "ID transacción",
              "Fecha",
              "Cedula",
              "Credito",
              "Referencia",
              "Monto",
            ]}
            data={trxs.map(({ id_trx, created, res_obj, monto }) => {
              const tempDate = new Date(created);
              tempDate.setHours(tempDate.getHours() + 5);
              created = Intl.DateTimeFormat("es-CO", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              }).format(tempDate);
              monto = formatMoney.format(monto);
              const referencia = res_obj?.Referencia;
              const credito = res_obj?.info?.credito;
              const cedula = res_obj?.info?.cedula;
              return {
                id_trx,
                created,
                cedula,
                credito,
                referencia,
                monto,
              };
            })}
            onSelectRow={(_e, index) => {
              setSelected(trxs[index]);
              setShowModal(true);
              setValue(parseFloat(trxs[index]?.monto));
            }}
            onSetPageData={setPageDataRecaudos}
          ></TableEnterprise>
        </>
      ) : (
        ""
      )}
    </>
  );
};
export default Reversos;
