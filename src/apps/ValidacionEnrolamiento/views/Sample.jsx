/* import { Worker } from "@react-pdf-viewer/core";
import { Viewer } from "@react-pdf-viewer/core"; */

// Import the styles
/* import "@react-pdf-viewer/core/lib/styles/index.css"; */
/* import file from ".././doc.pdf";
export default function Sample() {
  return (
    <div
      style={{
        border: "1px solid rgba(0, 0, 0, 0.3)",
        height: "750px",
      }}
    >
      <Viewer fileUrl="https://archivos-enrolamiento-comercios.s3.amazonaws.com/2022-02-04-10-05-57_1018100200_CC.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAZK54KBWOWNXVY2V5%2F20220204%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20220204T172205Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=6bb9cd9f3feca6d2fd5dbfc395a0182e894356af1c3c603162ec51ad9257a660" />
    </div>
  );
} */

/* <center>
  <div>
    <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
      {Array.from(new Array(numPages), (el, index) => (
        <Page key={`page_${index + 1}`} pageNumber={index + 1} />
      ))}
    </Document>
  </div>
</center> */

//// sirveeeeee////

import React, { useState } from "react";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
/* import file from ".././certificado_movimiento.pdf"; */
/* import file2 from ".././ced.pdf";
import file3 from ".././rut.pdf"; */
import Form from "../../../components/Base/Form/Form";
import classes from "./Sample.module.css";
export default function Sample({ file }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const { contenedorPrincipalDoc } = classes;
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offSet) {
    setPageNumber((prevPageNumber) => prevPageNumber + offSet);
  }

  function changePageBack(e) {
    e.preventDefault();
    changePage(-1);
  }

  function changePageNext(e) {
    e.preventDefault();
    changePage(+1);
  }

  return (
    <div>
      <Form /* grid={false} */>
        <div className={contenedorPrincipalDoc}>
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
            <Page height="530" pageNumber={pageNumber} />
          </Document>
          {/*  <p>
            {" "}
            Page {pageNumber} of {numPages}
          </p> */}
          {pageNumber > 1 && (
            <button onClick={(e) => changePageBack(e)}>Previous Page</button>
          )}
          {pageNumber < numPages && (
            <button onClick={(e) => changePageNext(e)}>Next Page</button>
          )}
        </div>
        {/* <div>
          <Document file={file2} onLoadSuccess={onDocumentLoadSuccess}>
            <Page height="550" pageNumber={pageNumber} />
          </Document>
          <p>
            {" "}
            Page {pageNumber} of {numPages}
          </p>
          {pageNumber > 1 && (
            <button onClick={(e) => changePageBack(e)}>Previous Page</button>
          )}
          {pageNumber < numPages && (
            <button onClick={(e) => changePageNext(e)}>Next Page</button>
          )}
        </div>
        <div>
          <Document file={file3} onLoadSuccess={onDocumentLoadSuccess}>
            <Page height="550" pageNumber={pageNumber} />
          </Document>
          <p>
            {" "}
            Page {pageNumber} of {numPages}
          </p>
          {pageNumber > 1 && (
            <button onClick={(e) => changePageBack(e)}>Previous Page</button>
          )}
          {pageNumber < numPages && (
            <button onClick={(e) => changePageNext(e)}>Next Page</button>
          )}
        </div> */}
      </Form>
    </div>
  );
}
