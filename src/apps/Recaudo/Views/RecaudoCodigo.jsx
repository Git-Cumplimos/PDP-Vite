import { Fragment, useCallback, useMemo, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import TextArea from "../../../components/Base/TextArea/TextArea";
import useQuery from "../../../hooks/useQuery";
import fetchData from "../../../utils/fetchData";
import { notifyError } from "../../../utils/notify";
import FlujoRecaudo from "../components/FlujoRecaudo/FlujoRecaudo";

const urlBarcode = process.env.REACT_APP_URL_REVAL_RECAUDO_CODIGO;
const urlConvenios = process.env.REACT_APP_URL_REVAL_CONVENIOS;

const fetchRefBarcode = async (barcode) => {
  try {
    const resBarcode = await fetchData(
      `${urlBarcode}/codigo`,
      "POST",
      {},
      { ean13: barcode }
    );
    if (resBarcode?.status) {
      const monto = resBarcode?.obj?.monto;
      const refsValues = resBarcode?.obj?.referencias;
      const newBarcode = resBarcode?.obj?.barcode;
      const ean13 = newBarcode.substring(3, 16);
      const convData = await fetchData(
        `${urlConvenios}/convenio_unique`,
        "GET",
        {
          ean13,
        }
      );
      if (convData?.status) {
        const foundConv = convData?.obj?.results?.[0];
        foundConv.referencias = foundConv?.referencias?.map((ref, ind) => ({
          ...ref,
          defVal: refsValues[ind],
        }));
        return { foundConv, monto, barcode: newBarcode };
      } else {
        notifyError(convData?.msg);
        return { foundConv: null, monto: "", barcode: newBarcode };
      }
    } else {
      notifyError(resBarcode?.msg);
      return { foundConv: null, monto: "", barcode: "" };
    }
  } catch (err) {
    throw err;
  }
};

const RecaudoCodigo = () => {
  const [{ barcode }, setQuery] = useQuery();

  const [dataConvenio, setDataConvenio] = useState(null);
  const [monto, setMonto] = useState("");

  const foundRefs = useMemo(() => {
    if (!dataConvenio?.referencias) {
      return [];
    }
    return [
      ...dataConvenio?.referencias?.map(
        ({ nombre_referencia, min, max, defVal }) => {
          return {
            nombre_referencia,
            name: "referencias",
            minLength: min,
            maxLength: max,
            defaultValue: defVal,
            readOnly: true,
          };
        }
      ),
      {
        nombre_referencia: "Valor",
        name: "valor",
        minLength: 4,
        maxLength: 8,
        defaultValue: monto,
        readOnly: true
      },
    ];
  }, [dataConvenio, monto]);

  const onSubmitBarcode = useCallback(
    (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      fetchRefBarcode(formData.get("barcode") || barcode)
        .then(({ foundConv, monto, barcode }) => {
          console.log("works");
          setDataConvenio(foundConv);
          setMonto(monto);
          setQuery(
            { barcode, id_convenio: foundConv?.id_convenio },
            { replace: true }
          );
        })
        .catch((err) => console.error(err));

      // setQuery({ barcode: formData.get("barcode") }, { replace: true });
    },
    [setQuery, barcode]
  );

  return (
    <Fragment>
      <Form onSubmit={onSubmitBarcode} grid>
        <TextArea
          id={"barcode"}
          name={"barcode"}
          label={"Codigo de barras"}
          type={"search"}
          autoComplete="off"
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Buscar</Button>
        </ButtonBar>
      </Form>
      <FlujoRecaudo foundRefs={foundRefs} />
    </Fragment>
  );
};

export default RecaudoCodigo;
