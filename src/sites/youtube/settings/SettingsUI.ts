import type { SettingsState, SettingsManager } from "./SettingsManager";

export class SettingsUI {
  private static readonly BUTTON_ID = "webme-settings-btn";
  private static readonly PANEL_ID = "webme-settings-panel";
  private static readonly END_BUTTONS_SELECTOR = "#end #buttons";

  private readonly settingsManager: SettingsManager;
  private buttonElement: HTMLButtonElement | null;
  private panelElement: HTMLDivElement | null;
  private isOpen: boolean;
  private unsubscribe: ( () => void ) | null;

  constructor( settingsManager: SettingsManager ) {
    this.settingsManager = settingsManager;
    this.buttonElement = null;
    this.panelElement = null;
    this.isOpen = false;
    this.unsubscribe = null;
  }

  initialize(): void {
    this.injectStyles();
    this.createButton();
    this.createPanel();
    this.setupEventListeners();
    this.subscribeToSettings();
  }

  cleanup(): void {
    this.removeEventListeners();
    this.removeElements();
    if ( this.unsubscribe !== null ) {
      this.unsubscribe();
    }
  }

  private injectStyles(): void {
    const existingStyle = document.getElementById( "webme-ui-styles" );
    if ( existingStyle !== null ) {
      return;
    }

    const style = document.createElement( "style" );
    style.id = "webme-ui-styles";
    style.textContent = this.getStyles();
    document.head.appendChild( style );
  }

  private getStyles(): string {
    return `
      #${ SettingsUI.BUTTON_ID } {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
        margin-right: 8px;
        transition: background-color 0.2s ease;
      }

      #${ SettingsUI.BUTTON_ID }:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      #${ SettingsUI.BUTTON_ID } svg {
        width: 24px;
        height: 24px;
        fill: #fff;
      }

      #${ SettingsUI.PANEL_ID } {
        position: fixed;
        top: 56px;
        right: 16px;
        width: 320px;
        background: #282828;
        border-radius: 12px;
        box-shadow: 0 4px 32px rgba(0, 0, 0, 0.4);
        z-index: 9999;
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
        font-family: "Roboto", "Arial", sans-serif;
      }

      #${ SettingsUI.PANEL_ID }.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .webme-panel-header {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .webme-panel-header svg {
        width: 24px;
        height: 24px;
        fill: #ff0000;
        margin-right: 12px;
      }

      .webme-panel-title {
        font-size: 16px;
        font-weight: 500;
        color: #fff;
        margin: 0;
      }

      .webme-panel-subtitle {
        font-size: 12px;
        color: #aaa;
        margin: 4px 0 0 0;
      }

      .webme-panel-content {
        padding: 8px 0;
      }

      .webme-setting-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 20px;
        cursor: pointer;
        transition: background-color 0.15s ease;
      }

      .webme-setting-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .webme-setting-label {
        display: flex;
        flex-direction: column;
      }

      .webme-setting-title {
        font-size: 14px;
        color: #fff;
        margin: 0;
      }

      .webme-setting-desc {
        font-size: 12px;
        color: #aaa;
        margin: 4px 0 0 0;
      }

      .webme-toggle {
        position: relative;
        width: 36px;
        height: 20px;
        background: #606060;
        border-radius: 10px;
        transition: background-color 0.2s ease;
        flex-shrink: 0;
        margin-left: 16px;
      }

      .webme-toggle.active {
        background: #ff0000;
      }

      .webme-toggle::after {
        content: "";
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        background: #fff;
        border-radius: 50%;
        transition: transform 0.2s ease;
      }

      .webme-toggle.active::after {
        transform: translateX(16px);
      }
    `;
  }

  private createButton(): void {
    if ( document.getElementById( SettingsUI.BUTTON_ID ) !== null ) {
      return;
    }

    this.buttonElement = document.createElement( "button" );
    this.buttonElement.id = SettingsUI.BUTTON_ID;
    this.buttonElement.setAttribute( "aria-label", "WebMe Settings" );
    this.buttonElement.innerHTML = this.getButtonIcon();

    this.insertButton();
  }

