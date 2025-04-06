export abstract class Usecase<T = any> {
  abstract execute(...args: any[]): Promise<T>;
}
