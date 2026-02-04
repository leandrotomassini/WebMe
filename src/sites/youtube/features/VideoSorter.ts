import { DomObserver } from "../../../utils/dom/DomObserver";

interface SortMenuElements {
  readonly sortButton: HTMLButtonElement;
  readonly menuContainer: Element;
}

type SortOptionText = "Date added (newest)" | "Date added (oldest)";

export class VideoSorter {
  private static readonly SORT_BUTTON_SELECTOR = "yt-sort-filter-sub-menu-renderer yt-dropdown-menu #label";
  private static readonly SORT_MENU_SELECTOR = "yt-sort-filter-sub-menu-renderer tp-yt-paper-listbox";
  private static readonly SORT_OPTION_SELECTOR = "a.yt-simple-endpoint";
  private static readonly TARGET_SORT_OPTION: SortOptionText = "Date added (newest)";
  private static readonly DEBOUNCE_MS = 500;
  private static readonly CLICK_DELAY_MS = 100;

  private domObserver: DomObserver | null;
  private isProcessing: boolean;
  private hasAppliedSort: boolean;

  constructor() {
    this.domObserver = null;
    this.isProcessing = false;
    this.hasAppliedSort = false;
  }

  initialize(): void {
    this.setupObserver();
    this.attemptSort();
  }

  cleanup(): void {
    this.stopObserver();
    this.resetState();
  }

  reset(): void {
    this.hasAppliedSort = false;
    this.attemptSort();
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
    this.hasAppliedSort = false;
  }

  private handleMutation(): void {
    if ( this.hasAppliedSort ) {
      return;
    }
    this.attemptSort();
  }

  private attemptSort(): void {
    if ( this.isProcessing || this.hasAppliedSort ) {
      return;
    }

    if ( !this.isPlaylistOrChannelPage() ) {
      return;
    }

    const sortButton = this.findSortButton();
    if ( sortButton === null ) {
      return;
    }

    this.executeSortSequence( sortButton );
  }

  private isPlaylistOrChannelPage(): boolean {
    const url = window.location.href;
    return url.includes( "/playlist" ) || url.includes( "/@" ) || url.includes( "/channel" );
  }

  private findSortButton(): HTMLButtonElement | null {
    const element = document.querySelector( VideoSorter.SORT_BUTTON_SELECTOR );

    if ( element === null ) {
      return null;
    }

    const button = element.closest( "button" );
    if ( button === null ) {
      return null;
    }

    if ( !( button instanceof HTMLButtonElement ) ) {
      return null;
    }

    return button;
  }

  private executeSortSequence( sortButton: HTMLButtonElement ): void {
    this.isProcessing = true;

    sortButton.click();

    setTimeout( () => {
      this.selectSortOption();
    }, VideoSorter.CLICK_DELAY_MS );
  }

  private selectSortOption(): void {
    const menuElements = this.findMenuElements();
    if ( menuElements === null ) {
      this.isProcessing = false;
      return;
    }

    const targetOption = this.findTargetOption( menuElements.menuContainer );
    if ( targetOption === null ) {
      this.closeMenu( menuElements.sortButton );
      this.isProcessing = false;
      return;
    }

    this.clickOption( targetOption );
    this.hasAppliedSort = true;
    this.isProcessing = false;
  }

  private findMenuElements(): SortMenuElements | null {
    const menuContainer = document.querySelector( VideoSorter.SORT_MENU_SELECTOR );
    if ( menuContainer === null ) {
      return null;
    }

    const sortButton = this.findSortButton();
    if ( sortButton === null ) {
      return null;
    }

    return {
      sortButton,
      menuContainer,
    };
  }

  private findTargetOption( menuContainer: Element ): HTMLAnchorElement | null {
    const options = menuContainer.querySelectorAll( VideoSorter.SORT_OPTION_SELECTOR );

    for ( const option of options ) {
      if ( !( option instanceof HTMLAnchorElement ) ) {
        continue;
      }

      const textContent = option.textContent?.trim();
      if ( textContent === VideoSorter.TARGET_SORT_OPTION ) {
        return option;
      }
    }

    return null;
  }

  private clickOption( option: HTMLAnchorElement ): void {
    option.click();
  }

  private closeMenu( sortButton: HTMLButtonElement ): void {
    sortButton.click();
  }
}