  private insertButton(): void {
    if ( this.buttonElement === null ) {
      return;
    }

    const endButtons = document.querySelector( SettingsUI.END_BUTTONS_SELECTOR );
    if ( endButtons instanceof HTMLElement ) {
      endButtons.insertBefore( this.buttonElement, endButtons.firstChild );
      return;
    }

    setTimeout( () => this.insertButton(), 500 );
  }

  private getButtonIcon(): string {
    return `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
      </svg>
    `;
  }

  private createPanel(): void {
    if ( document.getElementById( SettingsUI.PANEL_ID ) !== null ) {
      return;
    }

    this.panelElement = document.createElement( "div" );
    this.panelElement.id = SettingsUI.PANEL_ID;
    this.updatePanelContent();
    document.body.appendChild( this.panelElement );
  }

  private updatePanelContent(): void {
    if ( this.panelElement === null ) {
      return;
    }

    const settings = this.settingsManager.getSettings();

    this.panelElement.innerHTML = `
      <div class="webme-panel-header">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <div>
          <h3 class="webme-panel-title">WebMe</h3>
          <p class="webme-panel-subtitle">YouTube Customization</p>
        </div>
      </div>
      <div class="webme-panel-content">
        <div class="webme-setting-item" data-setting="hideShorts">
          <div class="webme-setting-label">
            <p class="webme-setting-title">Ocultar Shorts</p>
            <p class="webme-setting-desc">Elimina todas las secciones de Shorts</p>
          </div>
          <div class="webme-toggle ${ settings.hideShorts ? "active" : "" }"></div>
        </div>
        <div class="webme-setting-item" data-setting="hidePlaylists">
          <div class="webme-setting-label">
            <p class="webme-setting-title">Ocultar Playlists</p>
            <p class="webme-setting-desc">Elimina Mix y listas de reproducción</p>
          </div>
          <div class="webme-toggle ${ settings.hidePlaylists ? "active" : "" }"></div>
        </div>
        <div class="webme-setting-item" data-setting="sortByDate">
          <div class="webme-setting-label">
            <p class="webme-setting-title">Ordenar por fecha</p>
            <p class="webme-setting-desc">Videos más recientes primero</p>
          </div>
          <div class="webme-toggle ${ settings.sortByDate ? "active" : "" }"></div>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    this.buttonElement?.addEventListener( "click", this.handleButtonClick );
    this.panelElement?.addEventListener( "click", this.handlePanelClick );
    document.addEventListener( "click", this.handleOutsideClick );
  }

  private removeEventListeners(): void {
    this.buttonElement?.removeEventListener( "click", this.handleButtonClick );
    this.panelElement?.removeEventListener( "click", this.handlePanelClick );
    document.removeEventListener( "click", this.handleOutsideClick );
  }

  private handleButtonClick = ( event: Event ): void => {
    event.stopPropagation();
    this.togglePanel();
  };

  private handlePanelClick = ( event: Event ): void => {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const settingItem = target.closest( ".webme-setting-item" );

    if ( settingItem instanceof HTMLElement ) {
      const settingKey = settingItem.dataset[ "setting" ];
      if ( this.isValidSettingKey( settingKey ) ) {
        const currentValue = this.settingsManager.getSettings()[ settingKey ];
        this.settingsManager.updateSettings( { [ settingKey ]: !currentValue } );
      }
    }
  };

  private handleOutsideClick = (): void => {
    if ( this.isOpen ) {
      this.closePanel();
    }
  };

  private togglePanel(): void {
    if ( this.isOpen ) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel(): void {
    this.isOpen = true;
    this.panelElement?.classList.add( "open" );
  }

  private closePanel(): void {
    this.isOpen = false;
    this.panelElement?.classList.remove( "open" );
  }

  private subscribeToSettings(): void {
    this.unsubscribe = this.settingsManager.subscribe( () => {
      this.updatePanelContent();
    } );
  }

  private removeElements(): void {
    this.buttonElement?.remove();
    this.panelElement?.remove();
    this.buttonElement = null;
    this.panelElement = null;
  }

  private isValidSettingKey( key: string | undefined ): key is keyof SettingsState {
    return key === "hideShorts" || key === "hidePlaylists" || key === "sortByDate";
  }
}
