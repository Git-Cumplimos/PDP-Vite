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
import Table from "../../../components/Base/Table";
import useForm from "../../../hooks/useForm";
import MoneyInput from "../../../components/Base/MoneyInput/MoneyInput";
import TextArea from "../../../components/Base/TextArea";
import { useAuth, infoTicket } from "../../../hooks/AuthHooks";
import PaginationAuth from "../../../components/Compound/PaginationAuth/PaginationAuth";

const url_permissions = `${process.env.REACT_APP_URL_IAM_PDP}/users-groups`;

/* URLS para consultar información de oficinas de donde hay que hacer el reverso*/
const url = process.env.REACT_APP_URL_IAM_PDP;
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

  const fecha = new Date();
  /* Fechas para consulta de transacciones del día */
  const fecha_ini = Intl.DateTimeFormat("az").format(fecha);
  const fecha_fin = Intl.DateTimeFormat("az").format(
    fecha.setDate(fecha.getDate() + 1)
  );
  /*_________________________________________________________ */

  const [selected, setSelected] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [value, setValue] = useState("");
  const [ticket, setTicket] = useState(false);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [comercio, setComercio] = useState(null);
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [trxs, setTrxs] = useState([]);
  const [motivo, setMotivo] = useState("");

  const [maxPageUsers, setMaxPageUsers] = useState(1);
  const [formData, setFormData] = useState(new FormData());
  const [usuariosDB, setUsuariosDB] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState("");
  const [municipio, setMunicipio] = useState("");

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

  const searchUsers = useCallback((email, uname, _page) => {
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
    if (Object.keys(queries).length > 0) {
      fetchData(`${url}/users`, "GET", queries)
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
    (_formData) => {
      setTrxs([]);
      setComercio(null);
      setFormData(_formData);
      searchUsers(
        _formData?.get("emailSearch"),
        _formData?.get("unameSearch"),
        _formData?.get("page")
      );
    },
    [searchUsers]
  );

  /*Consulta datos del comercio*/
  const ConsultaComercio = useCallback(async (email) => {
    const query = { correo: email };
    try {
      const res = await fetchData(url_datosComercio, "GET", query);
      console.log(res);
      if ("id_comercio" in res) {
        setComercio(res);
        reversosFDLM(page, res, 5, fecha_ini, fecha_fin, true);
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
    infoTicket(selected?.id_transaccion, 6, tickets);
  }, [infoTicket, selected, ticket]);

  // //  Consulta transacciones de recaudo del dia
  // useEffect(() => {
  //   console.log(fecha_fin,fecha_ini)
  //   reversosFDLM(page, roleInfo?.id_comercio, 5, fecha_ini, fecha_fin, true);
  // },[ticket])

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
    (page, Comercio, Tipo_operacion, date_ini, date_end, state) => {
      const url = `${process.env.REACT_APP_URL_TRXS_TRX}/transaciones-view`;
      const queries = {};
      if (!(Comercio.id_comercio === -1 || Comercio.id_comercio === "")) {
        queries.id_comercio = Comercio.id_comercio;
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
      console.log(queries);
      fetchData(url, "GET", queries)
        .then((res) => {
          console.log(res);
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
        "Id Trx": selected.id_transaccion,
        "Id Confirmación": "Id FDLM",
      }),
      commerceName: "FUNDACIÓN DE LA MUJER",
      trxInfo: [
        ["CRÉDITO", selected?.Response_obj?.info?.credito],
        ["VALOR", formatMoney.format(value)],
        ["Cliente", selected?.Response_obj?.info?.cliente],
        ["", ""],
        ["Cédula", selected?.Response_obj?.info?.cedula],
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
    setShowModal(false);
    handleChange();
    console.log(ticket);
    // if (ticket===true){

    //   deltetePermission(pdpUser?.uuid,9).then((res) => {
    //     if (res.status===false) {
    //       notifyError(res?.msg);
    //       setTicket(false);
    //       window.location.replace('/funmujer');
    //     } else {
    //       notify(res?.msg)
    //       setTicket(false);
    //       window.location.replace('/funmujer');
    //     }
    //   });

    // }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  /*Eliminar permiso de reversar*/
  // const deltetePermission = useCallback(async (id_user,id_group) => {
  //   const query={
  //     "Users_uuid":id_user,
  //     "Groups_id_group":id_group}
  //   try {
  //     const res = await fetchData(url_permissions, "DELETE",query);
  //     console.log(res)
  //     return res;
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, []);

  const reverse = (e) => {
    e.preventDefault();
    const values = {
      tipo: comercio?.tipo_comercio,
      id_dispositivo: comercio?.id_dispositivo,
      usuario: comercio?.id_usuario,
      comercio: comercio?.id_comercio,
      idtrx: selected?.id_transaccion,
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

          // if (res?.codigo === 420) {
          //   notifyError(
          //     "Reverso ya aplicado a el respectivo ID de transacción"
          //   );
          // } else {
          //   notifyError(
          //     "Consulte soporte, servicio de Fundación de la mujer presenta fallas"
          //   );
          // }
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
      <Form grid>
        {/* <Input
          id="dateInit"
          label="Fecha inicial"
          type="date"
          value={fechaInicial}
          onInput={(e) => {
            setFechaInicial(e.target.value);
            if (fechaFinal !== "") {
              reversosFDLM(page, roleInfo?.id_comercio, 5, e.target.value, fechaFinal, true);
            }
          }}
        />
        <Input
          id="dateInit"
          label="Fecha final"
          type="date"
          value={fechaFinal}
          onInput={(e) => {
            setFechaFinal(e.target.value);
            if (fechaInicial !== "") {
              reversosFDLM(
                page,
                roleInfo?.id_comercio,
                5,
                fechaInicial,
                e.target.value,
                true
              );
            }
          }}
        /> */}
        {/* <Input
          id="nroComercio"
          label="ID Comercio"
          type="text"
          value={comercio}
          onInput={(e) => {
            if (e.target.value !== NaN) {
              setComercio(e.target.value);
            }
          }}
          onLazyInput={{
            callback: (e) => {
              const num = !isNaN(e.target.value) ? e.target.value : "";
              setPage(1);

              if (num!=''){
              reversosFDLM(
                page,
                num,
                5,
                fecha_ini,
                fecha_fin,
                true
              );}
              else{
                setTrxs([]) 
              }
            },
            timeOut: 500,
          }}
        /> */}
      </Form>
      <PaginationAuth
        filters={{
          emailSearch: { label: "Email" },
          unameSearch: { label: "Nombre" },
        }}
        maxPage={maxPageUsers}
        onChange={onChange}
      />
      {Array.isArray(usuariosDB) &&
      usuariosDB.length > 0 &&
      comercio === null ? (
        <Table
          headers={["Id", "Nombre completo", "E-mail"]}
          data={usuariosDB.map(({ uuid, uname, email }) => {
            return { uuid, uname, email };
          })}
          onSelectRow={(e, i) => {
            ConsultaComercio(usuariosDB[i].email);
          }}
        />
      ) : (
        ""
      )}

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
                  value={selected?.id_transaccion}
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
                  onInput={(e, valor) => {
                    const num = valor || "";
                    setValue(num);
                  }}
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
                  <Button type="submit">Aceptar</Button>
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

          <div className="flex flex-row justify-evenly w-full my-4">
            <h1>Pagina: {page}</h1>
            <h1>Ultima pagina: {maxPages}</h1>
          </div>
          <ButtonBar className="col-span-1 md:col-span-2">
            <Button
              type="button"
              disabled={page < 2}
              onClick={() => {
                setPage(page - 1);
                reversosFDLM(
                  page - 1,
                  comercio,
                  5,
                  fechaInicial,
                  fechaFinal,
                  true
                );
              }}
            >
              Anterior
            </Button>
            <Button
              type="button"
              disabled={page >= maxPages}
              onClick={() => {
                setPage(page + 1);
                reversosFDLM(
                  page + 1,
                  comercio,
                  5,
                  fechaInicial,
                  fechaFinal,
                  true
                );
              }}
            >
              Siguiente
            </Button>
          </ButtonBar>
          <Table
            headers={["ID transacción", "Fecha", "Operación", "Monto"]}
            data={trxs.map(
              ({ id_transaccion, Created_at, Tipo_operacion, Monto }) => {
                const tempDate = new Date(Created_at);
                tempDate.setHours(tempDate.getHours() + 5);
                Created_at = Intl.DateTimeFormat("es-CO", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }).format(tempDate);
                Monto = formatMoney.format(Monto);
                return {
                  id_transaccion,
                  Created_at,
                  Tipo_operacion,
                  Monto,
                };
              }
            )}
            onSelectRow={(_e, index) => {
              setSelected(trxs[index]);
              setShowModal(true);
              setValue(trxs[index]?.Monto);
            }}
          />
        </>
      ) : (
        ""
      )}
    </>
  );
};
export default Reversos;
