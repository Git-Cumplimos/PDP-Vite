import { useCallback, useState, useRef, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import fetchData from "../../../../src/utils/fetchData";
import { notifyError } from "../../../utils/notify";
import { useReactToPrint } from "react-to-print";
import Tickets from "../../../components/Base/Tickets";
import useForm from "../../../hooks/useForm";
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput/MoneyInput";
import TextArea from "../../../components/Base/TextArea";
import { useAuth } from "../../../hooks/AuthHooks";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import useQuery from "../../../hooks/useQuery";
import { fetchCustom } from "../utils/fetchFDLM";
import { notifyPending } from "../../../utils/notify";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../../../hooks/useFetch";

/* URLS para consultar información de oficinas de donde hay que hacer el reverso*/
const url_USERS = process.env.REACT_APP_URL_IAM_PDP;
const url_datosComercio = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/login`;
const urlCiudad_dane = `${process.env.REACT_APP_URL_DANE_MUNICIPIOS}`;
/**/
const URL_INGRESAR_REVERSO = `${process.env.REACT_APP_URL_FDLMWSDL}/ingresoreversorecibo`

const Reversos = () => {
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
  const { roleInfo, pdpUser } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState("");

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
            console.log(res)
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

  useEffect(() => {
    reversosFDLM(page, comercio, 5, fecha_ini, fecha_fin, true, limit);
  }, [page, limit]);

  /*Consulta datos del comercio*/
  const ConsultaComercio = useCallback(async (email) => {
    const query = { correo: email };
    try {
      const res = await fetchData(url_datosComercio, "GET", query);
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

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const reversosFDLM = useCallback(
    (page, Comercio, Tipo_operacion, date_ini, date_end, state, limit) => {
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
      fetchData(url, "GET", queries)
        .then((res) => {
          if (res?.status) {
            if (res?.obj?.trxs.length < 1) {
              notifyError(
                "No se encontraron transacciones en el rango de fechas"
              );
            }
            setMaxPages(res?.obj?.maxpages);
            setTrxs(res?.obj?.trxs);
          } else {
            throw new Error(res?.msg);
          }
        })
        .catch(() => {});
    },
    []
  );

  const handleClose = useCallback(() => {
    setTicket(false);
    setShowModal(false);
    handleChange();
    setMotivo("");
    setTrxs([]);
  }, []);

  const goToReverso = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const [loadingPeticionIngresarReverso, peticionIngresarReverso] = useFetch(
    fetchCustom(URL_INGRESAR_REVERSO, "POST", "Ingresar Reverso")
  );

  const reverse = (e) => {
    e.preventDefault();
    const data_request = selected?.res_obj?.request?.Datos
    const data = {
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
      },
      nombre_comercio: roleInfo?.["nombre comercio"],
      nombre_usuario: pdpUser?.uname ?? "",
      id_trx: selected?.id_trx,
      valor_total_trx: parseFloat(value),
      oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
      Datos: {
        nroBusqueda: data_request?.nroBusqueda,
        Motivo: motivo,
        Cliente: data_request?.Cliente,
        Cedula: data_request?.Cedula,
        Direccion: comercio?.direccion,
      },
    };
    notifyPending(
      peticionIngresarReverso({}, data),
      {
        render: () => {
          return "Procesando transacción";
        },
      },
      {
        render: ({data: res }) =>{
          setTicket(true);
          setTickets(res?.obj?.ticket);
          return res?.msg;
        },
      },
      {
        render({ data: err }) {
          handleClose();
          navigate("/funmujer");
          setTicket(false);
          if (err?.cause === "custom") {
            return <p style={{ whiteSpace: "pre-wrap" }}>{err?.message}</p>;
          }
          console.error(err?.message);
          return err?.message ?? "Transacción fallida";
        },
      }
    );
  };
  return (
    <>
      <h1 className='text-3xl mt-6'>Reversos</h1>
      <TableEnterprise
        title='Comercios'
        maxPage={maxPageUsers}
        onChange={onChange}
        headers={["Id", "Nombre completo", "E-mail"]}
        data={usuariosDB.map(({ uuid, uname, email }) => {
          return { uuid, uname, email };
        })}
        onSelectRow={(e, i) => {
          ConsultaComercio(usuariosDB[i].email);
        }}
        onSetPageData={setPageData}>
        <Input
          id='email'
          name='email'
          label={"email"}
          type='text'
          autoComplete='off'
          defaultValue={email}
        />
        <Input
          id='nombre'
          name='nombre'
          label={"nombre"}
          type='text'
          autoComplete='off'
          defaultValue={nombre}
        />
      </TableEnterprise>

      <Modal show={showModal}  handleClose={ticket || loadingPeticionIngresarReverso ? () => {} : handleClose}>
        {ticket !== false ? (
          <div className='flex flex-col justify-center items-center'>
            <Tickets refPrint={printDiv} ticket={tickets} />
            <ButtonBar>
            <Button onClick={handlePrint}>Imprimir</Button>
            <Button onClick={goToReverso}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <>
            <>
              <h1 className='sm:text-center font-semibold'>
                ¿Esta seguro del reverso de la obligación?
              </h1>
              {console.log(selected)}
              <Form onSubmit={reverse} grid>
                <Input
                  id='idTrx'
                  name='idTrx'
                  label='ID de transacción'
                  type='text'
                  autoComplete='off'
                  value={selected?.id_trx}
                  disabled></Input>
                <Input
                  id='nroCredito'
                  name='credit'
                  label='Número crédito'
                  type='text'
                  autoComplete='off'
                  minLength={"7"}
                  maxLength={"12"}
                  value={selected?.res_obj?.request?.Datos?.nroBusqueda ?? ""}
                  onInput={handleChange}
                  required></Input>
                <MoneyInput
                  id='valCredito'
                  name='val'
                  label='Valor crédito'
                  type='text'
                  autoComplete='off'
                  maxLength={"15"}
                  value={value ?? ""}
                  required></MoneyInput>
                <Input
                  id='refCredito'
                  name='reference'
                  label='Referencia'
                  type='text'
                  autoComplete='off'
                  value={data?.reference ?? ""}
                  onInput={handleChange}></Input>
                <TextArea
                  id='motivo'
                  label='Motivo'
                  type='text'
                  autoComplete='off'
                  value={motivo}
                  required
                  onInput={(e) => {
                    setMotivo(e.target.value);
                  }}
                />
                <ButtonBar>
                  <Button type='submit' disabled={loadingPeticionIngresarReverso}>
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
          <h1 className='text-2xl mt-6'>
            Transacciones de {comercio["nombre comercio"]}
          </h1>
          <TableEnterprise
            title='Recaudos'
            maxPage={maxPages}
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
              const res_data = res_obj?.request?.Datos;
              const referencia = res_data?.Referencia;
              const credito = res_data?.nroBusqueda;
              const cedula = res_data?.Cedula;
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
            onSetPageData={setPageDataRecaudos}></TableEnterprise>
        </>
      ) : (
        ""
      )}
    </>
  );
};
export default Reversos;
