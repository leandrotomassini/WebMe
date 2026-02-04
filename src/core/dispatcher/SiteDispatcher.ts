import type { ISiteStrategy } from "../interfaces/ISiteStrategy";

export class SiteDispatcher {
  private static instance: SiteDispatcher | null = null;
  private readonly strategies: Map<string, ISiteStrategy>;
  private activeStrategy: ISiteStrategy | null;

  private constructor() {
    this.strategies = new Map<string, ISiteStrategy>();
    this.activeStrategy = null;
  }

  static getInstance(): SiteDispatcher {
    if ( SiteDispatcher.instance === null ) {
      SiteDispatcher.instance = new SiteDispatcher();
    }
    return SiteDispatcher.instance;
  }

  registerStrategy( strategy: ISiteStrategy ): void {
    this.strategies.set( strategy.hostname, strategy );
  }

  dispatch( hostname: string ): void {
    const normalizedHostname = this.normalizeHostname( hostname );
    const strategy = this.findMatchingStrategy( normalizedHostname );

    if ( strategy === undefined ) {
      return;
    }

    this.activateStrategy( strategy );
  }

  cleanup(): void {
    if ( this.activeStrategy !== null ) {
      this.activeStrategy.cleanup();
      this.activeStrategy = null;
    }
  }

  private normalizeHostname( hostname: string ): string {
    return hostname.replace( /^www\./, "" );
  }

  private findMatchingStrategy( hostname: string ): ISiteStrategy | undefined {
    const exactMatch = this.strategies.get( hostname );
    if ( exactMatch !== undefined ) {
      return exactMatch;
    }

    for ( const [ key, strategy ] of this.strategies.entries() ) {
      if ( hostname.endsWith( key ) || key.endsWith( hostname ) ) {
        return strategy;
      }
    }

    return undefined;
  }

  private activateStrategy( strategy: ISiteStrategy ): void {
    if ( this.activeStrategy !== null ) {
      this.activeStrategy.cleanup();
    }
    this.activeStrategy = strategy;
    strategy.initialize();
  }
}
