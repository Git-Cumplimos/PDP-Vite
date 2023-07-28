/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unreachable */
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { notify, notifyError } from "../../../../utils/notify";

import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Error404 from "../../../../pages/Error404";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input";
import InputSuggestions from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal/Modal";
import TableEnterprise from "./components/LineaNegocio.table";

import { getAuthorizers, getBusinessLines, getDetailedLines, getTransactionTypes } from "./utils/LineasNegocio.fetch";

import "./utils/LineasNegocio.style.css";
import * as BusinessLineCons from "./utils/LineasNegocio.cons";


const LineasNegocio = () => {
  try {
    const [authorizerList, setAuthorizerList] = useState([]);
    const [businessLinesFilterList, setBusinessLinesFilterList] = useState([]);
    const [businessLinesList, setBusinessLinesList] = useState([]);
    const [detailedLine, setDetailedLine] = useState("");
    const [detailedLineFilterList, setDetailedLineFilterList] = useState([]);
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
      autorizador: "",
      tipoTransaccion: ""
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
        if (businessLineData.code === BusinessLineCons.RESPONSE_CODE_SUCCESS && businessLineData.object.length > 0) {
          setBusinessLinesList(businessLineData.object);
          setBusinessLinesFilterList(businessLineData.object);
          // console.log("1.1. ", businessLineData.object.length);
          setMaxPages(getMaxPageValue(businessLineData.object.length/10));
          const authorizerData = await getAuthorizers();
          // console.log("2. ", authorizerData)
          if (authorizerData.code === BusinessLineCons.RESPONSE_CODE_SUCCESS && authorizerData.object.length > 0) {
            setAuthorizerList(authorizerData.object);
          } else if (authorizerData.code === BusinessLineCons.RESPONSE_CODE_FAILURE) {
            setAuthorizerList([]);
            notify(BusinessLineCons.MESSAGE_AUTHORIZER_EMPTY);
          }
          const transactionTypeData = await getTransactionTypes();
          // console.log("3. ", transactionTypeData)
          if (transactionTypeData.code === BusinessLineCons.RESPONSE_CODE_SUCCESS && transactionTypeData.object.length > 0) {
            setTransactionTypeList(transactionTypeData.object);
          } else if (transactionTypeData.code === BusinessLineCons.RESPONSE_CODE_FAILURE) {
            setTransactionTypeList([]);
            notify(BusinessLineCons.MESSAGE_TRANSACTION_TYPES_EMPTY);
          }
          const detailedLinesData = await getDetailedLines();
          console.log("4. ", detailedLinesData)
          if (detailedLinesData.code === BusinessLineCons.RESPONSE_CODE_SUCCESS && detailedLinesData.object.length > 0) {
            let detailedLineRowNames = [];
            detailedLinesData.object.map(detailedLineRow => {
              detailedLineRow.lineaDetalle.map(detailedLineRowName => {
                if (!detailedLineRowNames.includes(detailedLineRowName)) detailedLineRowNames.push(detailedLineRowName);
              })
            })
            setDetailedLineFilterList(detailedLineRowNames);
            setDetailedLineList(detailedLinesData.object);
          } else if (detailedLinesData.code === BusinessLineCons.RESPONSE_CODE_FAILURE) {
            setDetailedLineList([]);
            notify(BusinessLineCons.MESSAGE_DETAILED_LINES_EMPTY);
          }
        } else if (businessLineData.code === BusinessLineCons.RESPONSE_CODE_FAILURE) {
          notify(BusinessLineCons.MESSAGE_BUSINESS_LINES_EMPTY);
        } else {
          notifyError(BusinessLineCons.MESSAGE_ERROR);
        }
      } catch (error) {
        notifyError(BusinessLineCons.MESSAGE_ERROR);
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

    const onChangeFilter = async (e) => {
      setDetailedLine(e);
      if (e !== "") {
        setBusinessLinesFilterList(businessLinesList.filter(
          businessLinesValue => 
            (
              businessLinesValue.lineaDetalle.toLowerCase().includes(e.toLowerCase())) || businessLinesValue.lineaDetalle.toLowerCase() === e.toLowerCase()
        ));
        setMaxPages(getMaxPageValue(businessLinesList.filter(
          businessLinesValue => 
            (
              businessLinesValue.lineaDetalle.toLowerCase().includes(e.toLowerCase())) || businessLinesValue.lineaDetalle.toLowerCase() === e.toLowerCase()
        ).length/10));
      } else {
        setBusinessLinesFilterList(businessLinesList);
        setMaxPages(getMaxPageValue(businessLinesList.length/10));
      }
    }

    const editBusinessLineData = useCallback((e, i) => {
      // console.log("EDIT", i, tableParameters[i]);
      setOpenModal(true);
      setSelectedBusinessLine({
        idLineaDetalle: tableParameters[i]?.[BusinessLineCons.TAG_DETAILED_LINE_ID],
        idTipoTransaccion: tableParameters[i]?.[BusinessLineCons.TAG_TRANSACTION_TYPE_ID],
        lineaNegocio: tableParameters[i]?.[BusinessLineCons.TAG_BUSINESS_LINE],
        lineaDetalle: tableParameters[i]?.[BusinessLineCons.TAG_DETAILED_LINE],
        autorizador:tableParameters[i]?.[BusinessLineCons.TAG_AUTHORIZER],
        tipoTransaccion:tableParameters[i]?.[BusinessLineCons.TAG_TRANSACTION_TYPE],
      });
    }, [tableParameters]);

    const clearSelectedBusinessLine = async () => {
      setSelectedBusinessLine({
        idLineaDetalle: 0,
        idTipoTransaccion: 0,
        lineaNegocio: "",
        lineaDetalle: "",
        autorizador: "",
        tipoTransaccion: "",
      });
    }

    const handleShowModal = useCallback((showModal) => {
      setOpenModal(showModal);
      clearSelectedBusinessLine();
    }, []);

    const onChangeFormat = useCallback((e) => {
      setSelectedBusinessLine((old) => {
        return { ...old, [e.target.name]: e.target.value };
      });
    }, []);

    const onSubmit = useCallback(
      (e) => {
        console.log("SAVE");
        console.log(e);
      },
      [selectedBusinessLine]
    );

    try {
      return (
        <Fragment>
          { loadScreen &&
            <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
              <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4" />
              <h2 className="text-center text-white text-xl font-semibold">{BusinessLineCons.LABEL_LOADING}</h2>
            </div>
          }
          <ButtonBar>
            <Button
              onClick={() => {handleShowModal(true)}}
              type="submit"
            >
              {BusinessLineCons.LABEL_CREATE_BUSINESS_LINE}
            </Button>
          </ButtonBar>
          <TableEnterprise
            data={tableParameters}
            headers={[
              BusinessLineCons.LABEL_BUSINESS_LINE,
              BusinessLineCons.LABEL_DETAILED_LINE,
              BusinessLineCons.LABEL_AUTHORIZER,
              BusinessLineCons.LABEL_TRANSACTION_TYPE,
            ]}
            maxPage={maxPages}
            onSelectRow={editBusinessLineData}
            onSetPageData={setPageData}
            updateEvent={getBusinessLineData}
            title={BusinessLineCons.TITLE_BUSINESS_LINES}
          >
            <Input
              autoComplete="off"
              defaultValue={detailedLine}
              id={BusinessLineCons.TAG_DETAILED_FILTER_LINE}
              label={BusinessLineCons.LABEL_DETAILED_LINE}
              list={BusinessLineCons.TAG_DETAILED_FILTER_LINE_LIST}
              maxLength="50"
              minLength="1"
              onChange={(e)=>{onChangeFilter(e.target.value)}}
              name={BusinessLineCons.TAG_DETAILED_FILTER_LINE}
              type="search"              
            />
            <datalist id={BusinessLineCons.TAG_DETAILED_FILTER_LINE_LIST}>
              {detailedLineFilterList.map(detailedLineFilterRow => {
                return(
                  <option 
                    key={detailedLineFilterRow.idLineaDetalle}
                    value={detailedLineFilterRow.nombreLineaDetalle}
                  >
                    {detailedLineFilterRow.nombreLineaDetalle}
                  </option>
                )
              })}
            </datalist>
          </TableEnterprise>
          <Modal show={openModal} handleClose={() => {handleShowModal(false)}}>
            <Form onSubmit={onSubmit} onChange={onChangeFormat} grid>
              <Input
                autoComplete="off"
                id={BusinessLineCons.TAG_BUSINESS_LINE}
                label={BusinessLineCons.LABEL_BUSINESS_LINE}
                name={BusinessLineCons.TAG_BUSINESS_LINE}
                onChange={() => {}}
                required
                type="text"
                value={selectedBusinessLine?.lineaNegocio}
              />
              <>
                <Input
                  autoComplete="off"
                  id={BusinessLineCons.TAG_DETAILED_LINE}
                  label={BusinessLineCons.LABEL_DETAILED_LINE}
                  list={BusinessLineCons.TAG_DETAILED_LINE_LIST}
                  name={BusinessLineCons.TAG_DETAILED_LINE}
                  onChange={() => {}}
                  required
                  type="text"
                  value={selectedBusinessLine?.lineaDetalle}
                />
                <datalist id={BusinessLineCons.TAG_DETAILED_LINE_LIST}>
                  {detailedLineFilterList.map(detailedLineFilterRow => {
                    return(
                      <option 
                        key={detailedLineFilterRow.idLineaDetalle} 
                        value={detailedLineFilterRow.nombreLineaDetalle}
                      >
                        {detailedLineFilterRow.nombreLineaDetalle}
                      </option>
                    )
                  })}
                </datalist>
              </>
              <>
                <Input
                  autoComplete="off"
                  disabled={selectedBusinessLine?.lineaDetalle === ""}
                  id={BusinessLineCons.TAG_AUTHORIZER}
                  label={BusinessLineCons.LABEL_AUTHORIZER}
                  list={BusinessLineCons.TAG_AUTHORIZER_LIST}
                  name={BusinessLineCons.TAG_AUTHORIZER}
                  onChange={() => {}}
                  required
                  type="text"
                  value={selectedBusinessLine?.autorizador}
                />
                <datalist id={BusinessLineCons.TAG_AUTHORIZER_LIST}>
                  {authorizerList.map(authorizerRow => {
                    return(
                      <option 
                        key={authorizerRow.id} 
                        value={authorizerRow.nombre}
                      >
                        {authorizerRow.nombre}
                      </option>
                    )
                  })}
                </datalist>
              </>
              <>
                <Input
                  autoComplete="off"
                  disabled={selectedBusinessLine?.lineaDetalle === ""}
                  id={BusinessLineCons.TAG_TRANSACTION_TYPE}
                  label={BusinessLineCons.LABEL_TRANSACTION_TYPE}
                  list={BusinessLineCons.TAG_TRANSACTION_TYPE_LIST}
                  name={BusinessLineCons.TAG_TRANSACTION_TYPE}
                  onChange={() => {}}
                  required
                  type="text"
                  value={selectedBusinessLine?.tipoTransaccion}
                />
                <datalist id={BusinessLineCons.TAG_TRANSACTION_TYPE_LIST}>
                  {detailedLineFilterList.map(detailedLineFilterRow => {
                    return(
                      <option 
                        key={detailedLineFilterRow.idLineaDetalle} 
                        value={detailedLineFilterRow.nombreLineaDetalle}
                      >
                        {detailedLineFilterRow.nombreLineaDetalle}
                      </option>
                    )
                  })}
                </datalist>
              </>
              <ButtonBar>
                <Button
                  onClick={() => {handleShowModal(false)}}
                  type="button"
                >
                  {BusinessLineCons.LABEL_CANCEL}
                </Button>
                <Button 
                  type="submit"
                >
                  {BusinessLineCons.LABEL_SAVE}
                </Button>
              </ButtonBar>
            </Form>
          </Modal>
        </Fragment>
      );
    } catch (error) {
      return(<Error404/>);
    }
  } catch (error) {
    return(<Error404/>);
  }
}

export default LineasNegocio;