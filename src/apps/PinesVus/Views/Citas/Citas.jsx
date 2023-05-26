import { useCallback, useState, useEffect } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import Select from "../../../../components/Base/Select/Select";
import { usePinesVus } from "../../utils/pinesVusHooks";
import { toast } from "react-toastify";
import { notify, notifyError } from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useNavigate, useSubmit } from "react-router-dom";
import TableEnterprise from "../../../../components/Base/TableEnterprise/TableEnterprise";
import SimpleLoading from "../../../../components/Base/SimpleLoading/SimpleLoading";
import fetchData from "../../../../utils/fetchData";

const dateFormatter = Intl.DateTimeFormat("fr-ca", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const ConsultaCitas = () => {
  const UrlConsultaCitas = `${process.env.REACT_APP_URL_PinesVus}/consulta_citas`
  const navigate = useNavigate();
  const { consultaCupoQX, modificarCupoQX } =
    usePinesVus();

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  
  const { roleInfo, userPermissions } = useAuth();  
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [fecha, setFecha] = useState(dateFormatter.format(new Date()))
  const [tableCitas, setTableCitas] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [tipoDocumento, setTipoDocumento] = useState("")
  const [identificacion, setIdentificacion] = useState("")
  const [disabledBtnsContinuar, setDisabledBtnsContinuar] = useState(false)
  const [showCita, setShowCita] = useState(false)
  const [dataCita, setDataCita] = useState("")
  const [horaCita, setHoraCita] = useState("")
  const [diaCita, setDiaCita] = useState("")
  const [id_comercio, setId_comercio] = useState("")

  //////////////////////

  const consultarCitas = useCallback(
    (comercio,fecha) => {
      if (fecha !== '' && (comercio !== undefined && comercio !== "")){
        setIsLoading(true)
        let fields ={
          fecha : fecha,
          id_comercio : comercio}
        // const params = new URLSearchParams();
        // Object.entries(fields).forEach(([key, value]) => {
        // params.append(key, value);
        // });
        // const queries = params.toString();
        fetchData(
          UrlConsultaCitas,
          "GET",
          fields
          )
        .then((resp) => {
        setIsLoading(false)
        if (!resp?.status){
            notifyError(resp?.msg)
            // setDisabledBtnsContinuar(false)
        }else{
        // setShowFormulario(true)    
        if (resp?.obj?.citas?.length > 0) {
            setTableCitas(
                resp?.obj?.citas?.map((row) => {
                    let Hora = new Date(row?.hora_inicio)
                    Hora.setHours(Hora.getHours() + 5);
                    Hora = Intl.DateTimeFormat('es-US', {
                        hour: "2-digit",
                        minute: "2-digit"
                    }).format(Hora)
                    return {
                      Hora : Hora,
                      Nombres : row?.nombre_cliente,
                      Aprellidos : row?.apellido_cliente || "Libre",
                      Documento : row?.documento_cliente
                    };
                })
            );
            // setMaxPages(resp?.obj?.max_pages);
            console.log(resp?.obj?.citas)
        }
        else{
            setTableCitas([])
            // setMaxPages(1);
            console.log("SIN DATAAAA")
        }}
        }).catch(() => {
            setIsLoading(false)
            notifyError("Error intente nuevamente")
        }
        );
        }else{
          setTableCitas([])
        }
    })
  
  useEffect(() => {
    const comercio = userPermissions
    .map(({ id_permission }) => id_permission)
    .includes(63) ? id_comercio : roleInfo.id_comercio
    consultarCitas(comercio,fecha)
    
  }, [roleInfo, fecha,pageData, UrlConsultaCitas])

  const onSubmitCitas = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setShowCita(false)
    const fieldsCitas ={
      documento : `${identificacion}`
    }
    
    // const paramsCitas = new URLSearchParams();
    // Object.entries(fieldsCitas).forEach(([key, value]) => {
    // paramsCitas.append(key, value);
    // });
    // const queriesCitas = paramsCitas.toString();
    fetchData(UrlConsultaCitas,
        "GET",
        fieldsCitas)
        .then((resp) => {
        setIsLoading(false)
        if (!resp?.status){
          notifyError(resp?.msg)
        }else{
          if (resp?.obj?.citas?.length === 0){
            notifyError("No hay citas asignadas a este documento")
          }else{
          setShowCita(true)
          setDataCita(resp?.obj?.citas?.[0])

          let Dia = new Date(resp?.obj?.citas?.[0]?.hora_inicio)
          Dia.setHours(Dia.getHours() + 5);

          setHoraCita(Intl.DateTimeFormat('en-US', {
            hour: "2-digit",
            minute: "2-digit",
          }).format(Dia))

          
          Dia = Intl.DateTimeFormat('es-ES', {
              weekday: "long",
              day: "2-digit",
              month: "long"
          }).format(Dia)
          setDiaCita(Dia[0].toUpperCase() + Dia.substring(1))
        }
      }
    }).catch(() => {
      notifyError("Error intente nuevamente")
      setIsLoading(false)
    }
    );

  }

  
  return (
    <>
      <SimpleLoading show={isLoading} />
      <>
      <h1 className="text-3xl mt-6 mx-auto">Citas</h1>
      <br></br>
      <Button
        type="submit"
        onClick={() =>{
          setShowModal(true)
        }}
      >
        Consulta por documento
      </Button>
      <TableEnterprise
        title = "Citas"
        // maxPage={maxPages}
        headers={["Hora","Nombre", "Apellidos", "Documento"]}
        data={tableCitas}
        onSelectRow={(e, i) => {
            // setOficina(tableCitas[i]);
        }}
        // onSetPageData={setPageData}
      >
        {/* <Input
        id="nomComercio"
        label="Nombre"
        type="text"
        value={nombreOficina}
        onInput={(e) => {
            const text = e.target.value.toUpperCase()
            setNombreOficina(text)
        }}
        // onLazyInput={{
        //     callback: buscarOficina,
        //     timeOut: 500,
        // }}
        /> */}
        <Input
          id="dateInit"
          // min= {limiteInferior}
          // max= {limiteSuperior}
          label="Fecha"
          type="date"
          required
          value={fecha}
          onInput={(e) => setFecha(e.target.value)}
        />
        {userPermissions
          .map(({ id_permission }) => id_permission)
          .includes(63) && (          
          <Input
            id="id_comercio"
            name="id_comercio"
            label="Id comercio"
            type="tel"
            value={id_comercio}
            onInput={(e) => {
              const num = parseInt(e.target.value) || "";
              setId_comercio(num)
            }}
            onLazyInput={{
              callback: (e) => consultarCitas(e.target.value, fecha),
              timeOut: 500,
            }
            }
          />
        )} 
      </TableEnterprise>
      <Modal show={showModal}>
        
        { showCita ?         
        <Form>
          <div className="border border-current grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          <h1 className="text-xl font-semibold">{dataCita.nombre_cliente + " " +dataCita.apellido_cliente}</h1>
          <div className="bg-orange-300">
          <h1 className="text-xl font-semibold">{diaCita}</h1>
          <ul className="grid grid-flow-row gap-2 justify-center align-middle">
          <li key={"Hora"}>
              <h1 className="grid grid-flow-col auto-cols-fr gap-6">
                  <strong className="justify-self-end">{horaCita}</strong>
              </h1>
              </li>
          </ul>
          </div>
          <div className="bg-slate-200">
          <ul className="grid grid-flow-row gap-2 justify-center align-middle">
          <li key={"Oficina"}>
              <h1 className="grid grid-flow-col auto-cols-fr gap-6">
                  <strong className="justify-self-end">{dataCita.nombre_oficina}</strong>
                </h1>
              </li>
          </ul>
          <ul className="grid grid-flow-row gap-2 justify-center align-middle">
          <li key={"Dirección"}>
              <h1 className="grid grid-flow-col auto-cols-fr gap-6">
                  <p className="justify-self-start whitespace-pre-wrap text-black">{dataCita.direccion_oficina}</p>
                </h1>
              </li>
          </ul>
          </div>
          </div>
          <ButtonBar>
          <Button 
            type="button"
            onClick={() => {
            setShowCita(false)
            setDataCita("")
            setHoraCita("")
            setDiaCita("")
            setIdentificacion("")
          }
          }
          >
              Volver
          </Button>
          <Button 
            type="submit"
            onClick={() =>{
              setShowModal(false)
              setShowCita(false)
              setDataCita("")
              setHoraCita("")
              setDiaCita("")
              setIdentificacion("")
            }
            }
          >
              cerrar
          </Button>     
          </ButtonBar>
        </Form>
        :
        <Form onSubmit={onSubmitCitas}>
        <h1 className="text-3xl mt-3 mx-auto"> Consultar cita</h1>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
          
          <Input
            type="tel"
            autoComplete="off"
            name="N° Identificación"
            label="Número de documento"
            minLength={"5"}
            maxLength={"10"}
            value={identificacion}
            onInput={(e) => {
              const num = parseInt(e.target.value) || "";
              setIdentificacion(num);
              setDisabledBtnsContinuar(false)
              setShowCita(false)
            }}
            required
          />
          <ButtonBar className="lg:col-span-2">
          <Button
            type = "button"
            onClick = {() => {
              setShowModal(false)
              setIdentificacion("")
              setTipoDocumento("")
            }}
          >
            Volver
          </Button>
          <Button type="submit">
            Consultar
          </Button>
          </ButtonBar>
        </div>
        </Form>
        }        
      </Modal>      
      </>
      
    </>
  );
};
export default ConsultaCitas;
