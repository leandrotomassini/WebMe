export interface ISiteStrategy {
  readonly hostname: string;
  initialize(): void;
  cleanup(): void;
}
