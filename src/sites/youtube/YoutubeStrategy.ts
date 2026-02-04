import type { ISiteStrategy } from "../../core/interfaces/ISiteStrategy";
import { VideoSorter } from "./features/VideoSorter";

export class YoutubeStrategy implements ISiteStrategy {
  readonly hostname = "youtube.com";

  private readonly videoSorter: VideoSorter;
  private readonly boundNavigationHandler: () => void;

  constructor() {
    this.videoSorter = new VideoSorter();
    this.boundNavigationHandler = this.handleNavigation.bind( this );
  }

  initialize(): void {
    this.setupNavigationListener();
    this.videoSorter.initialize();
  }

  cleanup(): void {
    this.removeNavigationListener();
    this.videoSorter.cleanup();
  }

  private setupNavigationListener(): void {
    window.addEventListener( "yt-navigate-finish", this.boundNavigationHandler );
  }

  private removeNavigationListener(): void {
    window.removeEventListener( "yt-navigate-finish", this.boundNavigationHandler );
  }

  private handleNavigation(): void {
    this.videoSorter.reset();
  }
}
