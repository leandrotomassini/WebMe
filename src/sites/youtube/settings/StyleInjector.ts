import type { SettingsState } from "./SettingsManager";

export class StyleInjector {
  private static readonly STYLE_ID = "webme-youtube-styles";

  private static readonly SHORTS_CSS = `
    ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),
    ytd-rich-shelf-renderer[is-shorts],
    ytd-reel-shelf-renderer,
    ytd-rich-item-renderer[is-shelf-item] {
      display: none !important;
    }
  `;

  private static readonly PLAYLIST_CSS = `
    ytd-rich-item-renderer:has(ytd-playlist-thumbnail),
    ytd-rich-item-renderer:has([overlay-style="MIX"]),
    ytd-rich-item-renderer:has(a[href*="/playlist"]),
    ytd-rich-item-renderer:has(a[href*="&list="]) {
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
