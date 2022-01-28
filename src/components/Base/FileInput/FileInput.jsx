import { useCallback, useEffect, useRef } from "react";
import { notifyError } from "../../../utils/notify";
import classes from "./FileInput.module.css";

const showDropZone = (dropZoneRef, disabled) => {
  if (
    !disabled &&
    dropZoneRef.current !== null &&
    dropZoneRef.current !== undefined
  ) {
    const dropZone = dropZoneRef.current;
    dropZone.style.display = "block";
  }
};

const hideDropZone = (dropZoneRef) => {
  const dropZone = dropZoneRef.current;
  dropZone.style.display = "none";
};

const allowDrag = (e) => {
  if (true) {
    // Test that the item being dragged is a valid one
    e.dataTransfer.dropEffect = "copy";
    e.preventDefault();
  }
};

const FileInput = ({ label, self = false, onGetFile, ...input }) => {
  const { formItem, dropzone, File } = classes;
  const { id: _id, disabled } = input;

  const inputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      hideDropZone(dropZoneRef);

      const items = e.dataTransfer.items;

      const tempFiles = [];

      const GetFileTree = async (item, path) => {
        path = path ?? "";
        const initialItem = item;
        item = item.webkitGetAsEntry(); //Might be renamed to GetAsEntry() in 2020
        // console.log(item);
        if (!item) return;
        if (item.isFile) {
          const file = initialItem.getAsFile();
          // console.log("file", file);
          tempFiles.push(file);
        } else if (item.isDirectory) {
          notifyError("Solo se permiten archivos, no carpetas");
          // tempFiles.splice(0, tempFiles.length);
          // console.log(item.fullPath); //console.log(item.name)

          // Get folder contents
          // let dirReader = item.createReader();
          // dirReader.readEntries(async (entries) => {
          //   entries.forEach(async (entry) => {
          //     GetFileTree(entry, path + item.name + "/");
          //   });
          // });
        }
      };
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        GetFileTree(item);
      }

      onGetFile?.([...tempFiles]);
    },
    [onGetFile]
  );

  useEffect(() => {
    input.onChange = (e) => {
      onGetFile?.(e.target.files);
    };
    window.addEventListener("dragenter", (e) => {
      showDropZone(dropZoneRef, disabled);
    });

    return () => {
      window.removeEventListener("dragenter", (e) => {
        showDropZone(dropZoneRef, disabled);
      });
    };
  }, [input, onGetFile, disabled]);

  return (
    <div className={`${formItem} ${File}`}>
      {label && label !== "" && (
        <label htmlFor={_id} className={`${"text-center"}`}>
          {label}
        </label>
      )}
      <input {...input} type={"file"} ref={inputRef} />
      <h1>O</h1>
      <h1>Arrasta los archivos</h1>
      {!disabled ? (
        <div
          ref={dropZoneRef}
          className={dropzone}
          onDragEnter={allowDrag}
          onDragOver={allowDrag}
          onDragLeave={() => hideDropZone(dropZoneRef)}
          onDrop={handleDrop}
        ></div>
      ) : (
        ""
      )}
    </div>
  );
};

export default FileInput;