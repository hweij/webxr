import { Object3D, WebGLRenderer } from "three";

var currentSession: XRSession | null = null;

export var xrSessionIsGranted = false;

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

/** Updates position, orientation, and scale of the WebXR controllers. The controllers are passed as 3D objects. */
export function updateControllers(renderer: WebGLRenderer, frame: XRFrame, controllerL: Object3D, controllerR: Object3D) {
    const session = renderer.xr.getSession();
    const ref = renderer.xr.getReferenceSpace();

    if (session && ref) {
        for (const inputSource of session.inputSources) {
            let controller;
            switch (inputSource.handedness) {
                case "right":
                    controller = controllerR;
                    break;
                case "left":
                    controller = controllerL;
                    break;
            }
            if (controller) {
                const t = frame.getPose(inputSource.targetRaySpace, ref);
                const transform = t?.transform;
                if (transform) {
                    controller.matrix.fromArray(transform.matrix);
                    controller.matrix.decompose(controller.position, controller.quaternion, controller.scale);
                }
            }
        }
    }
}