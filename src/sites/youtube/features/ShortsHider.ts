import { DomObserver } from "../../../utils/dom/DomObserver";

export class ShortsHider {
  private static readonly SHORTS_SECTION_SELECTOR = "ytd-rich-section-renderer";
  private static readonly SHORTS_SHELF_SELECTOR = "ytd-rich-shelf-renderer[is-shorts]";
  private static readonly REEL_SHELF_SELECTOR = "ytd-reel-shelf-renderer";
  private static readonly DEBOUNCE_MS = 300;

  private domObserver: DomObserver | null;

  constructor() {
    this.domObserver = null;
  }

  initialize(): void {
    this.setupObserver();
    this.hideShorts();
  }

  cleanup(): void {
    this.stopObserver();
  }

  reset(): void {
    this.hideShorts();
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
        debounceMs: ShortsHider.DEBOUNCE_MS,
      },
      () => this.hideShorts()
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

  private hideShorts(): void {
    this.hideShortsShelvesInSections();
    this.hideStandaloneShortsElements();
    this.hideReelShelves();
  }

  private hideShortsShelvesInSections(): void {
    const sections = document.querySelectorAll( ShortsHider.SHORTS_SECTION_SELECTOR );

    for ( const section of sections ) {
      if ( !( section instanceof HTMLElement ) ) {
        continue;
      }

      const shortsShelf = section.querySelector( ShortsHider.SHORTS_SHELF_SELECTOR );
      if ( shortsShelf !== null ) {
        section.style.display = "none";
      }
    }
  }

  private hideStandaloneShortsElements(): void {
    const shortsShelves = document.querySelectorAll( ShortsHider.SHORTS_SHELF_SELECTOR );

    for ( const shelf of shortsShelves ) {
      if ( !( shelf instanceof HTMLElement ) ) {
        continue;
      }

      const parentSection = shelf.closest( ShortsHider.SHORTS_SECTION_SELECTOR );
      if ( parentSection instanceof HTMLElement ) {
        parentSection.style.display = "none";
      } else {
        shelf.style.display = "none";
      }
    }
  }

  private hideReelShelves(): void {
    const reelShelves = document.querySelectorAll( ShortsHider.REEL_SHELF_SELECTOR );

    for ( const shelf of reelShelves ) {
      if ( !( shelf instanceof HTMLElement ) ) {
        continue;
      }

      shelf.style.display = "none";
    }
  }
}
