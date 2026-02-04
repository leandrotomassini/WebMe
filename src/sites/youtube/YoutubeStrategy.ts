import type { ISiteStrategy } from "../../core/interfaces/ISiteStrategy";
import { VideoSorter } from "./features/VideoSorter";
import { SettingsManager } from "./settings/SettingsManager";
import { StyleInjector } from "./settings/StyleInjector";
import { SettingsUI } from "./settings/SettingsUI";

export class YoutubeStrategy implements ISiteStrategy {
  readonly hostname = "youtube.com";

  private readonly settingsManager: SettingsManager;
  private readonly styleInjector: StyleInjector;
  private readonly settingsUI: SettingsUI;
  private readonly videoSorter: VideoSorter;
  private readonly boundNavigationHandler: () => void;
  private unsubscribe: ( () => void ) | null;

  constructor() {
    this.settingsManager = new SettingsManager();
    this.styleInjector = new StyleInjector();
    this.settingsUI = new SettingsUI( this.settingsManager );
    this.videoSorter = new VideoSorter();
    this.boundNavigationHandler = this.handleNavigation.bind( this );
    this.unsubscribe = null;
  }

  initialize(): void {
    this.applyInitialSettings();
    this.setupNavigationListener();
    this.setupSettingsListener();
    this.initializeComponents();
  }

  cleanup(): void {
    this.removeNavigationListener();
    this.cleanupComponents();
    if ( this.unsubscribe !== null ) {
      this.unsubscribe();
    }
  }

  private applyInitialSettings(): void {
    const settings = this.settingsManager.getSettings();
    this.styleInjector.initialize();
    this.styleInjector.updateStyles( settings );
    this.videoSorter.setEnabled( settings.sortByDate );
  }

  private setupNavigationListener(): void {
    window.addEventListener( "yt-navigate-finish", this.boundNavigationHandler );
  }

  private removeNavigationListener(): void {
    window.removeEventListener( "yt-navigate-finish", this.boundNavigationHandler );
  }

  private setupSettingsListener(): void {
    this.unsubscribe = this.settingsManager.subscribe( ( settings ) => {
      this.styleInjector.updateStyles( settings );
      this.videoSorter.setEnabled( settings.sortByDate );
    } );
  }

  private handleNavigation(): void {
    this.videoSorter.reset();
    setTimeout( () => {
      this.settingsUI.cleanup();
      this.settingsUI.initialize();
    }, 500 );
  }

  private initializeComponents(): void {
    this.settingsUI.initialize();
    this.videoSorter.initialize();
  }

  private cleanupComponents(): void {
    this.settingsUI.cleanup();
    this.styleInjector.cleanup();
    this.videoSorter.cleanup();
  }
}
