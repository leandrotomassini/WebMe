import type { SettingsState } from "./SettingsManager";

export class StyleInjector {
  private static readonly STYLE_ID = "webme-youtube-styles";

  // Shorts: sections containing shorts shelves
  private static readonly SHORTS_CSS = `
    ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),
    ytd-reel-shelf-renderer {
      display: none !important;
    }
  `;

  // Playlists/Mixes: items with collection stacks (the stacked thumbnail effect)
  private static readonly PLAYLIST_CSS = `
    ytd-rich-item-renderer:has(.yt-lockup-view-model--collection-stack-2) {
      display: none !important;
    }
  `;

  private styleElement: HTMLStyleElement | null;

  constructor() {
    this.styleElement = null;
  }

  initialize(): void {
    this.createStyleElement();
  }

  cleanup(): void {
    this.removeStyleElement();
  }

  updateStyles( settings: SettingsState ): void {
    if ( this.styleElement === null ) {
      this.createStyleElement();
    }

    const css = this.buildCss( settings );
    this.styleElement!.textContent = css;
  }

  private createStyleElement(): void {
    if ( this.styleElement !== null ) {
      return;
    }

    this.styleElement = document.createElement( "style" );
    this.styleElement.id = StyleInjector.STYLE_ID;
    document.head.appendChild( this.styleElement );
  }

  private removeStyleElement(): void {
    if ( this.styleElement === null ) {
      return;
    }

    this.styleElement.remove();
    this.styleElement = null;
  }

  private buildCss( settings: SettingsState ): string {
    const parts: string[] = [];

    if ( settings.hideShorts ) {
      parts.push( StyleInjector.SHORTS_CSS );
    }

    if ( settings.hidePlaylists ) {
      parts.push( StyleInjector.PLAYLIST_CSS );
    }

    return parts.join( "\n" );
  }
}
