import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('gallery-frontend');

  private readonly swUpdate = inject(SwUpdate);

  constructor() {
    if (this.swUpdate.isEnabled) {
      // Fires whenever a new version has finished downloading in the background.
      this.swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') {
          if (confirm('A new version of the app is available. Reload now?')) {
            window.location.reload();
          }
        }
      });

      // By default the service worker only checks for updates once, shortly
      // after the app becomes stable. This forces a fresh check every hour
      // while the app stays open, so a version pushed while someone is
      // mid-session still gets picked up instead of waiting for their next
      // full app launch.
      setInterval(() => {
        this.swUpdate.checkForUpdate().catch((err) => {
          console.error('Update check failed:', err);
        });
      }, UPDATE_CHECK_INTERVAL_MS);
    }
  }
}
