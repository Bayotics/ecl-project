// One layer at a time (docs/ui-spec.md I5). Header overlays and form dialogs announce themselves when
// they open; every other layer closes in response, so menus, search and dialogs never stack.

const OPENED = "ecl:overlay-opened";
const REQUEST = "ecl:dialog-request";

export type LayerId = "header" | "dialog";

export function announceLayer(id: LayerId) {
  window.dispatchEvent(new CustomEvent<LayerId>(OPENED, { detail: id }));
}

/** Calls `close` whenever a different layer opens. Returns an unsubscribe function. */
export function onOtherLayer(id: LayerId, close: () => void) {
  const handler = (event: Event) => {
    if ((event as CustomEvent<LayerId>).detail !== id) close();
  };
  window.addEventListener(OPENED, handler);
  return () => window.removeEventListener(OPENED, handler);
}

/** Ask the dialog host to open a form dialog. */
export function requestDialog(dialog: "contact" | "newsletter") {
  window.dispatchEvent(new CustomEvent(REQUEST, { detail: dialog }));
}

export function onDialogRequest(handler: (dialog: "contact" | "newsletter") => void) {
  const listener = (event: Event) => handler((event as CustomEvent<"contact" | "newsletter">).detail);
  window.addEventListener(REQUEST, listener);
  return () => window.removeEventListener(REQUEST, listener);
}
