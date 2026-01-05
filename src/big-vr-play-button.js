import videojs from 'video.js';
import window from 'global/window';

const BigPlayButton = videojs.getComponent('BigPlayButton');

/**
 * Big VR play button for entering immersive WebXR mode.
 */
class BigVrPlayButton extends BigPlayButton {
  buildCSSClass() {
    return `vjs-big-vr-play-button ${super.buildCSSClass()}`;
  }

  /**
   * Called when an immersive XR session has started.
   *
   * @param {XRSession} session
   */
  async onSessionStarted(session) {
    videojs.log('[big-vr-play-button] onSessionStarted', session);

    await window.navigator.xr.setSession(session);

    videojs.log('[big-vr-play-button] navigator.xr.setSession complete');

    window.dispatchEvent(new CustomEvent('videojs-vr-session-start', { detail: { session } }));

    videojs.log('[big-vr-play-button] videojs-vr-session-start dispatched');
  }

  handleClick(event) {
    // For iOS we need permission for the device orientation data
    // eslint-disable-next-line
    if (typeof window.DeviceMotionEvent === 'function' &&
        typeof window.DeviceMotionEvent.requestPermission === 'function') {
      window.DeviceMotionEvent.requestPermission().then(response => {
        if (response !== 'granted') {
          this.log('DeviceMotionEvent permissions not set');
        }
      });
    }

    if (window.navigator.xr && window.navigator.xr.requestSession) {
      const sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] };

      videojs.log('Requesting immersive-vr session');

      window.navigator.xr.requestSession('immersive-vr', sessionInit)
        .then((session) => {
          this.onSessionStarted(session);
        })
        .catch(() => {
          videojs.log('immersive-vr session request denied');
        });
    }

    super.handleClick(event);
  }
}

videojs.registerComponent('BigVrPlayButton', BigVrPlayButton);

export default BigVrPlayButton;
