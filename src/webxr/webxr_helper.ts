import { WebGLRenderer } from "three";

var currentSession: XRSession | null = null;

var xrSessionIsGranted = false;

/** Start XR session */
export async function startSession(renderer: WebGLRenderer, onStart: () => void, onEnd: () => void) {
    function onSessionEnded() {
        currentSession?.removeEventListener('end', onSessionEnded);
        currentSession = null;
        onEnd();
    }

    if (currentSession === null) {
        if (navigator.xr) {
            const session = await navigator.xr?.requestSession(
                'immersive-vr',
                { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'] }
            );
            session.addEventListener('end', onSessionEnded);
            await renderer.xr.setSession(session);
            onStart();
            currentSession = session;
        }
    } else {
        currentSession.end();
    }
}

if ('xr' in navigator) {
    // WebXRViewer (based on Firefox) has a bug where addEventListener
    // throws a silent exception and aborts execution entirely.
    if (!(/WebXRViewer\//i.test(navigator.userAgent))) {
        navigator.xr?.addEventListener('sessiongranted', () => {
            xrSessionIsGranted = true;
        });    
    }
}
