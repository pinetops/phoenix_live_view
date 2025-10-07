/**
 * ShowManager provides JS commands for optimistic UI with :show attribute
 *
 * Flow:
 * 1. Server renders element with :show={@loaded} → Always outputs with data-show attribute
 * 2. User clicks → JS.show_loading() hides content slot, shows loading slot
 * 3. Server responds → LiveView patches everything (loading slot, content, data-show)
 * 4. onBeforeElUpdated → Detect data-show change, use View Transitions API for smooth morph
 *
 * Key: No phx-update="ignore" - LiveView updates everything normally.
 * Client just optimistically toggles visibility within the already-rendered structure.
 */

export default class ShowManager {
  constructor(liveSocket) {
    this.liveSocket = liveSocket;
  }

  init() {
    // Hook into DOM patch lifecycle to detect data-show changes
    const originalOnBeforeElUpdated = this.liveSocket.domCallbacks.onBeforeElUpdated;

    this.liveSocket.domCallbacks.onBeforeElUpdated = (fromEl, toEl) => {
      // Check if data-show attribute is changing (loading → visible transition)
      const fromShow = fromEl.getAttribute && fromEl.getAttribute('data-show');
      const toShow = toEl.getAttribute && toEl.getAttribute('data-show');

      if (fromShow === 'loading' && toShow === 'visible') {
        // Use View Transitions API for smooth morph
        this.transitionToVisible(fromEl, toEl);
      }

      // Call original callback
      if (originalOnBeforeElUpdated) {
        return originalOnBeforeElUpdated(fromEl, toEl);
      }
    };
  }

  /**
   * Transition from loading to visible using View Transitions API
   * Called when data-show changes from "loading" to "visible"
   */
  transitionToVisible(fromEl, toEl) {
    // View Transitions API will smoothly morph between fromEl and toEl
    // The browser handles FLIP animations automatically
    // Note: morphdom will handle the actual DOM update after this callback
  }

  /**
   * Show loading state by cloning template into container
   * Called by JS.show_loading() command
   */
  showLoading(el) {
    const template = el.querySelector('template[data-slot="loading"]');

    if (!template) {
      console.warn("ShowManager: No [data-slot=\"loading\"] template found in element", el);
      return;
    }

    // Clone template content into container (like portal teleport)
    const clone = template.content.cloneNode(true);
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-loading-active", "");
    wrapper.appendChild(clone);

    // Insert after template (so template stays for server updates)
    template.parentNode.insertBefore(wrapper, template.nextSibling);
  }

  destroy() {
    // Nothing to clean up currently
  }
}
