import { DomObserver } from "../../../utils/dom/DomObserver";

export class PlaylistHider {
  private static readonly VIDEO_ITEM_SELECTOR = "ytd-rich-item-renderer";
  private static readonly MIX_INDICATOR_SELECTORS = [
    "ytd-playlist-thumbnail",
    "[overlay-style='MIX']",
    "a[href*='/playlist']",
    "a[href*='&list=']",
  ] as const;
  private static readonly MIX_TEXT_PATTERNS = [ "Mix -", "Mix:", "Mix •" ] as const;
  private static readonly DEBOUNCE_MS = 300;

  private domObserver: DomObserver | null;

  constructor() {
    this.domObserver = null;
  }

  initialize(): void {
    this.setupObserver();
    this.hidePlaylists();
  }

  cleanup(): void {
    this.stopObserver();
  }

  reset(): void {
    this.hidePlaylists();
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
        debounceMs: PlaylistHider.DEBOUNCE_MS,
      },
      () => this.hidePlaylists()
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

  private hidePlaylists(): void {
    const videoItems = document.querySelectorAll( PlaylistHider.VIDEO_ITEM_SELECTOR );

    for ( const item of videoItems ) {
      if ( !( item instanceof HTMLElement ) ) {
        continue;
      }

      if ( this.isMixOrPlaylist( item ) ) {
        item.style.display = "none";
      }
    }
  }

  private isMixOrPlaylist( element: HTMLElement ): boolean {
    if ( this.hasMixIndicatorElement( element ) ) {
      return true;
    }

    if ( this.hasMixTextPattern( element ) ) {
      return true;
    }

    return false;
  }

  private hasMixIndicatorElement( element: HTMLElement ): boolean {
    for ( const selector of PlaylistHider.MIX_INDICATOR_SELECTORS ) {
      const indicator = element.querySelector( selector );
      if ( indicator !== null ) {
        return true;
      }
    }

    return false;
  }

  private hasMixTextPattern( element: HTMLElement ): boolean {
    const textContent = element.textContent;
    if ( textContent === null ) {
      return false;
    }

    for ( const pattern of PlaylistHider.MIX_TEXT_PATTERNS ) {
      if ( textContent.includes( pattern ) ) {
        return true;
      }
    }

    return false;
  }
}
