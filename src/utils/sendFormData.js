const sendFormData = (
  url = "",
  method = "POST",
  data = new FormData(),
  onsuccess = () => {},
  onerror = () => {},
  responseType = "",
  onprogress = () => {},
  ontimeout = () => {}
) => {
  const xhr = new XMLHttpRequest();
  xhr.ontimeout = () => ontimeout?.(xhr);
  xhr.onabort = () => onerror?.(xhr);
  xhr.onerror = () => onerror?.(xhr);
  xhr.onprogress = (ev) => onprogress?.(xhr, ev);
  xhr.onload = () => onsuccess?.(xhr);
  xhr.responseType = responseType;
  xhr.open(method, url, true);
  xhr.send(data);
};

export default sendFormData;
