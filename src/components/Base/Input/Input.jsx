import { useCallback, useRef, useState } from "react";
import classes from "./Input.module.css";

const Input = ({ label, self = false, onLazyInput, onGetFile, ...input }) => {
  const { formItem, dropzone, File } = classes;
  const { id: _id, type } = input;

  const [timer, setTimer] = useState(null);

  const inputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const showDropZone = useCallback(() => {
    const dropZone = dropZoneRef.current;
    dropZone.style.display = "block";
  }, []);

  const hideDropZone = useCallback(() => {
    const dropZone = dropZoneRef.current;
    dropZone.style.display = "none";
  }, []);

  const allowDrag = useCallback((e) => {
    if (true) {
      // Test that the item being dragged is a valid one
      e.dataTransfer.dropEffect = "copy";
      e.preventDefault();
    }
  }, []);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      hideDropZone();

      const items = e.dataTransfer.items;

      const tempFiles = [];

      const GetFileTree = (item, path) => {
        path = path || "";
        const initialItem = item;
        item = item.webkitGetAsEntry(); //Might be renamed to GetAsEntry() in 2020
        if (!item) return;
        if (item.isFile) {
          const file = initialItem.getAsFile();
          tempFiles.push(file);
        } else if (item.isDirectory) {
          console.log(item.fullPath); //console.log(item.name)

          // Get folder contents
          let dirReader = item.createReader();
          dirReader.readEntries((entries) => {
            entries.forEach((entry) => {
              GetFileTree(entry, path + item.name + "/");
            });
          });
        }
      };
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        GetFileTree(item);
      }

      onGetFile([...tempFiles]);
    },
    [onGetFile, hideDropZone]
  );

  if (type === "file") {
    input.onChange = (e) => {
      onGetFile(e.target.files);
    };
    window.addEventListener("dragenter", (e) => {
      showDropZone();
    });
  }

  if (onLazyInput !== undefined) {
    const { callback, timeOut } = onLazyInput;

    if (callback !== undefined && timeOut !== undefined) {
      const onInputCallback = input.onInput;

      input.onInput = (e) => {
        onInputCallback(e);

        if (timer) {
          clearTimeout(timer);
        }

        setTimer(
          setTimeout(() => {
            callback(e);
          }, timeOut)
        );
      };
    }
  }

  return self ? (
    <>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <input {...input} ref={inputRef} />
      {type === "file" ? (
        <>
          <h1>O</h1>
          <h1>Arrasta los archivos</h1>
          <div
            id="dropzone"
            ref={dropZoneRef}
            className={dropzone}
            onDragEnter={allowDrag}
            onDragOver={allowDrag}
            onDragLeave={() => hideDropZone()}
            onDrop={handleDrop}
          ></div>
        </>
      ) : (
        ""
      )}
    </>
  ) : (
    <div className={`${formItem} ${type === "file" ? File : ""}`}>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <input {...input} ref={inputRef} />
      {type === "file" ? (
        <>
          <h1>O</h1>
          <h1>Arrasta los archivos</h1>
          <div
            id="dropzone"
            ref={dropZoneRef}
            className={dropzone}
            onDragEnter={allowDrag}
            onDragOver={allowDrag}
            onDragLeave={() => hideDropZone()}
            onDrop={handleDrop}
          ></div>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default Input;
