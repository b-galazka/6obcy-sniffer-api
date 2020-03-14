export interface IServiceFactory<T> {
  constructService(): T;
}
