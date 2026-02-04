import type { ISiteStrategy } from "../../core/interfaces/ISiteStrategy";
import { VideoSorter } from "./features/VideoSorter";
import { ShortsHider } from "./features/ShortsHider";
import { PlaylistHider } from "./features/PlaylistHider";

export class YoutubeStrategy implements ISiteStrategy {
  readonly hostname = "youtube.com";

  private readonly videoSorter: VideoSorter;
  private readonly shortsHider: ShortsHider;
  private readonly playlistHider: PlaylistHider;
  private readonly boundNavigationHandler: () => void;

  constructor() {
    this.videoSorter = new VideoSorter();
    this.shortsHider = new ShortsHider();
    this.playlistHider = new PlaylistHider();
    this.boundNavigationHandler = this.handleNavigation.bind( this );
  }

  initialize(): void {
    this.setupNavigationListener();
    this.initializeFeatures();
  }

  cleanup(): void {
    this.removeNavigationListener();
    this.cleanupFeatures();
  }

  private setupNavigationListener(): void {
    window.addEventListener( "yt-navigate-finish", this.boundNavigationHandler );
  }

  private removeNavigationListener(): void {
    window.removeEventListener( "yt-navigate-finish", this.boundNavigationHandler );
  }

  private handleNavigation(): void {
    this.resetFeatures();
  }

  private initializeFeatures(): void {
    this.shortsHider.initialize();
    this.playlistHider.initialize();
    this.videoSorter.initialize();
  }

  private cleanupFeatures(): void {
    this.shortsHider.cleanup();
    this.playlistHider.cleanup();
    this.videoSorter.cleanup();
  }

  private resetFeatures(): void {
    this.shortsHider.reset();
    this.playlistHider.reset();
    this.videoSorter.reset();
  }
}
