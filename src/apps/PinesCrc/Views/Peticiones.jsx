import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Input from "../../../components/Base/Input";
import Select from "../../../components/Base/Select"
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { useAuth } from "../../../hooks/AuthHooks";
import { onChangeNumber } from "../../../utils/functions";
import { notify, notifyError } from "../../../utils/notify";
import { getPinesExamenesFetch, peticionCancelacion } from "../utils/fetchFunctions";
import Modal from "../../../components/Base/Modal/Modal";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Form from "../../../components/Base/Form/Form";
import TextArea from "../../../components/Base/TextArea/TextArea";
import SimpleLoading from "../../../components/Base/SimpleLoading/SimpleLoading";

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});


const Peticiones = () => {

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const navigate = useNavigate();
  const { roleInfo, userPermissions, pdpUser } = useAuth();  

  const [listaConveniosPines, setListaConveniosPines] = useState([]);
  const [maxPages, setMaxPages] = useState(1);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [searchFilters, setSearchFilters] = useState({
    pk_id_trx: "",
    id_comercio: "",
    fecha_ini: "",
    fecha_fin: "",
    estado: ""
  });
  const [table, setTable] = useState([])
  const [showModalPeticion, setShowModalPeticion] = useState(false)
  const [trx, setTrx] = useState("")
  const [motivoPeticion, setMotivoPeticion] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const getPinesExamenes = useCallback(() => {
    let newSearchFilters = { ...searchFilters}
    if(searchFilters.fecha_ini === '' || searchFilters.fecha_fin === ''){
      delete newSearchFilters.fecha_fin
      delete newSearchFilters.fecha_ini
    }
    if(userPermissions
      .map(({ id_permission }) => id_permission)
      .includes(53)){
      newSearchFilters.id_comercio = roleInfo.id_comercio
    }

    const dataConsulta ={
      ...pageData,
      ...Object.fromEntries(
        Object.entries(newSearchFilters).filter(([, val]) => val)
      )
    }
    setTable([])
    setIsLoading(true)
    getPinesExamenesFetch(dataConsulta)
      .then((res) => {
        setIsLoading(false)
        console.log("EXAMENES", res)
        setTable(
          res?.obj?.results?.map((row) => {
            const fecha_pago = new Date(row?.fecha_pago);
            fecha_pago.setHours(fecha_pago.getHours() + 5);
            let fecha_anulacion = ''
            if(row?.fecha_anulacion !== null){
            fecha_anulacion = new Date(row?.fecha_anulacion);
            fecha_anulacion.setHours(fecha_anulacion.getHours() + 5);}
            return {
              "Id trx": row?.pk_id_trx, 
              "Id comercio": row?.id_comercio, 
              "Nombre comercio": row?.nombre_comercio,
              "No. referencia": row?.referencia,
              "No. documento": row?.documento,
              "Valor pin": formatMoney.format(row?.valor_pin),
              "Fecha pago": dateFormatter.format(fecha_pago),
              "Estado": row?.estado,
              "Fecha anulación": fecha_anulacion !== '' ? dateFormatter.format(fecha_anulacion) : ""
            };})
          )
        setMaxPages(res?.obj?.maxPages);
        
      })
      .catch((err) => {
        if (err?.cause === "custom") {
          setIsLoading(false)
          notifyError(err?.message);
          return;
        }
        setIsLoading(false)
        console.error(err?.message);
      });
  }, [pageData, searchFilters, roleInfo, userPermissions]);

  const onSubmitPeticion = (e) =>{
    e.preventDefault();
    const args = {"pk_id_trx" : trx?.["Id trx"]}
    const body = {
      estado: "Peticion",
      motivo_anulacion: motivoPeticion,
      usuario_peticion: pdpUser?.uname ?? "",
    }
    setIsLoading(true)
    peticionCancelacion(args,body)
    .then((res) => {
      setIsLoading(false)
      if(res?.status){
        notify('Petición enviada con éxito ')
        setShowModalPeticion(false)
        setMotivoPeticion("")
        getPinesExamenes();        
      }else{
        notifyError(res?.msg)
      }
    })
    .catch((err) => {
      if (err?.cause === "custom") {
        notifyError(err?.message);
        setIsLoading(false)
        return;
      }
      setIsLoading(false)
      console.error(err?.message);
    });
  }

  useEffect(() => {
    getPinesExamenes();
  }, [getPinesExamenes]);

  /**
   * Check if has commerce data
   */

  return (
    <Fragment>
      <SimpleLoading show={isLoading}/>
      <h1 className="text-3xl mt-6">Pines</h1>
      <TableEnterprise
        title="Pines"
        headers={[
          "Id trx", 
          "Id comercio", 
          "Nombre comercio",
          "No. referencia",
          "No. documento",
          "Valor pin",
          "Fecha pago",
          "Estado",
          "Fecha anulación"]}
        data={table || []}
        maxPage={maxPages}
        onSetPageData={setPageData}
        onSelectRow={(e, i) => {
          console.log(table[i])
          if(table[i].Estado !== "Aprobado"){
            notifyError(`Para hacer la petición el pin debe estar en estado 'Aprobado'`)
          }else{
            setTrx(table[i])
            setShowModalPeticion(true)
          }
        }}
        onChange={(ev) =>
          setSearchFilters((old) => ({
            ...old,
            [ev.target.name]: ev.target.value,
          }))
        }
      >
        <Input
          id={"id_trx"}
          label={"Id trx"}
          name={"pk_id_trx"}
          type="tel"
          autoComplete="off"
          maxLength={"12"}
          onChange={(ev) => {
            ev.target.value = onChangeNumber(ev);
          }}
          required
        />
        {userPermissions
          .map(({ id_permission }) => id_permission)
          .includes(63) && (
        <Input
          id={"id_comercio"}
          label={"Id comercio"}
          name={"id_comercio"}
          type="tel"
          autoComplete="off"
          maxLength={"8"}
          onChange={(ev) => {
            ev.target.value = onChangeNumber(ev);
          }}
          required
        />)}
        <Input
          id="dateInit"
          name="fecha_ini"
          label="Fecha inicial"
          type="date"
          onChange={() => {}}
        />
        <Input
          id="dateEnd"
          name="fecha_fin"
          label="Fecha final"
          type="date"
          onChange={() => {}}
        />
        <Select
          id="estadoPin"
          label="Estado del pin"
          name="estado"
          options={
            [
              { value: "", label: "" },
              { value: "Aprobado", label: "Aprobados" },
              { value: "Declinado", label: "Declinados" },
              { value: "Anulado", label: "Anulados" },
              { value: "Peticion", label: "Peticiones" },
            ]
          }
          // value={estadoPin}
          onChange={() => {}}
        />
      </TableEnterprise>
      <Modal show={showModalPeticion}>
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col w-1/2 mx-auto">
          <h1 className="text-2xl mt-3 mx-auto font-medium">¿Está seguro de realizar la petición de anulación de la transacción?</h1>
          <br></br>
          <>
            <div
              className="flex flex-row justify-between text-lg font-medium"
            >
              <h1>Id Trx</h1>
              <h1>{trx?.["Id trx"]}</h1>
            </div>
            <div
              className="flex flex-row justify-between text-lg font-medium"
            >
              <h1>No. Referencia</h1>
              <h1>{trx?.["No. referencia"]}</h1>
            </div>
            <div
              className="flex flex-row justify-between text-lg font-medium"
            >
              <h1>No. Documento</h1>
              <h1>{trx?.["No. documento"]}</h1>
            </div>
            <div
              className="flex flex-row justify-between text-lg font-medium"
            >
              <h1>Valor PIN</h1>
              <h1>{trx?.["Valor pin"]}</h1>
            </div>
          </>
        </div>

        <Form onSubmit={onSubmitPeticion}>
          <div className="flex flex-col justify-center items-center mx-auto container">
            <TextArea
              id="motivo"
              label="Motivo petición"
              type="input"
              minLength="1"
              maxLength="160"
              autoComplete="off"
              value={motivoPeticion}
              required
              onInput={(e) => {
                setMotivoPeticion(e.target.value);
              }}
            />
            <ButtonBar>
              <Button type="submit">
                Aceptar
              </Button>
              <Button
                onClick={() => {
                  setShowModalPeticion(false)
                  setMotivoPeticion("")
                  notify("Petición cancelada por el usuario")
                }}
              >
                Cancelar
              </Button>
            </ButtonBar>
          </div>
        </Form>
      </div>
      </Modal>
    </Fragment>
  );
};

export default Peticiones;
