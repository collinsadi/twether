export class HttpException extends Error {
    public status: number;
    public message: string;
    public data: unknown;
  
    constructor(status: number, message: string, data: unknown = "") {
      super(message);
      this.status = status;
      this.message = message;
      this.data = data;
    }
  }
  
  export const isHttpError = (error: unknown): error is HttpException => {
    return (
      (error as HttpException).status !== undefined &&
      (error as HttpException).message !== undefined
    );
  };
  