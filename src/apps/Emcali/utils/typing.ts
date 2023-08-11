export type TypeServicesBackendEmcaliObj = {
  error_status: boolean;
  error_msg: { [key: string]: any } | {};
  result: any;
};

export type TypeServicesBackendEmcali = {
  status: boolean;
  msg: string;
  obj: TypeServicesBackendEmcaliObj;
};
