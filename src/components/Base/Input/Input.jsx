import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import classes from "./Input.module.css";

const Input = ({
  label,
  self = false,
  onLazyInput,
  onGetFile,
  suggestions,
  onSelectSuggestion,
  ...input
}) => {
  const { formItem, dropzone, File, suggestion } = classes;
  const { id: _id, type, disabled } = input;

  const [timer, setTimer] = useState(null);

  const inputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const notifyError = (msg) => {
    toast.error(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const showDropZone = useCallback(() => {
    if (
      !disabled &&
      dropZoneRef.current !== null &&
      dropZoneRef.current !== undefined
    ) {
      const dropZone = dropZoneRef.current;
      dropZone.style.display = "block";
    }
  }, [disabled]);

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

      const GetFileTree = async (item, path) => {
        path = path || "";
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
          {!disabled ? (
            <div
              ref={dropZoneRef}
              className={dropzone}
              onDragEnter={allowDrag}
              onDragOver={allowDrag}
              onDragLeave={() => hideDropZone()}
              onDrop={handleDrop}
            ></div>
          ) : (
            ""
          )}
        </>
      ) : Array.isArray(suggestions) && suggestions.length > 0 ? (
        <ul className={suggestion}>
          {suggestions.map((el, idx) => {
            return (
              <li
                key={idx}
                onClick={() => {
                  onSelectSuggestion(idx, el);
                }}
              >
                <h1>{el}</h1>
              </li>
            );
          })}
        </ul>
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
          {!disabled ? (
            <div
              ref={dropZoneRef}
              className={dropzone}
              onDragEnter={allowDrag}
              onDragOver={allowDrag}
              onDragLeave={() => hideDropZone()}
              onDrop={handleDrop}
            ></div>
          ) : (
            ""
          )}
        </>
      ) : Array.isArray(suggestions) && suggestions.length > 0 ? (
        <ul className={suggestion}>
          {suggestions.map((el, idx) => {
            return (
              <li
                key={idx}
                onClick={() => {
                  onSelectSuggestion(idx, el);
                }}
              >
                <h1>{el}</h1>
              </li>
            );
          })}
        </ul>
      ) : (
        ""
      )}
    </div>
  );
};

export default Input;
