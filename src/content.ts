import { SiteDispatcher } from "./core/dispatcher/SiteDispatcher";
import { YoutubeStrategy } from "./sites/youtube/YoutubeStrategy";

function initializeExtension(): void {
  const dispatcher = SiteDispatcher.getInstance();

  registerStrategies( dispatcher );
  dispatchCurrentSite( dispatcher );
}

function registerStrategies( dispatcher: SiteDispatcher ): void {
  dispatcher.registerStrategy( new YoutubeStrategy() );
}

function dispatchCurrentSite( dispatcher: SiteDispatcher ): void {
  const hostname = window.location.hostname;
  dispatcher.dispatch( hostname );
}

initializeExtension();
