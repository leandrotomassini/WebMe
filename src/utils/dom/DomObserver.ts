export interface DomObserverConfig {
  readonly target: Node;
  readonly options: MutationObserverInit;
  readonly debounceMs?: number;
}

export type MutationHandler = ( mutations: MutationRecord[] ) => void;

export class DomObserver {
  private readonly observer: MutationObserver;
  private readonly config: DomObserverConfig;
  private debounceTimer: ReturnType<typeof setTimeout> | null;
  private isObserving: boolean;

  constructor( config: DomObserverConfig, handler: MutationHandler ) {
    this.config = config;
    this.debounceTimer = null;
    this.isObserving = false;

    const wrappedHandler = this.createDebouncedHandler( handler );
    this.observer = new MutationObserver( wrappedHandler );
  }

  start(): void {
    if ( this.isObserving ) {
      return;
    }
    this.observer.observe( this.config.target, this.config.options );
    this.isObserving = true;
  }

  stop(): void {
    if ( !this.isObserving ) {
      return;
    }
    this.observer.disconnect();
    this.clearDebounceTimer();
    this.isObserving = false;
  }

  private createDebouncedHandler( handler: MutationHandler ): MutationCallback {
    const debounceMs = this.config.debounceMs;

    if ( debounceMs === undefined || debounceMs <= 0 ) {
      return handler;
    }

    return ( mutations: MutationRecord[] ) => {
      this.clearDebounceTimer();
      this.debounceTimer = setTimeout( () => {
        handler( mutations );
      }, debounceMs );
    };
  }

  private clearDebounceTimer(): void {
    if ( this.debounceTimer !== null ) {
      clearTimeout( this.debounceTimer );
      this.debounceTimer = null;
    }
  }
}
