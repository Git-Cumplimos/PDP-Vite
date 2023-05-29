import { useCallback, useState, useRef, useMemo, useEffect } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import { usePinesVus } from "../../utils/pinesVusHooks";
import { toast } from "react-toastify";
import { notify, notifyError } from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useNavigate } from "react-router-dom";
import Fieldset from "../../../../components/Base/Fieldset/Fieldset";
import SimpleLoading from "../../../../components/Base/SimpleLoading/SimpleLoading";
import fetchData from "../../../../utils/fetchData";

import TableEnterprise from "../../../../components/Base/TableEnterprise/TableEnterprise";

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const ConsultaCitas = () => {
  const UrlConsultaOficinas = `${process.env.REACT_APP_URL_PinesVus}/consulta_oficinas`
  const UrlParametrizacion = `${process.env.REACT_APP_URL_PinesVus}/parametrizar_horarios`

  const navigate = useNavigate();


  const { pdpUser } = useAuth();  
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });  
  const [tableOficinas, setTableOficinas] = useState([])
  const [maxPages, setMaxPages] = useState(1);
  const [oficina, setOficina] = useState({"Id": "", "Nombre": "", "Dirección": ""})
  const [nombreOficina, setNombreOficina] = useState("");
  const [fechaVigencia, setFechaVigencia] = useState("")
  const [tiempoDuracion, setTiempoDuracion] = useState("")
  const [horarios, setHorarios] = useState({
    lunes:{Apertura:"00:00", Cierre:"00:00"},
    martes:{Apertura:"00:00", Cierre:"00:00"},
    miercoles:{Apertura:"00:00", Cierre:"00:00"},
	  jueves:{Apertura:"00:00", Cierre:"00:00"},
    viernes:{Apertura:"00:00", Cierre:"00:00"},
    sabado:{Apertura:"00:00", Cierre:"00:00"},
    domingo:{Apertura:"00:00", Cierre:"00:00"}
  })
  const [isLoading, setIsLoading] = useState(false)
  const [ventanillas, setVentanillas] = useState("")
  const [disabledBtnSubir, setDisabledBtnSubir] = useState(false)
  const [horariosActual, setHorariosActual] = useState({
    lunes:{Apertura:"00:00", Cierre:"00:00"},
    martes:{Apertura:"00:00", Cierre:"00:00"},
    miercoles:{Apertura:"00:00", Cierre:"00:00"},
	  jueves:{Apertura:"00:00", Cierre:"00:00"},
    viernes:{Apertura:"00:00", Cierre:"00:00"},
    sabado:{Apertura:"00:00", Cierre:"00:00"},
    domingo:{Apertura:"00:00", Cierre:"00:00"}
  })
  const [tiempoDuracionActual, setTiempoDuracionActual] = useState("")
  const [ventanillasActual, setVentanillasActual] = useState("")

  const closeModal = useCallback(async () => {
    // setShowModal(false);
    // setDisabledBtn(false);
    // setFormatMon("");
  }, []);

  const minDuracionCita=5
  const maxDuracionCita=690
  const minVentanillas=1
  const maxVentanillas=10
  
  //////////////////////
  
  useEffect(() => {
    // setIsLoading(true)
    buscarOficina(nombreOficina, pageData,UrlConsultaOficinas)

  }, [pageData, UrlConsultaOficinas])

  const buscarOficina = useCallback ((nombre, pageData, UrlConsultaOficinas) => {
    setIsLoading(true)
    const fields ={...pageData}
    fields.nombre = `${nombre}`
    // const params = new URLSearchParams();
    // Object.entries(fields).forEach(([key, value]) => {
    // params.append(key, value);
    // });
    // const queries = params.toString();
    fetchData(UrlConsultaOficinas,
              "GET",
              fields)
    .then((resp) => {
    setIsLoading(false)
    if (!resp?.status){
        notifyError(resp?.msg)
        // setDisabledBtnsContinuar(false)
    }else{
    // setShowFormulario(true)    
    if (resp?.obj?.oficinas?.length > 0) {
        setTableOficinas(
            resp?.obj?.oficinas?.map((row) => {
                return {
                    "Id" : row?.id_comercio,
                    "Nombre" : row?.nombre_comercio,
                    "Dirección" : row?.direccion
                };
            })
        );
        setMaxPages(resp?.obj?.max_pages);
        console.log(resp?.obj?.oficinas)
    }
    else{
      setTableOficinas([])
      setMaxPages(1);
      console.log("SIN DATAAAA")
    }}
    }).catch(() => {
      setIsLoading(false)
      notifyError("Error intente nuevamente")
    }
    );
  })
  // const onSubmitModal = (e) => {
  //   setShowModal(true)
  // }

  const hoy = new Date()
    const limiteInferior = Intl.DateTimeFormat("fr-ca", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(hoy)

  const onSubmitParametrizacion = (e) => {
    e.preventDefault();
    if (
      (horarios.lunes.Apertura !=='00:00' && horarios.lunes.Apertura >= horarios.lunes.Cierre) ||
      (horarios.sabado.Apertura !=='00:00' && horarios.sabado.Apertura >= horarios.sabado.Cierre) ||
      (horarios.domingo.Apertura !=='00:00' && horarios.domingo.Apertura >= horarios.domingo.Cierre)){
      console.log(horarios)
      notifyError("Verifique que los horarios de cierre sean mayores a los de apertura")     
    } else {
    setIsLoading(true)
    const body = {
      fecha_vigencia : fechaVigencia + " 00:00:00",
      duracion_tiempo_cita : tiempoDuracion,
      fecha_inoperancia : [],
      horario_atencion : horarios,
      id_comercio : oficina?.Id,
      // nombre_oficina : oficina?.Nombre,
      // direccion : oficina?.Dirección,
      numero_ventanillas : ventanillas,
      nombre_de_quien_cargo : pdpUser?.uname
    }
    fetchData(UrlParametrizacion,
      "POST",
      {},
      body
    )
    .then((resp) => {
        setIsLoading(false)
        if (!resp?.status){
            notifyError(resp?.msg)
        }else{
            // setAgendamientoTrue(true)
            let mensaje = ''
            if(resp?.obj?.url_descargaS3 !== ''){
              mensaje = `Se cancelaron citas revise el archivo descargado`
              window.open(resp?.obj?.url_descargaS3, "_blank");
            }else{
              mensaje = 'No hubo cancelación de citas'
            }
            notify(`${resp?.msg}: ${mensaje}`)
            console.log(resp)
            setOficina({"Id": "", "Nombre": "", "Dirección": ""})
            setHorarios({
              lunes:{Apertura:"00:00", Cierre:"00:00"},
              martes:{Apertura:"00:00", Cierre:"00:00"},
              miercoles:{Apertura:"00:00", Cierre:"00:00"},
              jueves:{Apertura:"00:00", Cierre:"00:00"},
              viernes:{Apertura:"00:00", Cierre:"00:00"},
              sabado:{Apertura:"00:00", Cierre:"00:00"},
              domingo:{Apertura:"00:00", Cierre:"00:00"}
            })
            setFechaVigencia("")
            setTiempoDuracion("")
            setVentanillas("")
        }
    }).catch( () => {
        setIsLoading(false)
        notifyError("Error intente nuevamente")
    }
    );
  }
  }

  useEffect(() => {
    setIsLoading(true)
    const fields = { id_comercio: oficina.Id, fecha_consulta: fechaVigencia + " 00:00:00" }
    fetchData(UrlParametrizacion,
              "GET",
              fields)
    .then((resp) => {
    setIsLoading(false)
    if (!resp?.status){
        if (oficina.Id!=""){
        notifyError(resp?.msg)}
         setDisabledBtnSubir(false)
    }else{     
      setHorarios(resp?.obj?.horario_atencion)
      setTiempoDuracion(resp?.obj?.duracion_cita)
      setVentanillas(resp?.obj?.numero_ventanillas)
      setHorariosActual(resp?.obj?.horario_atencion)
      setTiempoDuracionActual(resp?.obj?.duracion_cita)
      setVentanillasActual(resp?.obj?.numero_ventanillas)
      setDisabledBtnSubir(true)
    }
    }).catch(() => {
      setIsLoading(false)
      notifyError("Error intente nuevamente")
    }
    );
  }, [fechaVigencia, pageData, UrlParametrizacion])

  useEffect(() => {
    ((tiempoDuracion === tiempoDuracionActual) && 
    (horarios["lunes"]["Apertura"]===horariosActual["lunes"]["Apertura"]) &&
    (horarios["sabado"]["Apertura"]===horariosActual["sabado"]["Apertura"]) &&
    (horarios["domingo"]["Apertura"]===horariosActual["domingo"]["Apertura"]) &&
    (horarios["lunes"]["Cierre"]===horariosActual["lunes"]["Cierre"]) &&
    (horarios["sabado"]["Cierre"]===horariosActual["sabado"]["Cierre"]) &&
    (horarios["domingo"]["Cierre"]===horariosActual["domingo"]["Cierre"]) &&
    (ventanillas === ventanillasActual)) ? setDisabledBtnSubir(true) : setDisabledBtnSubir(false)
  }, [tiempoDuracion, horarios, ventanillas])
  
  return (
    <>
    <SimpleLoading show={isLoading}></SimpleLoading>
    <h1 className="text-3xl mt-6 mx-auto">Parametrización de horarios</h1>
    <br></br>
    { oficina?.Nombre === '' ?
      <TableEnterprise
      title = "Oficinas"
      maxPage={maxPages}
      headers={["Id","Nombre", "Dirección"]}
      data={tableOficinas}
      onSelectRow={(e, i) => {
          setOficina(tableOficinas[i]);
      }}
      onSetPageData={setPageData}
    >
      <Input
      id="nomComercio"
      label="Nombre"
      type="text"
      value={nombreOficina}
      maxLength={"30"}
      onInput={(e) => {
          const text = e.target.value.toUpperCase()
          setNombreOficina(text)
      }}
      onLazyInput={{
          callback: (e) => buscarOficina(e.target.value.toUpperCase(), pageData, UrlConsultaOficinas),
          timeOut: 500,
      }}
      />
      </TableEnterprise>
    :
    <Fieldset>
    <Form onSubmit={onSubmitParametrizacion}>
      <Input
        id='idOficina'
        name='idOficina'
        label='Id oficina'
        autoComplete='off'
        type='text'
        minLength={"1"}
        maxLength={"15"}
        value={oficina.Id}
        required
      />
      <Input
        id='nomOficina'
        name='nomOficina'
        label='Nombre oficina'
        autoComplete='off'
        type='text'
        minLength={"1"}
        maxLength={"100"}
        value={oficina.Nombre}
        required
      />
      <Input
        id="dateVigencia"
        label="Fecha vigencia"
        type="date"
        min= {limiteInferior}
        required
        value={fechaVigencia}
        onInput={(e) => setFechaVigencia(e.target.value)}
      />
      <Input
        id='tiempoCitas'
        name='tiempoCitas'
        label='Duración citas'
        autoComplete='off'
        type='text'
        minLength={"1"}
        maxLength={"3"}
        min={minDuracionCita}
        max={maxDuracionCita}
        value={tiempoDuracion}
        onInput={(e) => {
          const num = parseInt(e.target.value) || "";
          setTiempoDuracion(num);   
        }
        }
        required
      />
      <Input
        id='#ventanillas'
        name='#ventanillas'
        label='No. Ventanillas'
        autoComplete='off'
        type='text'       
        min={minVentanillas}
        max={maxVentanillas}
        minLength={"1"}
        maxLength={"2"}
        value={ventanillas}
        onInput={(e) => {
          const num = parseInt(e.target.value) || "";
          setVentanillas(num);
        }}
        required
      />
      <Fieldset legend="Horarios">
        <Fieldset legend="Lunes a Viernes">
          <Input
          id="horaIni"
          label="Hora apertura"
          type="time"
          value={horarios.lunes.Apertura}
          onInput={(e) => setHorarios((old) => {
            return{ ...old, lunes : {Apertura: e.target.value, Cierre : old.lunes.Cierre},
                            martes : {Apertura: e.target.value, Cierre : old.martes.Cierre},
                            miercoles : {Apertura: e.target.value, Cierre : old.miercoles.Cierre},
                            jueves : {Apertura: e.target.value, Cierre : old.jueves.Cierre},
                            viernes : {Apertura: e.target.value, Cierre : old.viernes.Cierre}}
          })}
          />
          <Input
          id="horaFin"
          label="Hora cierre"
          type="time"
          value={horarios.lunes.Cierre}
          onInput={(e) => setHorarios((old) => {
            return{ ...old, lunes : {Apertura: old.lunes.Apertura, Cierre : e.target.value},
                            martes : {Apertura: old.martes.Apertura, Cierre : e.target.value},
                            miercoles : {Apertura: old.miercoles.Apertura, Cierre : e.target.value},
                            jueves : {Apertura: old.jueves.Apertura, Cierre : e.target.value},
                            viernes : {Apertura: old.viernes.Apertura, Cierre : e.target.value}}
          })}
          />
        </Fieldset>
        <Fieldset legend="Sábado">
          <Input
          id="horaIni"
          label="Hora apertura"
          type="time"
          value={horarios.sabado.Apertura}
          onInput={(e) => setHorarios((old) => {
            return{ ...old, sabado : {Apertura: e.target.value, Cierre : old.sabado.Cierre}}
          })}
          />
          <Input
          id="horaFin"
          label="Hora cierre"
          type="time"
          value={horarios.sabado.Cierre}
          onInput={(e) => setHorarios((old) => {
            return{ ...old, sabado : {Apertura: old.sabado.Apertura, Cierre : e.target.value}}
          })}
          />
        </Fieldset>
        <Fieldset legend="Domingo">
          <Input
          id="horaIni"
          label="Hora apertura"
          type="time"
          value={horarios.domingo.Apertura}
          onInput={(e) => setHorarios((old) => {
            return{ ...old, domingo : {Apertura: e.target.value, Cierre : old.domingo.Cierre}}
          })}
          />
          <Input
          id="horaFin"
          label="Hora cierre"
          type="time"
          value={horarios.domingo.Cierre}
          onInput={(e) => setHorarios((old) => {
            return{ ...old, domingo : {Apertura: old.domingo.Apertura, Cierre : e.target.value}}
          })}
          />
        </Fieldset>
      </Fieldset>
      <ButtonBar>
        <Button
          type = 'button'
          onClick={ () => {
            setOficina({"Id": "", "Nombre": "", "Dirección": ""})
            setHorarios({
              lunes:{Apertura:"00:00", Cierre:"00:00"},
              martes:{Apertura:"00:00", Cierre:"00:00"},
              miercoles:{Apertura:"00:00", Cierre:"00:00"},
              jueves:{Apertura:"00:00", Cierre:"00:00"},
              viernes:{Apertura:"00:00", Cierre:"00:00"},
              sabado:{Apertura:"00:00", Cierre:"00:00"},
              domingo:{Apertura:"00:00", Cierre:"00:00"}
            })
            setFechaVigencia("")
            setTiempoDuracion("")
            setVentanillas("")
          }
          }
        >
          Volver
        </Button>
        <Button
          type = 'submit'
          disabled={disabledBtnSubir}
        >
          Subir
        </Button>
      </ButtonBar>
    </Form>
    </Fieldset>
    }
    </>
  );
};
export default ConsultaCitas;
