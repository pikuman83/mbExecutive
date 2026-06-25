import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * Loads the runtime feature-flag file (/app-config.json) once at startup and
 * answers show/hide questions for the dashboard and the sidebar reports.
 *
 * Semantics (show by default): a value is hidden ONLY when it is explicitly
 * false. A missing key, true, or a failed config load all mean "visible".
 *
 * The file lives at the web root (not under /assets) so the service worker
 * never caches it: edit it on the server and a reload picks up the change.
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigService {

  private config: any = {};

  constructor(private http: HttpClient) {}

  /** Called by APP_INITIALIZER before the app bootstraps. Never rejects. */
  load(): Promise<void> {
    // Cache-busting query + no-store headers so edits show on the next reload.
    const url = `app-config.json?v=${Date.now()}`;
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    return this.http.get(url, { headers })
      .toPromise()
      .then((cfg: any) => { this.config = cfg || {}; })
      .catch(() => { this.config = {}; });   // fail open: everything visible
  }

  /** Resolve a dot-path ("dashboard.kpis.cash") against the loaded config. */
  private lookup(path: string): any {
    return path.split('.').reduce(
      (node, key) => (node == null ? undefined : node[key]),
      this.config
    );
  }

  /** True unless the value at `path` is explicitly false. */
  enabled(path: string): boolean {
    return this.lookup(path) !== false;
  }

  /**
   * Custom display text for a UI element, taken from the "labels" tree
   * (e.g. label('dashboard.kpis.cash', 'Cash In Hand')). Falls back to the
   * built-in text when the label is missing or blank, so clearing a label
   * never blanks the UI. Only affects what is shown, not any report logic.
   */
  label(path: string, fallback: string): string {
    const value = this.lookup('labels.' + path);
    return (typeof value === 'string' && value.trim() !== '') ? value : fallback;
  }

  /**
   * Whether a whole sidebar section should render. Hidden when its `_group`
   * flag is explicitly false, or when every report inside it is set to false.
   */
  groupVisible(groupPath: string): boolean {
    const group = this.lookup(groupPath);
    if (group == null || typeof group !== 'object') {
      return true;                       // section absent from config => show
    }
    if (group._group === false) {
      return false;
    }
    const items = Object.keys(group).filter(key => key !== '_group');
    if (items.length === 0) {
      return true;
    }
    return items.some(key => group[key] !== false);
  }
}
