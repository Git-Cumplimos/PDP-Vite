export type TypeServicesBackendTripleAObj = {
  error_status: boolean;
  error_msg: { [key: string]: any } | {};
  result: any;
};

export type TypeServicesBackendTripleA = {
  status: boolean;
  msg: string;
  obj: TypeServicesBackendTripleAObj;
};
