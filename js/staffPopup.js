/* Live staff popups only. No data listeners, persistence or track navigation. */
(function (w) {
    'use strict';
    const L = w.L;
    const Popup = L.Popup.extend({
        _updateLayout() {
            const size = this._map.getSize();
            const width = Math.max(40, Math.min(280, size.x - 56));
            this.options.maxWidth = this.options.minWidth = width;
            // Scope an explicit width above the inherited sighting-popup auto width.
            this._contentNode.style.setProperty('--btr-staff-popup-width', width + 'px');
            this.options.maxHeight = Math.max(32, size.y - 64);
            L.Popup.prototype._updateLayout.call(this);
        },
        _updatePosition() {
            L.Popup.prototype._updatePosition.call(this);
            const box = this._container.getBoundingClientRect();
            const view = this._map.getContainer().getBoundingClientRect();
            const dx = Math.max(view.left + 8 - box.left, Math.min(0, view.right - 8 - box.right));
            const dy = Math.max(view.top + 8 - box.top, Math.min(0, view.bottom - 8 - box.bottom));
            this._container.style.left = (parseFloat(this._container.style.left) + dx) + 'px';
            this._container.style.bottom = (parseFloat(this._container.style.bottom) - dy) + 'px';
            this._tipContainer.style.visibility = dx || dy ? 'hidden' : '';
        },
        getEvents() {
            return Object.assign({}, L.Popup.prototype.getEvents.call(this), {
                resize: this.update, moveend: this._updatePosition
            });
        }
    });
    function cancelRefresh(marker) {
        if (marker.__ggStaffPopupFrame != null) w.cancelAnimationFrame(marker.__ggStaffPopupFrame);
        if (marker.__ggStaffPopupTask != null) w.clearTimeout(marker.__ggStaffPopupTask);
        marker.__ggStaffPopupFrame = marker.__ggStaffPopupTask = null;
        marker.__ggStaffPopupRefresh = null;
    }
    function deferRefresh(marker, refresh) {
        marker.__ggStaffPopupRefresh = refresh;
        if (marker.__ggStaffPopupFrame != null || marker.__ggStaffPopupTask != null) return;
        // Two frames give cached HTML a paint opportunity before GIS/cache work.
        marker.__ggStaffPopupFrame = w.requestAnimationFrame(() => {
            marker.__ggStaffPopupFrame = w.requestAnimationFrame(() => {
                marker.__ggStaffPopupFrame = null;
                marker.__ggStaffPopupTask = w.setTimeout(() => {
                    marker.__ggStaffPopupTask = null;
                    const latest = marker.__ggStaffPopupRefresh;
                    marker.__ggStaffPopupRefresh = null;
                    if (marker.isPopupOpen() && latest) latest();
                }, 0);
            });
        });
    }
    w.StaffPopup = {
        create(html) {
            return new Popup({autoPan: false, keepInView: false, autoClose: false,
                closeOnClick: false, className: 'btr-live-staff-popup'}).setContent(html);
        },
        setPosition(marker, lat, lng) {
            const current = marker.getLatLng();
            if (current.lat !== lat || current.lng !== lng) marker.setLatLng([lat, lng]);
        },
        place(marker) {
            const popup = marker.getPopup();
            if (marker.isPopupOpen()) {
                popup._updateLayout();
                popup._updatePosition();
            }
        },
        deferRefresh, cancelRefresh
    };
})(window);
