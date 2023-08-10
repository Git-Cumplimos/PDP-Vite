/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unreachable */
import { Fragment, useEffect, useMemo, useState } from "react";
import { notify, notifyError } from "../../../../utils/notify";

import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Error404 from "../../../../pages/Error404";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal/Modal";
import TableEnterprise from "./components/LineaNegocio.table";

import { getBusinessLines, getDetailedLines, getTransactionTypes, putBusinessLine } from "./utils/LineasNegocio.fetch";

import "./utils/LineasNegocio.style.css";
import * as BusinessLineCons from "./utils/LineasNegocio.cons";

const paginator = (data, page, limit) => {
  return data.slice((page - 1) * limit, page * limit);
};

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
    const [validateAuthorizer, setValidateAuthorizer] = useState(true);
    const [{ page, limit }, setPageData] = useState(BusinessLineCons.OBJECT_PAGE_DATA);
    const [selectedBusinessLine, setSelectedBusinessLine] = useState(BusinessLineCons.OBJECT_BUSINESS_LINE);
    const [transactionTypeList, setTransactionTypeList] = useState([]);
    
    useEffect(() => {
      getBusinessLineData();
    }, []);
    
    const getBusinessLineData = async () => {
      setLoadScreen(true);
      try {
        clearSelectedBusinessLine();
        const businessLineData = await getBusinessLines();
        if (businessLineData.code === BusinessLineCons.RESPONSE_CODE_SUCCESS && businessLineData.object.length > 0) {
          setBusinessLinesList(businessLineData.object);
          setBusinessLinesFilterList(paginator(businessLineData.object, page, limit));
          setMaxPages(getMaxPageValue(businessLineData.object.length/limit));
          const detailedLinesData = await getDetailedLines();
          if (detailedLinesData.code === BusinessLineCons.RESPONSE_CODE_SUCCESS && detailedLinesData.object.length > 0) {
            setDetailedLineList(detailedLinesData.object);
            const detailedLineDataList = [];
            detailedLinesData.object.map(businessLineFilterRow => {
              if (businessLineFilterRow.lineaDetalle !== null) {
                if (businessLineFilterRow.lineaDetalle.length > 0) {
                  businessLineFilterRow.lineaDetalle.map(detailedLineFilterRow => {
                    if (!detailedLineDataList.includes(detailedLineFilterRow)) detailedLineDataList.push(detailedLineFilterRow);
                  })
                }
              }
            });
            setDetailedLineFilterList(detailedLineDataList);
          } else if (detailedLinesData.code === BusinessLineCons.RESPONSE_CODE_FAILURE) {
            setDetailedLineList([]);
            setDetailedLineFilterList([]);
            notify(BusinessLineCons.MESSAGE_DETAILED_LINES_EMPTY);
          }
          const transactionTypeData = await getTransactionTypes();
          if (transactionTypeData.code === BusinessLineCons.RESPONSE_CODE_SUCCESS && transactionTypeData.object.length > 0) {
            setAuthorizerList(transactionTypeData.object);
            setTransactionTypeList(transactionTypeData.object);
          } else if (transactionTypeData.code === BusinessLineCons.RESPONSE_CODE_FAILURE) {
            setAuthorizerList([]);
            setTransactionTypeList([]);
            notify(BusinessLineCons.MESSAGE_TRANSACTION_TYPES_EMPTY);
          }
        } else if (businessLineData.code === BusinessLineCons.RESPONSE_CODE_FAILURE) {
          notify(BusinessLineCons.MESSAGE_BUSINESS_LINES_EMPTY);
        } else {
          notifyError(BusinessLineCons.MESSAGE_ERROR);
        }
        setDetailedLine("");
      } catch (error) {
        notifyError(BusinessLineCons.MESSAGE_ERROR);
      }
      setLoadScreen(false);
    }
    
    useEffect(() => {
      if (businessLinesFilterList.length > 0) {
        setFoundTrxTypes();
      }
    }, [page, limit]);
    
    const setFoundTrxTypes = () => {
      setBusinessLinesFilterList(paginator(businessLinesList, page, limit));
      setMaxPages(getMaxPageValue(businessLinesList.length/limit));
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
            idLineaNegocio,
            lineaNegocio,
            lineaDetalle,
            autorizador,
            tipoTransaccion,
          }) => {
            return {
              "idLineaDetalle": idLineaDetalle,
              "idTipoTransaccion": idTipoTransaccion,
              "idLineaNegocio": idLineaNegocio,
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
        setBusinessLinesFilterList(paginator(businessLinesList.filter(
          businessLinesValue => 
            (
              businessLinesValue.lineaDetalle.toLowerCase().includes(e.toLowerCase())) || businessLinesValue.lineaDetalle.toLowerCase() === e.toLowerCase()
        ), page, limit));
        setMaxPages(getMaxPageValue(businessLinesList.filter(
          businessLinesValue => 
            (
              businessLinesValue.lineaDetalle.toLowerCase().includes(e.toLowerCase())) || businessLinesValue.lineaDetalle.toLowerCase() === e.toLowerCase()
        ).length/limit));
      } else {
        setBusinessLinesFilterList(paginator(businessLinesList, page, limit));
        setMaxPages(getMaxPageValue(businessLinesList.length/limit));
      }
    }

    const editBusinessLineData = async (e, i) => {
      setOpenModal(true);
      setValidateAuthorizer(false);
      setSelectedBusinessLine({
        idLineaDetalle: tableParameters[i]?.[BusinessLineCons.TAG_DETAILED_LINE_ID],
        idTipoTransaccion: tableParameters[i]?.[BusinessLineCons.TAG_TRANSACTION_TYPE_ID],
        idLineaNegocio: tableParameters[i]?.[BusinessLineCons.TAG_BUSINESS_LINE_ID],
        lineaNegocio: tableParameters[i]?.[BusinessLineCons.TAG_BUSINESS_LINE],
        lineaDetalle: tableParameters[i]?.[BusinessLineCons.TAG_DETAILED_LINE],
        autorizador:tableParameters[i]?.[BusinessLineCons.TAG_AUTHORIZER],
        tipoTransaccion:tableParameters[i]?.[BusinessLineCons.TAG_TRANSACTION_TYPE],
      });
    }

    const clearSelectedBusinessLine = async () => {
      setDetailedLine("");
      setValidateAuthorizer(true);
      setSelectedBusinessLine(BusinessLineCons.OBJECT_BUSINESS_LINE);
    }

    const handleShowModal = async (showModal) => {
      setOpenModal(showModal);
      clearSelectedBusinessLine();
    }

    const onChangeFormat = async (e) => {
      setSelectedBusinessLine((old) => {
        return { ...old, [e.target.name]: e.target.value };
      });
      if (e.target.name === BusinessLineCons.TAG_AUTHORIZER) {
        if (authorizerList.filter(authorizerRow => authorizerRow.nombreAutorizador.toLowerCase() === e.target.value.toLowerCase()).length > 0) {
          setValidateAuthorizer(false);
        } else {          
          setValidateAuthorizer(true);
          setSelectedBusinessLine((old) => {
            return { ...old, [BusinessLineCons.TAG_TRANSACTION_TYPE]: "" };
          });
        }
      }
    }

    const onSubmit = async () => {
      setLoadScreen(true);
      try {
        let businessLineValidated = selectedBusinessLine?.[BusinessLineCons.TAG_BUSINESS_LINE_ID];
        let detailedLineValidated = selectedBusinessLine?.[BusinessLineCons.TAG_DETAILED_LINE_ID];
        let transactionTypeValidated = selectedBusinessLine?.[BusinessLineCons.TAG_TRANSACTION_TYPE_ID];
        let transactionTypeOld = selectedBusinessLine?.[BusinessLineCons.TAG_TRANSACTION_TYPE_ID];
        if (selectedBusinessLine?.lineaNegocio === "" || selectedBusinessLine?.lineaDetalle === "" || selectedBusinessLine?.autorizador === "" || selectedBusinessLine?.tipoTransaccion === "") {
          notifyError(BusinessLineCons.MESSAGE_VALIDATE);
          setLoadScreen(false);
          return;
        }
        if (authorizerList.filter(authorizerRow => authorizerRow.nombreAutorizador.toLowerCase() === selectedBusinessLine?.autorizador.toLowerCase()).length > 0) {
          const transactionTypeDataList = authorizerList.filter(authorizerRow => authorizerRow.nombreAutorizador.toLowerCase() === selectedBusinessLine?.autorizador.toLowerCase());
          const transactionTypeDataRow = transactionTypeDataList[0].transacciones.filter(transactionTypeRow => transactionTypeRow.nombre.toLowerCase() === selectedBusinessLine?.tipoTransaccion.toLowerCase());
          transactionTypeValidated = transactionTypeDataRow[0].id;
        } else {
          notify(BusinessLineCons.MESSAGE_VALIDATE_AUTHORIZER);
          setLoadScreen(false);
          return;
        }
        if (businessLinesList.filter(businessLineRow => businessLineRow.lineaNegocio.toLowerCase() === selectedBusinessLine?.lineaNegocio.toLowerCase()).length > 0) {
          const businessLinesDataList = businessLinesList.filter(businessLineRow => businessLineRow.lineaNegocio.toLowerCase() === selectedBusinessLine?.lineaNegocio.toLowerCase());
          businessLineValidated = businessLinesDataList[0].idLineaNegocio;
        }
        if (businessLinesList.filter(detailedLineRow => detailedLineRow.lineaDetalle.toLowerCase() === selectedBusinessLine?.lineaDetalle.toLowerCase()).length > 0) {
          const detailedLinesDataList = businessLinesList.filter(detailedLineRow => detailedLineRow.lineaDetalle.toLowerCase() === selectedBusinessLine?.lineaDetalle.toLowerCase());
          detailedLineValidated = detailedLinesDataList[0].idLineaDetalle;
        }
        const body = {
          nombreLineaNegocio: selectedBusinessLine?.lineaNegocio.toString(),
          nombreLineaDetallada: selectedBusinessLine?.lineaDetalle.toString(),
          idLineaNegocio: Number(businessLineValidated),
          idLineaDetallada: Number(detailedLineValidated),
          idTipoTransaccion: Number(transactionTypeOld),
          idTipoTransaccionNuevo: Number(transactionTypeValidated),
        };
        const businessLineData = await putBusinessLine(body);
        if (businessLineData.code === BusinessLineCons.RESPONSE_CODE_SUCCESS && businessLineData.message === BusinessLineCons.RESPONSE_MESSAGE_SUCCES) {          
          getBusinessLineData();
          clearSelectedBusinessLine();
          notify(BusinessLineCons.MESSAGE_SUCCESS_CREATED.replace("{}",selectedBusinessLine?.lineaNegocio.toString()));
          handleShowModal(false);
        } else if (businessLineData.code === BusinessLineCons.RESPONSE_CODE_EMPTY) {
          notifyError(BusinessLineCons.MESSAGE_VALIDATE_EMPTY_PARAMS);
        } else {
          notifyError(BusinessLineCons.MESSAGE_ERROR);
        }
      } catch (error) {
        notifyError(BusinessLineCons.MESSAGE_ERROR);
      }
      setLoadScreen(false);
    }

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
              maxLength={50}
              minLength={1}
              onChange={(e)=>{onChangeFilter(e.target.value)}}
              name={BusinessLineCons.TAG_DETAILED_FILTER_LINE}
              type="search"              
            />
            <datalist id={BusinessLineCons.TAG_DETAILED_FILTER_LINE_LIST}>
              {detailedLineFilterList.map(
                detailedLineFilterRow => {
                  return(
                    <option
                      key={detailedLineFilterRow.idLineaDetalle}
                      value={detailedLineFilterRow.nombreLineaDetalle}
                    >
                      {detailedLineFilterRow.nombreLineaDetalle}
                    </option>
                  )
                })
              }
            </datalist>
          </TableEnterprise>
          <Modal show={openModal} handleClose={() => {handleShowModal(false)}}>
            <Form onChange={onChangeFormat} grid>
              <Input
                autoComplete="off"
                id={BusinessLineCons.TAG_BUSINESS_LINE}
                label={BusinessLineCons.LABEL_BUSINESS_LINE}
                maxLength={50}
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
                  maxLength={50}
                  name={BusinessLineCons.TAG_DETAILED_LINE}
                  onChange={() => {}}
                  required
                  type="text"
                  value={selectedBusinessLine?.lineaDetalle}
                />
                <datalist id={BusinessLineCons.TAG_DETAILED_LINE_LIST}>
                  {detailedLineList.map(
                    businessLineFilterRow => {
                      if (businessLineFilterRow.nombreLineaNegocio.toLowerCase() === selectedBusinessLine?.lineaNegocio.toLowerCase()) {
                        const businessLineFilterList =  businessLineFilterRow.lineaDetalle.map(detailedLineFilterRow => {
                          return(
                            <option
                              key={detailedLineFilterRow.idLineaDetalle}
                              value={detailedLineFilterRow.nombreLineaDetalle}
                            >
                              {detailedLineFilterRow.nombreLineaDetalle}
                            </option>
                          )
                        });
                        return businessLineFilterList;
                      }
                    })
                  }
                </datalist>
              </>
              <>
                <Input
                  autoComplete="off"
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
                        key={authorizerRow.idAutorizador} 
                        value={authorizerRow.nombreAutorizador}
                      >
                        {authorizerRow.nombreAutorizador}
                      </option>
                    )
                  })}
                </datalist>
              </>
              <>
                <Input
                  autoComplete="off"
                  disabled={validateAuthorizer}
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
                  {transactionTypeList.map(authorizerRow => {
                    if (authorizerRow.nombreAutorizador.toLowerCase() === selectedBusinessLine?.autorizador.toLowerCase()) {
                      const transactionTypeFilterList =  authorizerRow.transacciones.map(transactionTypeFilterRow => {
                        return(
                          <option 
                            key={transactionTypeFilterRow.id} 
                            value={transactionTypeFilterRow.nombre}
                          >
                            {transactionTypeFilterRow.nombre}
                          </option>
                        )
                      });
                      return transactionTypeFilterList;
                    }
                  })}
                </datalist>
              </>
            </Form>
            <ButtonBar>
              <Button
                onClick={() => {handleShowModal(false)}}
                type="button"
              >
                {BusinessLineCons.LABEL_CANCEL}
              </Button>
              <Button
                onClick={onSubmit}
                type="submit"
              >
                {BusinessLineCons.LABEL_SAVE}
              </Button>
            </ButtonBar>
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