import { DomObserver } from "../../../utils/dom/DomObserver";

interface VideoItem {
  readonly element: HTMLElement;
  readonly ageInMinutes: number;
}

interface TimeParseResult {
  readonly value: number;
  readonly unit: string;
}

export class VideoSorter {
  private static readonly VIDEO_CONTAINER_SELECTOR = "ytd-rich-grid-renderer #contents";
  private static readonly VIDEO_ITEM_SELECTOR = "ytd-rich-item-renderer:not([is-shelf-item]):not([hidden])";
  private static readonly METADATA_SELECTOR = ".yt-content-metadata-view-model__metadata-text";
  private static readonly DEBOUNCE_MS = 1000;

  private static readonly TIME_PATTERNS: ReadonlyMap<string, number> = new Map( [
    [ "segundo", 1 / 60 ],
    [ "segundos", 1 / 60 ],
    [ "second", 1 / 60 ],
    [ "seconds", 1 / 60 ],
    [ "minuto", 1 ],
    [ "minutos", 1 ],
    [ "minute", 1 ],
    [ "minutes", 1 ],
    [ "hora", 60 ],
    [ "horas", 60 ],
    [ "hour", 60 ],
    [ "hours", 60 ],
    [ "día", 60 * 24 ],
    [ "días", 60 * 24 ],
    [ "day", 60 * 24 ],
    [ "days", 60 * 24 ],
    [ "semana", 60 * 24 * 7 ],
    [ "semanas", 60 * 24 * 7 ],
    [ "week", 60 * 24 * 7 ],
    [ "weeks", 60 * 24 * 7 ],
    [ "mes", 60 * 24 * 30 ],
    [ "meses", 60 * 24 * 30 ],
    [ "month", 60 * 24 * 30 ],
    [ "months", 60 * 24 * 30 ],
    [ "año", 60 * 24 * 365 ],
    [ "años", 60 * 24 * 365 ],
    [ "year", 60 * 24 * 365 ],
    [ "years", 60 * 24 * 365 ],
  ] );

  private domObserver: DomObserver | null;
  private isProcessing: boolean;
  private isEnabled: boolean;

  constructor() {
    this.domObserver = null;
    this.isProcessing = false;
    this.isEnabled = true;
  }

  initialize(): void {
    if ( !this.isEnabled ) {
      return;
    }
    this.setupObserver();
    this.sortVideos();
  }

  cleanup(): void {
    this.stopObserver();
    this.resetState();
  }

  reset(): void {
    if ( !this.isEnabled ) {
      return;
    }
    this.sortVideos();
  }

  setEnabled( enabled: boolean ): void {
    this.isEnabled = enabled;
    if ( enabled ) {
      this.initialize();
    } else {
      this.stopObserver();
    }
  }

  private setupObserver(): void {
    if ( this.domObserver !== null ) {
      return;
    }

    this.domObserver = new DomObserver(
      {
        target: document.body,
        options: {
          childList: true,
          subtree: true,
        },
        debounceMs: VideoSorter.DEBOUNCE_MS,
      },
      () => this.handleMutation()
    );

    this.domObserver.start();
  }

  private stopObserver(): void {
    if ( this.domObserver === null ) {
      return;
    }

    this.domObserver.stop();
    this.domObserver = null;
  }

  private resetState(): void {
    this.isProcessing = false;
  }

  private handleMutation(): void {
    if ( !this.isEnabled ) {
      return;
    }
    this.sortVideos();
  }

  private sortVideos(): void {
    if ( this.isProcessing || !this.isEnabled ) {
      return;
    }

    if ( !this.isHomePage() ) {
      return;
    }

    const container = document.querySelector( VideoSorter.VIDEO_CONTAINER_SELECTOR );
    if ( !( container instanceof HTMLElement ) ) {
      return;
    }

    this.isProcessing = true;

    try {
      this.performSort( container );
    } finally {
      this.isProcessing = false;
    }
  }

  private isHomePage(): boolean {
    const path = window.location.pathname;
    return path === "/" || path === "/feed/subscriptions";
  }

  private performSort( container: HTMLElement ): void {
    const videoItems = this.collectVideoItems( container );

    if ( videoItems.length < 2 ) {
      return;
    }

    const sortedItems = this.sortByAge( videoItems );
    this.reorderElements( container, sortedItems );
  }

  private collectVideoItems( container: HTMLElement ): VideoItem[] {
    const elements = container.querySelectorAll( VideoSorter.VIDEO_ITEM_SELECTOR );
    const items: VideoItem[] = [];

    for ( const element of elements ) {
      if ( !( element instanceof HTMLElement ) ) {
        continue;
      }

      if ( element.style.display === "none" ) {
        continue;
      }

      const ageInMinutes = this.extractAge( element );
      if ( ageInMinutes === null ) {
        continue;
      }

      items.push( {
        element,
        ageInMinutes,
      } );
    }

    return items;
  }

  private extractAge( element: HTMLElement ): number | null {
    const metadataElements = element.querySelectorAll( VideoSorter.METADATA_SELECTOR );

    for ( const metadata of metadataElements ) {
      const text = metadata.textContent?.trim();
      if ( text === undefined || text === null ) {
        continue;
      }

      const age = this.parseTimeText( text );
      if ( age !== null ) {
        return age;
      }
    }

    return null;
  }

  private parseTimeText( text: string ): number | null {
    const lowerText = text.toLowerCase();

    if ( !lowerText.includes( "hace" ) && !lowerText.includes( "ago" ) ) {
      return null;
    }

    const parseResult = this.extractTimeComponents( lowerText );
    if ( parseResult === null ) {
      return null;
    }

    const multiplier = VideoSorter.TIME_PATTERNS.get( parseResult.unit );
    if ( multiplier === undefined ) {
      return null;
    }

    return parseResult.value * multiplier;
  }

  private extractTimeComponents( text: string ): TimeParseResult | null {
    const numberMatch = text.match( /(\d+)/ );
    if ( numberMatch === null || numberMatch[ 1 ] === undefined ) {
      return null;
    }

    const value = parseInt( numberMatch[ 1 ], 10 );

    for ( const unit of VideoSorter.TIME_PATTERNS.keys() ) {
      if ( text.includes( unit ) ) {
        return { value, unit };
      }
    }

    return null;
  }

  private sortByAge( items: VideoItem[] ): VideoItem[] {
    return [ ...items ].sort( ( a, b ) => a.ageInMinutes - b.ageInMinutes );
  }

  private reorderElements( container: HTMLElement, sortedItems: VideoItem[] ): void {
    const fragment = document.createDocumentFragment();

    for ( const item of sortedItems ) {
      fragment.appendChild( item.element );
    }

    const firstVideoItem = container.querySelector( VideoSorter.VIDEO_ITEM_SELECTOR );
    if ( firstVideoItem !== null ) {
      container.insertBefore( fragment, firstVideoItem );
    }
  }
}
