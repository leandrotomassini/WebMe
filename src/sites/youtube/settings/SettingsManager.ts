export interface SettingsState {
  readonly hideShorts: boolean;
  readonly hidePlaylists: boolean;
  readonly sortByDate: boolean;
}

export class SettingsManager {
  private static readonly STORAGE_KEY = "webme_youtube_settings";
  private static readonly DEFAULT_SETTINGS: SettingsState = {
    hideShorts: true,
    hidePlaylists: true,
    sortByDate: true,
  };

  private currentSettings: SettingsState;
  private readonly listeners: Set<( settings: SettingsState ) => void>;

  constructor() {
    this.currentSettings = this.loadSettings();
    this.listeners = new Set();
  }

  getSettings(): SettingsState {
    return this.currentSettings;
  }

  updateSettings( partial: Partial<SettingsState> ): void {
    this.currentSettings = {
      ...this.currentSettings,
      ...partial,
    };
    this.saveSettings();
    this.notifyListeners();
  }

  subscribe( listener: ( settings: SettingsState ) => void ): () => void {
    this.listeners.add( listener );
    return () => this.listeners.delete( listener );
  }

  private loadSettings(): SettingsState {
    try {
      const stored = localStorage.getItem( SettingsManager.STORAGE_KEY );
      if ( stored === null ) {
        return SettingsManager.DEFAULT_SETTINGS;
      }

      const parsed: unknown = JSON.parse( stored );
      if ( !this.isValidSettings( parsed ) ) {
        return SettingsManager.DEFAULT_SETTINGS;
      }

      return parsed;
    } catch {
      return SettingsManager.DEFAULT_SETTINGS;
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem( SettingsManager.STORAGE_KEY, JSON.stringify( this.currentSettings ) );
    } catch {
      // Silent fail on localStorage errors
    }
  }

  private notifyListeners(): void {
    for ( const listener of this.listeners ) {
      listener( this.currentSettings );
    }
  }

  private isValidSettings( value: unknown ): value is SettingsState {
    if ( typeof value !== "object" || value === null ) {
      return false;
    }

    const obj = value as Record<string, unknown>;
    return (
      typeof obj[ "hideShorts" ] === "boolean" &&
      typeof obj[ "hidePlaylists" ] === "boolean" &&
      typeof obj[ "sortByDate" ] === "boolean"
    );
  }
}
