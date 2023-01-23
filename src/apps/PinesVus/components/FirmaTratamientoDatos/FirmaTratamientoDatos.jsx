// import SignaturePad from 'react-signature-canvas';
import "./FirmaTratamientoDatos.css";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import { useRef } from "react";
import Form from "../../../../components/Base/Form";
import { useState } from "react";
import { notifyError } from "../../../../utils/notify";

const FirmaTratamientoDatos = ({ closeModal, setFirma, firma }) => {
  const ref = useRef(null);

  const firmaCanvas = useRef({});
  // const [firma, setFirma] = useState("")
  const documento = (
    <div>
      <p1>
        De conformidad con lo dispuesto en las normas vigentes sobre protección
        de datos personales, en especial la Ley 1581 de 2012 y el Decreto 1074
        de 2015, autorizo libre, expresa e inequívocamente a Punto de Pago, para
        que realice la recolección y tratamiento de mis datos personales que
        suministro de manera veraz y completa, los cuales serán utilizados para
        los diferentes aspectos relacionados con la gestión del talento humano
        de la entidad.
      </p1>
      <br></br>
      <br></br>
      <p1>
        Así mismo, declaro que conozco que la recolección y tratamiento de mis
        datos se realizará de conformidad con la Política de Tratamiento de
        Datos Personales publicada en PDP, manifestando que he sido informado(a)
        de forma clara y suficiente de los fines de su tratamiento y la
        posibilidad que tenía de no efectuar la autorización en aquella
        información considerada sensible.
      </p1>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <h1 className="text-1xl font-bold">Firma:</h1>
    </div>
  );

  var imgWidth;
  var imgHeight;

  const StartSign = (e) => {
    var message = {
      firstName: "",
      lastName: "",
      eMail: "",
      location: "",
      imageFormat: 2,
      imageX: imgWidth,
      imageY: imgHeight,
      imageTransparency: false,
      imageScaling: false,
      maxUpScalePercent: 0.0,
      rawDataFormat: "ENC",
      minSigPoints: 25,
      penThickness: 3,
      penColor: "#000000",
    };
    document.addEventListener(
      "SigCaptureWeb_SignResponse",
      SignResponse,
      false
    );
    var messageData = JSON.stringify(message);
    var element = document.createElement("SigCaptureWeb_ExtnDataElem");
    element.setAttribute("SigCaptureWeb_MsgAttribute", messageData);
    document.documentElement.appendChild(element);
    var evt = document.createEvent("Events");
    evt.initEvent("SigCaptureWeb_SignStartEvent", true, false);
    element.dispatchEvent(evt);
  };

  const SignResponse = (event) => {
    // e.preventDefault();
    var str = event.target.getAttribute("SigCaptureWeb_msgAttri");
    var obj = JSON.parse(str);
    console.log(obj);
    if (obj?.errorMsg === null) {
      setFirma(`data:image/png;base64,${obj?.imageData}`);
    } else {
      setFirma("");
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (firma !== "") {
      closeModal();
    } else {
      notifyError("Aún no ha agregado una firma");
    }
  };
  console.log(firma);

  return (
    <>
      <div id="documentoFirmado">
        {documento}
        {firma !== "" ? (
          <img
            src={firma}
            alt="firma"
            style={{
              display: "block",
              margin: "0 auto",
              borger: "1px slid black",
              width: "150px",
            }}></img>
        ) : (
          ""
        )}
        {/* <SignaturePad
    ref={firmaCanvas}
    canvasProps={{
      className: "signatureCanvas"  
    }}
    ></SignaturePad> */}
      </div>
      <Form onSubmit={onSubmit} grid>
        <ButtonBar>
          <Button type="submit">Guardar Firma</Button>
          <Button
            type="button"
            onClick={() => {
              StartSign();
            }}>
            Firmar
          </Button>
          <Button
            type="button"
            onClick={() => {
              setFirma("");
              closeModal();
              // setrespPago();
              // getQuota();
            }}>
            Cerrar
          </Button>
        </ButtonBar>
      </Form>
    </>
  );
};

export default FirmaTratamientoDatos;
