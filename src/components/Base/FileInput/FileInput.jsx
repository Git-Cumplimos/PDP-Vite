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

const FileInput = ({ label, onGetFile, allowDrop = true, ...input }) => {
  const { formItem, dropzone, File } = classes;
  const { id: _id, disabled } = input;

  const inputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const realZoneRef = useRef(null);

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

  const onChangeInput = useCallback(
    (e) => onGetFile?.(e.target.files),
    [onGetFile]
  );

  useEffect(() => {
    const zoneLocalRef = realZoneRef.current;
    if (allowDrop) {
      zoneLocalRef.addEventListener("dragenter", (e) => {
        showDropZone(dropZoneRef, disabled);
      });
    }

    return () => {
      if (allowDrop) {
        zoneLocalRef.removeEventListener("dragenter", (e) => {
          showDropZone(dropZoneRef, disabled);
        });
      }
    };
  }, [input, onGetFile, allowDrop, disabled]);

  return (
    <div className={`${formItem} ${File}`} ref={realZoneRef}>
      {label && label !== "" && (
        <label htmlFor={_id} className={`${"text-center"}`}>
          {label}
          <input
            {...input}
            type={"file"}
            ref={inputRef}
            onChange={onChangeInput}
            onInput={() => {}}
          />
        </label>
      )}
      {allowDrop ? (
        <div>
          <h1 className="text-sm">O</h1>
          <h1 className="text-sm">Arrastra los archivos</h1>
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
      ) : ""}
    </div>
  );
};

export default FileInput;
