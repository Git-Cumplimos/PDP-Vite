import { useCallback, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Modal from "../../../components/Base/Modal/Modal";
import Table from "../../../components/Base/Table/Table";
import fetchData from "../../../utils/fetchData";
import PaginationAuth from "../../../components/Compound/PaginationAuth/PaginationAuth";
import { useAuth } from "../../../hooks/AuthHooks";

const url = process.env.REACT_APP_URL_IAM_PDP;

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const RecargarColCard = () => {
  const { quotaInfo } = useAuth();
  const [usuariosDB, setUsuariosDB] = useState([]);
  const [maxPage, setMaxPage] = useState(1);
  const [formData, setFormData] = useState(new FormData());
  const [showModal, setShowModal] = useState(false);

  const onChange = useCallback((_formData) => {
    setFormData(_formData);
    //   searchUsers(
    //     _formData?.get("numeroTarjeta"),
    //     _formData?.get("valorRecarga"),
    //     _formData?.get("page")
    //   );
    // },
    // [searchUsers]
  }, []);

  return (
    <>
      <h1 className="text-3xl">Recargar tarjeta</h1>
      <h2 className="text-2xl">
        Cupo disponible:{formatMoney.format(quotaInfo?.quota ?? 0)}
      </h2>

      <PaginationAuth
        filters={{
          numeroTarjeta: { label: "Número de la tarjeta", type: "number" },
          valorRecarga: { label: "Valor de la recarga", type: "number" },
        }}
        maxPage={maxPage}
        onChange={onChange}
      />
      <ButtonBar>
        <Button type={"button"} onClick={() => setShowModal(!showModal)}>
          Realizar recarga
        </Button>
      </ButtonBar>

      <Modal show={showModal} handleClose={() => {}}>
        {/* {paymentStatus ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={goToRecaudo}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : ( */}
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          <h1 className="text-2xl font-semibold">
            ¿Esta seguro de realizar la recarga?
          </h1>
          <h2 className="text-base">
            Se realizara una recarga de
            {formatMoney.format(formData?.get("valorRecarga"))} COP
          </h2>
          <h2 className="text-base">
            En la tarjeta {formData?.get("numeroTarjeta")}
          </h2>
          {/* <h1 className="text-2xl font-semibold">Resumen de pago</h1> */}
          {/* <ul className="grid grid-flow-row auto-rows-fr gap-2 place-items-stretch">
              {summaryTrx.map(([key, val]) => {
                return (
                  <li key={key}>
                    <h1 className="grid grid-flow-col auto-cols-fr gap-6 place-items-center">
                      <strong className="justify-self-end">{key}:</strong>
                      <p>{val}</p>
                    </h1>
                  </li>
                );
              })}
            </ul> */}
          <ButtonBar>
            <Button type="submit">Aceptar</Button>
            <Button onClick={() => setShowModal(false)}>Cancelar</Button>
          </ButtonBar>
        </div>
        {/* )} */}
      </Modal>
    </>
  );
};

export default RecargarColCard;
