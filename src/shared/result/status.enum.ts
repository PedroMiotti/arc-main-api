export enum Status {
  Ok = 'Requested operation was completed successfully.',
  InvalidOperation = 'Server cannot or will not process the request due to something that is perceived to be a client error.',
  NotFound = 'Not Found',
  InternalException = 'Server encountered an unexpected condition that prevented it from fulfilling the request.',
}
