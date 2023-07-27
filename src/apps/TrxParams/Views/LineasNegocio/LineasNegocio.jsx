/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unreachable */
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { notify, notifyError } from "../../../../utils/notify";

import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Error404 from "../../../../pages/Error404";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "./components/LineaNegocio.table";

import { getAuthorizers, getBusinessLines, getTransactionTypes } from "./utils/LineasNegocio.fetch";

import "./utils/LineasNegocio.style.css";
import * as LineasNegocioCons from "./utils/LineasNegocio.cons";


const LineasNegocio = () => {
  try {
    const [authorizerList, setAuthorizerList] = useState([]);
    const [businessLinesList, setBusinessLinesList] = useState([]);
    const [businessLinesFilterList, setBusinessLinesFilterList] = useState([]);
    const [detailedLine, setDetailedLine] = useState("");
    const [detailedLineList, setDetailedLineList] = useState([]);
    const [loadScreen, setLoadScreen] = useState(false);
    const [maxPages, setMaxPages] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [{ page, limit }, setPageData] = useState({
      page: 1,
      limit: 10,
    });
    const [selectedBusinessLine, setSelectedBusinessLine] = useState({
      idLineaDetalle: 0,
      idTipoTransaccion: 0,
      lineaNegocio: "",
      lineaDetalle: "",
      autorizador: 0,
      tipoTransaccion: 0
    });
    const [transactionTypeList, setTransactionTypeList] = useState([]);
    
    useEffect(() => {
      getBusinessLineData();
    }, []);
    
    const getBusinessLineData = async () => {
      setLoadScreen(true);
      try {
        const businessLineData = await getBusinessLines();
        console.log("1. ", businessLineData)
        if (businessLineData.code === LineasNegocioCons.RESPONSE_CODE_SUCCESS && businessLineData.object.length > 0) {
          setBusinessLinesList(businessLineData.object);
          setBusinessLinesFilterList(businessLineData.object);
          // console.log("1.1. ", businessLineData.object.length);
          setMaxPages(getMaxPageValue(businessLineData.object.length/10));
          // console.log("1.2. ", businessLineData.object.map(businessLineRow => businessLineRow.lineaDetalle));
          setDetailedLineList(businessLineData.object.map(businessLineRow => businessLineRow.lineaDetalle));
          const authorizerData = await getAuthorizers();
          // console.log("2. ", authorizerData)
          if (authorizerData.code === LineasNegocioCons.RESPONSE_CODE_SUCCESS && authorizerData.object.length > 0) {
            setAuthorizerList(authorizerData.object)
          } else if (authorizerData.code === LineasNegocioCons.RESPONSE_CODE_FAILURE) {
            notify(LineasNegocioCons.MESSAGE_AUTHORIZER_EMPTY);
          }
          const transactionTypeData = await getTransactionTypes();
          // console.log("3. ", transactionTypeData)
          if (transactionTypeData.code === LineasNegocioCons.RESPONSE_CODE_SUCCESS && transactionTypeData.object.length > 0) {
            setTransactionTypeList(transactionTypeData.object)
          } else if (transactionTypeData.code === LineasNegocioCons.RESPONSE_CODE_FAILURE) {
            notify(LineasNegocioCons.MESSAGE_TRANSACTION_TYPES_EMPTY);
          }
        } else if (businessLineData.code === LineasNegocioCons.RESPONSE_CODE_FAILURE) {
          notify(LineasNegocioCons.MESSAGE_BUSINESS_LINES_EMPTY);
        } else {
          notifyError(LineasNegocioCons.MESSAGE_ERROR);
        }
      } catch (error) {
        notifyError(LineasNegocioCons.MESSAGE_ERROR);
      }
      setLoadScreen(false);
    }

    const getMaxPageValue = (maxPageValue) => {
      if (maxPageValue > 0 && maxPageValue < 1) return 1;
      else if (maxPageValue <= 0) return 0;
      else if (maxPageValue.toString().includes(".")) return Number(maxPageValue.toString().split(".")[0])+1;
      else return maxPageValue;
    }

    const tableParameters = useMemo(() => {
      return [
        ...businessLinesFilterList.map(
          ({
            idLineaDetalle,
            idTipoTransaccion,
            lineaNegocio,
            lineaDetalle,
            autorizador,
            tipoTransaccion,
          }) => {
            return {
              "idLineaDetalle": idLineaDetalle,
              "idTipoTransaccion": idTipoTransaccion,
              "lineaNegocio": lineaNegocio,
              "lineaDetalle": lineaDetalle,
              "autorizador": autorizador,
              "tipoTransaccion": tipoTransaccion,
            };
          }
        ),
      ];
    }, [businessLinesFilterList]);

    const onChangeFilter = useCallback(
      (ev) => {
        const formData = new FormData(ev.target.form);
        const detailedLineValue = formData.get(LineasNegocioCons.TAG_DETAILED_LINE);
        setDetailedLine({ lineaDetalle: detailedLineValue }, { replace: true });
        if (detailedLineValue !== "") {
          setBusinessLinesFilterList(businessLinesList.filter(
            businessLinesValue => 
              (
                businessLinesValue.lineaDetalle.toLowerCase().includes(detailedLineValue.toLowerCase())) || businessLinesValue.lineaDetalle.toLowerCase() === detailedLineValue.toLowerCase()
          ));
          setMaxPages(getMaxPageValue(businessLinesList.filter(
            businessLinesValue => 
              (
                businessLinesValue.lineaDetalle.toLowerCase().includes(detailedLineValue.toLowerCase())) || businessLinesValue.lineaDetalle.toLowerCase() === detailedLineValue.toLowerCase()
          ).length/10));
        } else {
          setBusinessLinesFilterList(businessLinesList);
          setMaxPages(businessLinesList.length/10);
        }
      },
      [setDetailedLine]
    );

    const editBusinessLineData = useCallback(
      (e, i) => {
        // console.log("EDIT", i, tableParameters[i]);
        setOpenModal(true);
        setSelectedBusinessLine({
          idLineaDetalle: tableParameters[i]?.[LineasNegocioCons.TAG_DETAILED_LINE_ID],
          idTipoTransaccion: tableParameters[i]?.[LineasNegocioCons.TAG_TRANSACTION_TYPE_ID],
          lineaNegocio: tableParameters[i]?.[LineasNegocioCons.TAG_BUSINESS_LINE],
          lineaDetalle: tableParameters[i]?.[LineasNegocioCons.TAG_DETAILED_LINE],
          autorizador:tableParameters[i]?.[LineasNegocioCons.TAG_AUTHORIZER],
          tipoTransaccion:tableParameters[i]?.[LineasNegocioCons.TAG_TRANSACTION_TYPE],
        });
      },
      [tableParameters]
    );

    return (
      <Fragment>
        { loadScreen &&
          <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4" />
            <h2 className="text-center text-white text-xl font-semibold">{LineasNegocioCons.LABEL_LOADING}</h2>
          </div>
        }
        <ButtonBar>
          <Button
            onClick={() => {console.log("Create")}}
            type="submit"
          >
            {LineasNegocioCons.LABEL_CREATE_BUSINESS_LINE}
          </Button>
        </ButtonBar>
        <TableEnterprise
          title={LineasNegocioCons.TITLE_BUSINESS_LINES}
          maxPage={maxPages}
          headers={[
            LineasNegocioCons.LABEL_BUSINESS_LINE,
            LineasNegocioCons.LABEL_DETAILED_LINE,
            LineasNegocioCons.LABEL_AUTHORIZER,
            LineasNegocioCons.LABEL_TRANSACTION_TYPE,
          ]}
          data={tableParameters}
          onSelectRow={editBusinessLineData}
          onSetPageData={setPageData}
          onChange={onChangeFilter}
        >
          <Input
            autoComplete="on"
            defaultValue={detailedLine}
            id={LineasNegocioCons.TAG_DETAILED_LINE}
            label={LineasNegocioCons.LABEL_DETAILED_LINE}
            maxLength="50"
            minLength="1"
            name={LineasNegocioCons.TAG_DETAILED_LINE}
            // onChange={(e)=>{setDetailedLine(e.target.value)}}
            type="autocomplete"
          />
        </TableEnterprise>
      </Fragment>
    );
  } catch (error) {
    return(<Error404/>)
  }
}

export default LineasNegocio;