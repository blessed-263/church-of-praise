import { LIVE_CHANNEL, LiveSnapshot } from "./serviceTypes";

export { LIVE_CHANNEL };

export function createLiveBroadcaster() {
  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(LIVE_CHANNEL) : null;
  let projector: Window | null = null;

  const send = (snapshot: LiveSnapshot) => {
    channel?.postMessage(snapshot);
    if (projector && !projector.closed) {
      projector.postMessage({ type: LIVE_CHANNEL, payload: snapshot }, "*");
    }
  };

  return {
    setProjector(win: Window | null) {
      projector = win;
    },
    send,
    close() {
      channel?.close();
    },
  };
}
