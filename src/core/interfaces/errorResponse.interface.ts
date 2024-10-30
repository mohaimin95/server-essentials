export default interface IErrorResponse {
  name?: string;
  message?: string;
  redirect?: boolean;
  phoneConfirmedAt?: string | undefined;
  emailConfirmedAt?: string | undefined;
}
