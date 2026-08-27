export class AppConfig {
  api: {
    baseUrl: string,
    fileUrl: string,
  };
  constructor() {
    this.api = {
      baseUrl: '',
      fileUrl: '',
    };

  }
}
