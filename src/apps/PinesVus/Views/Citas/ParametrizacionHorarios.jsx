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

import TableEnterprise from "../../../../components/Base/TableEnterprise/TableEnterprise";

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const ConsultaCitas = () => {
  const UrlConsultaOficinas = `http://127.0.0.1:5000/consulta_oficinas`
  const UrlParametrizacion = `http://127.0.0.1:5000/parametrizar_horarios`

  const navigate = useNavigate();
  const { consultaCupoQX, modificarCupoQX } =
    usePinesVus();

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const [pageData, setPageData] = useState({ page: 1, limit: 10 });  
  const [tableOficinas, setTableOficinas] = useState([])
  const [maxPages, setMaxPages] = useState(1);
  const [oficina, setOficina] = useState({"Id": "", "Nombre": "", "Dirección": ""})
  const [nombreOficina, setNombreOficina] = useState("");
  const [fechaVigencia, setFechaVigencia] = useState("")
  const [tiempoDuracion, setTiempoDuracion] = useState("")
  const [horarios, setHorarios] = useState({
    lunes:{Apertura:"", Cierre:""},
    martes:{Apertura:"", Cierre:""},
    miercoles:{Apertura:"", Cierre:""},
	  jueves:{Apertura:"", Cierre:""},
    viernes:{Apertura:"", Cierre:""},
    sabado:{Apertura:"", Cierre:""},
    domingo:{Apertura:"", Cierre:""}
  })
  const [isLoading, setIsLoading] = useState(false)


  const closeModal = useCallback(async () => {
    // setShowModal(false);
    // setDisabledBtn(false);
    // setFormatMon("");
  }, []);

  //////////////////////
  
  useEffect(() => {
    // setIsLoading(true)
    setIsLoading(true)
    const fields ={...pageData}
    fields.nombre = `${nombreOficina}`
    const params = new URLSearchParams();
    Object.entries(fields).forEach(([key, value]) => {
    params.append(key, value);
    });
    const queries = params.toString();
    fetch(UrlConsultaOficinas + `?${queries}`)
    .then(response => response.json())
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

  }, [nombreOficina, pageData, UrlConsultaOficinas])

 

  const onSubmitParametrizacion = (e) => {
    e.preventDefault();
    const body = {
      fecha_vigencia : fechaVigencia,
      duracion_tiempo_cita : tiempoDuracion,
      fecha_inoperancia : [],
      horario_atencion : horarios,
      id_comercio : oficina?.Id,
      nombre_comercio : oficina?.Nombre,
      direccion : oficina?.Dirección,
    }
    fetch(UrlParametrizacion,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

      },
      body: JSON.stringify(body)}
    )
    .then(response => response.json())
    .then((resp) => {
        setIsLoading(false)
        if (!resp?.status){
            notifyError(resp?.msg)
        }else{
            // setAgendamientoTrue(true)
            console.log(resp)
        }
    }).catch( () => {
        setIsLoading(false)
        notifyError("Error intente nuevamente")
    }
    );  
  }

  
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
      onInput={(e) => {
          const text = e.target.value.toUpperCase()
          setNombreOficina(text)
      }}
      // onLazyInput={{
      //     callback: buscarOficina,
      //     timeOut: 500,
      // }}
      />
      </TableEnterprise>
    :
    <Fieldset>
    <Form>
      <Input
        id='idOficina'
        name='idOficina'
        label='Id oficina'
        autoComplete='off'
        type='text'
        minLength={"1"}
        maxLength={"15"}
        // min={limitesMontos?.min}
        // max={limitesMontos?.max}
        value={oficina.Id}
        // onInput={(e) => setTiempoDuracion(e.target.value)}
        required
      />
      <Input
        id='nomOficina'
        name='nomOficina'
        label='Nombre oficina'
        autoComplete='off'
        type='text'
        minLength={"1"}
        maxLength={"15"}
        // min={limitesMontos?.min}
        // max={limitesMontos?.max}
        value={oficina.Nombre}
        // onInput={(e) => setTiempoDuracion(e.target.value)}
        required
      />
      <Input
        id="dateVigencia"
        label="Fecha vigencia"
        type="date"
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
        maxLength={"15"}
        // min={limitesMontos?.min}
        // max={limitesMontos?.max}
        value={tiempoDuracion}
        onInput={(e) => setTiempoDuracion(e.target.value)}
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
        {/* <Fieldset legend="Martes">
          <Input
          id="horaIni"
          label="Hora apertura"
          type="time"
          value={horarios.martes.Apertura}
          onInput={(e) => setHorarios((old) => {
            return{ ...old, martes : {Apertura: e.target.value, Cierre : old.martes.Cierre}}
          })}
          />
          <Input
          id="horaFin"
          label="Hora cierre"
          type="time"
          value={horarios.martes.Cierre}
          onInput={(e) => setHorarios((old) => {
            return{ ...old, martes : {Apertura: old.martes.Apertura, Cierre : e.target.value}}
          })}
          />
        </Fieldset>
        <Fieldset legend="Miercoles">
          <Input
          id="horaIni"
          label="Hora apertura"
          type="time"
          value={horarios.miercoles.Apertura}
          onInput={(e) => setHorarios((old) => {
            return{ ...old, miercoles : {Apertura: e.target.value, Cierre : old.miercoles.Cierre}}
          })}
          />
          <Input
          id="horaFin"
          label="Hora cierre"
          type="time"
          value={horarios.miercoles.Cierre}
          onInput={(e) => setHorarios((old) => {
            return{ ...old, miercoles : {Apertura: old.miercoles.Apertura, Cierre : e.target.value}}
          })}
          />
        </Fieldset>
        <Fieldset legend="Jueves">
          <Input
          id="horaIni"
          label="Hora apertura"
          type="time"
          value={horarios.jueves.Apertura}
          onInput={(e) => setHorarios((old) => {
            return{ ...old, jueves : {Apertura: e.target.value, Cierre : old.jueves.Cierre}}
          })}
          />
          <Input
          id="horaFin"
          label="Hora cierre"
          type="time"
          value={horarios.jueves.Cierre}
          onInput={(e) => setHorarios((old) => {
            return{ ...old, jueves : {Apertura: old.jueves.Apertura, Cierre : e.target.value}}
          })}
          />
        </Fieldset>
        <Fieldset legend="Viernes">
          <Input
          id="horaIni"
          label="Hora apertura"
          type="time"
          value={horarios.viernes.Apertura}
          onInput={(e) => setHorarios((old) => {
            return{ ...old, viernes : {Apertura: e.target.value, Cierre : old.viernes.Cierre}}
          })}
          />
          <Input
          id="horaFin"
          label="Hora cierre"
          type="time"
          value={horarios.viernes.Cierre}
          onInput={(e) => setHorarios((old) => {
            return{ ...old, viernes : {Apertura: old.viernes.Apertura, Cierre : e.target.value}}
          })}
          />
        </Fieldset> */}
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
          }
          }
        >
          Volver
        </Button>
        <Button
          type = 'submit'
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
