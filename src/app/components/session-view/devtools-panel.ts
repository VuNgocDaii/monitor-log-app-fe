export interface TelemetryInfo {
  reason?: string;
  timestamp?: number;
  url?: string;
  title?: string;
  locale?: string;
  timezone?: string;
  platform?: string;
  userAgent?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;
}
export interface TelemetryNetworkItem {
  requestId?: string;
  loaderId?: string;
  frameId?: string;
  method?: string;
  url?: string;
  type?: string;
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
  statusCode?: number;
  statusText?: string;
  protocol?: string;
  mimeType?: string;
  fromCache?: boolean;
  fromDiskCache?: boolean;
  fromServiceWorker?: boolean;
  ip?: string;
  remotePort?: number;
  requestHeaders?: Record<string, string>;
  requestHeadersText?: string;
  requestBody?: string;
  requestBodyTruncated?: boolean;
  responseHeaders?: Record<string, string>;
  responseHeadersText?: string;
  responseBody?: string;
  responseBodyBase64?: boolean;
  responseBodyTruncated?: boolean;
  responseBodyError?: string;
  encodedDataLength?: number;
  initiator?: Record<string, unknown>;
  timing?: Record<string, unknown>;
  error?: string;
  canceled?: boolean;
  blockedReason?: string;
}
export interface TabTelemetryData {
  tabId: number;
  openedAt: number;
  info: TelemetryInfo | null;
  console: Array<Record<string, unknown>>;
  actions: Array<Record<string, unknown>>;
  network: TelemetryNetworkItem[];
}
export interface TimelineMarker {
  type: 'video-start' | 'video-stop';
  timestamp: number;
  label: string;
}
type NetworkDetailTab = 'headers' | 'payload' | 'response' | 'preview' | 'timing' | 'initiator';
export function mountDevtoolsPanel(root: HTMLElement, telemetry: TabTelemetryData | null, markers: TimelineMarker[] = []) {
  const state = {
    active: 'network',
    filter: '',
    errorsOnly: false,
    level: 'all',
    networkKind: 'all',
    selectedRequestId: '',
    networkDetailTab: 'headers' as NetworkDetailTab,
    networkDetailHeight: 42
  };
  root.innerHTML = `
    <section class="devtools-panel">
      <div class="devtools-head">
        <strong>DevTools</strong>
        <span class="devtools-head-right">Page telemetry</span>
      </div>

      <nav class="devtools-tabs">
        ${tabButton('info', 'Info')}
        ${tabButton('console', 'Console', telemetry?.console.length || 0)}
        ${tabButton('network', 'Network', telemetry?.network.length || 0)}
        ${tabButton('actions', 'Actions', telemetry?.actions.length || 0)}
        ${tabButton('backend', 'Backend')}
      </nav>

      <div class="devtools-controls" id="devtoolsControls"></div>
      <div class="devtools-content" id="devtoolsContent"></div>
    </section>
  `;
  root.querySelectorAll<HTMLButtonElement>('[data-devtab]').forEach(button => {
    button.addEventListener('click', () => {
      state.active = button.dataset['devtab'] || 'actions';
      root.querySelectorAll('[data-devtab]').forEach(item => {
        item.classList.toggle('active', item === button);
      });
      render();
    });
  });
  render();
  function render() {
    const controls = root.querySelector<HTMLDivElement>('#devtoolsControls')!;
    const content = root.querySelector<HTMLDivElement>('#devtoolsContent')!;
    if (!telemetry) {
      controls.innerHTML = '';
      content.innerHTML = '<div class="dev-empty">No telemetry captured.</div>';
      return;
    }
    if (state.active === 'info') {
      controls.innerHTML = '';
      content.innerHTML = renderInfo(telemetry);
      return;
    }
    if (state.active === 'console') {
      controls.innerHTML = filterBar('All levels');
      bindFilterControls(controls, false, true);
      content.innerHTML = renderConsole(telemetry.console, state.filter, state.level, telemetry.openedAt);
      return;
    }
    if (state.active === 'network') {
      controls.innerHTML = networkControls();
      bindFilterControls(controls, true, false);
      bindNetworkKinds(controls);
      renderNetworkContent();
      return;
    }
    if (state.active === 'actions') {
      controls.innerHTML = `
        <div class="dev-filter-row">
          <span class="search-icon">⌕</span>
          <input
            id="devFilter"
            placeholder="Filter"
            value="${escapeAttr(state.filter)}"
          />
          <select id="devLevel">
            <option value="all">All activity</option>
            <option value="navigation">Page navigations</option>
            <option value="error">Network errors</option>
            <option value="user">User activity</option>
          </select>
        </div>

        <div class="action-chips">
          <button data-action-kind="navigation">🌐 Page navigations</button>
          <button data-action-kind="error">❗ Network errors</button>
          <button data-action-kind="user">⌁ User activity</button>
        </div>
      `;
      bindFilterControls(controls, false, true);
      controls
        .querySelectorAll<HTMLButtonElement>('[data-action-kind]')
        .forEach(button => {
          button.addEventListener('click', () => {
            state.level =
              button.dataset['actionKind'] ||
              'all';
            const select = controls.querySelector<HTMLSelectElement>('#devLevel');
            if (select) {
              select.value = state.level;
            }
            content.innerHTML =
              renderActions(telemetry, markers, state.filter, state.level);
          });
        });
      content.innerHTML =
        renderActions(telemetry, markers, state.filter, state.level);
      return;
    }
    controls.innerHTML = '';
    content.innerHTML = `
      <div class="backend-placeholder">
        <strong>Backend</strong>
        <span>
          Will show upload/create-ticket status after the .NET backend is connected.
        </span>
      </div>
    `;
  }
  function renderNetworkContent() {
    const content = root.querySelector<HTMLDivElement>('#devtoolsContent')!;
    if (!telemetry) {
      return;
    }
    const selected = telemetry.network.find(item => item.requestId ===
      state.selectedRequestId);
    content.innerHTML = `
      <div
        class="
          network-layout
          ${selected ? 'has-detail' : 'list-only'}
        "
        style="
          --network-detail-height:
          ${state.networkDetailHeight}%;
        "
      >
        <div class="network-list-pane">
          ${renderNetworkTable(telemetry.network, state.filter, state.errorsOnly, state.networkKind, state.selectedRequestId)}
        </div>

        ${selected
        ? `
              <div
                class="network-horizontal-splitter"
                id="networkHorizontalSplitter"
                title="Drag to resize"
              >
                <span></span>
              </div>

              <div class="network-detail-pane">
                ${renderNetworkDetails(selected, state.networkDetailTab)}
              </div>
            `
        : ''}
      </div>
    `;
    content
      .querySelectorAll<HTMLTableRowElement>('[data-request-id]')
      .forEach(row => {
        row.addEventListener('click', () => {
          state.selectedRequestId =
            row.dataset['requestId'] ||
            '';
          renderNetworkContent();
        });
      });
    content
      .querySelectorAll<HTMLButtonElement>('[data-network-detail-tab]')
      .forEach(button => {
        button.addEventListener('click', () => {
          state.networkDetailTab =
            (button.dataset[
              'networkDetailTab'] ||
              'headers') as NetworkDetailTab;
          renderNetworkContent();
        });
      });
    const splitter = content.querySelector<HTMLDivElement>('#networkHorizontalSplitter');
    const layout = content.querySelector<HTMLDivElement>('.network-layout');
    if (splitter &&
      layout) {
      initNetworkDetailResize(layout, splitter);
    }
  }
  function initNetworkDetailResize(layout: HTMLDivElement, splitter: HTMLDivElement) {
    let dragging = false;
    splitter.addEventListener('pointerdown', event => {
      dragging = true;
      splitter.classList.add('dragging');
      splitter.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    splitter.addEventListener('pointermove', event => {
      if (!dragging) {
        return;
      }
      const rect = layout.getBoundingClientRect();
      if (rect.height <= 0) {
        return;
      }
      const pointerY = event.clientY -
        rect.top;
      const listPercent = (pointerY /
        rect.height) * 100;
      const detailPercent = 100 -
        listPercent;
      // Keep both areas usable.
      state.networkDetailHeight =
        Math.max(22, Math.min(72, detailPercent));
      layout.style.setProperty('--network-detail-height', `${state.networkDetailHeight}%`);
    });
    const stop = (event: PointerEvent) => {
      if (!dragging) {
        return;
      }
      dragging = false;
      splitter.classList.remove('dragging');
      try {
        splitter.releasePointerCapture(event.pointerId);
      }
      catch {}
    };
    splitter.addEventListener('pointerup', stop);
    splitter.addEventListener('pointercancel', stop);
  }
  function bindFilterControls(controls: HTMLElement, includeErrors: boolean, includeLevel: boolean) {
    const input = controls.querySelector<HTMLInputElement>('#devFilter');
    input?.addEventListener('input', () => {
      state.filter = input.value;
      renderContentOnly();
    });
    if (includeErrors) {
      const checkbox = controls.querySelector<HTMLInputElement>('#errorsOnly');
      checkbox?.addEventListener('change', () => {
        state.errorsOnly =
          checkbox.checked;
        renderContentOnly();
      });
    }
    if (includeLevel) {
      const select = controls.querySelector<HTMLSelectElement>('#devLevel');
      select?.addEventListener('change', () => {
        state.level =
          select.value;
        renderContentOnly();
      });
    }
  }
  function bindNetworkKinds(controls: HTMLElement) {
    controls
      .querySelectorAll<HTMLButtonElement>('[data-network-kind]')
      .forEach(button => {
        button.addEventListener('click', () => {
          state.networkKind =
            button.dataset['networkKind'] ||
            'all';
          controls
            .querySelectorAll('[data-network-kind]')
            .forEach(item => {
              item.classList.toggle('active', item === button);
            });
          renderContentOnly();
        });
      });
  }
  function renderContentOnly() {
    const content = root.querySelector<HTMLDivElement>('#devtoolsContent')!;
    if (!telemetry)
      return;
    if (state.active === 'console') {
      content.innerHTML =
        renderConsole(telemetry.console, state.filter, state.level, telemetry.openedAt);
      return;
    }
    if (state.active === 'network') {
      renderNetworkContent();
      return;
    }
    if (state.active === 'actions') {
      content.innerHTML =
        renderActions(telemetry, markers, state.filter, state.level);
    }
  }
}
function tabButton(key: string, label: string, badge = 0) {
  return `
    <button
      class="devtab ${key === 'actions' ? 'active' : ''}"
      data-devtab="${key}"
    >
      ${label}
      ${badge
      ? `<span>${badge}</span>`
      : ''}
    </button>
  `;
}
function filterBar(rightLabel: string) {
  return `
    <div class="dev-filter-row">
      <span class="search-icon">⌕</span>
      <input id="devFilter" placeholder="Filter" />
      <select id="devLevel">
        <option value="all">${rightLabel}</option>
        <option value="error">Errors</option>
        <option value="warn">Warnings</option>
        <option value="info">Info</option>
        <option value="debug">Debug</option>
        <option value="log">Logs</option>
      </select>
    </div>
  `;
}
function networkControls() {
  return `
    <div class="dev-filter-row">
      <span class="search-icon">⌕</span>
      <input id="devFilter" placeholder="Filter" />

      <label class="errors-only">
        <input
          id="errorsOnly"
          type="checkbox"
        />
        Errors only
      </label>
    </div>

    <div class="network-kinds">
      ${[
      'all',
      'xhr',
      'websocket',
      'script',
      'stylesheet',
      'image',
      'media',
      'font',
      'main_frame',
      'other'
    ]
      .map((kind, index) => `
              <button
                class="${index === 0 ? 'active' : ''}"
                data-network-kind="${kind}"
              >
                ${kindLabel(kind)}
              </button>
            `)
      .join('')}
    </div>
  `;
}
function renderInfo(data: TabTelemetryData) {
  const info = data.info || {};
  return `
    <div class="info-url">
      <span>URL</span>
      <a
        href="${escapeAttr(String(info.url || ''))}"
        target="_blank"
      >
        ${escapeHtml(String(info.url || ''))}
      </a>
    </div>

    <div class="info-grid">
      <span>Timestamp</span>
      <b>${formatDate(Number(info.timestamp || data.openedAt))}</b>

      <span>Timezone</span>
      <b>${escapeHtml(String(info.timezone || ''))}</b>

      <span>Locale</span>
      <b>${escapeHtml(String(info.locale || ''))}</b>

      <span>OS</span>
      <b>${escapeHtml(String(info.platform || ''))}</b>

      <span>Browser</span>
      <b>${escapeHtml(browserLabel(String(info.userAgent || '')))}</b>

      <span>Window size</span>
      <b>
        ${Number(info.viewportWidth || 0)}
        ×
        ${Number(info.viewportHeight || 0)}
      </b>

      <span>Screen size</span>
      <b>
        ${Number(info.screenWidth || 0)}
        ×
        ${Number(info.screenHeight || 0)}
      </b>

      <span>Logs since</span>
      <b>${formatDate(data.openedAt)}</b>
    </div>
  `;
}
function renderConsole(items: Array<Record<string, unknown>>, filter: string, level: string, openedAt: number) {
  const query = filter
    .trim()
    .toLowerCase();
  const rows = items.filter(item => {
    const itemLevel = String(item['level'] || 'log')
      .toLowerCase();
    if (level !== 'all' &&
      itemLevel !== level) {
      return false;
    }
    if (!query) {
      return true;
    }
    return `
        ${item['message'] || ''}
        ${item['url'] || ''}
      `
      .toLowerCase()
      .includes(query);
  });
  if (!rows.length) {
    return `
      <div class="dev-empty console-empty">
        <div class="console-empty-icon">›_</div>
        <strong>No console messages</strong>
        <span>
          Logs captured from the page will appear here.
        </span>
      </div>
    `;
  }
  return `
    <div class="console-list">
      ${rows
      .map((item, index) => {
        const itemLevel = String(item['level'] ||
          'log').toLowerCase();
        const timestamp = Number(item['timestamp'] ||
          openedAt);
        const message = String(item['message'] ||
          '');
        const source = String(item['url'] ||
          '');
        return `
              <div
                class="
                  console-row
                  level-${escapeAttr(itemLevel)}
                "
                data-console-row="${index}"
              >
                <div class="console-gutter">
                  <span class="console-time">
                    ${formatOffset(timestamp - openedAt)}
                  </span>
                </div>

                <div
                  class="
                    console-level-icon
                    icon-${escapeAttr(itemLevel)}
                  "
                  title="${escapeAttr(itemLevel)}"
                >
                  ${consoleLevelIcon(itemLevel)}
                </div>

                <div class="console-entry">
                  <div class="console-entry-top">
                    <span
                      class="
                        console-level-badge
                        badge-${escapeAttr(itemLevel)}
                      "
                    >
                      ${escapeHtml(itemLevel.toUpperCase())}
                    </span>

                    ${source
            ? `
                          <a
                            class="console-source"
                            href="${escapeAttr(source)}"
                            target="_blank"
                            title="${escapeAttr(source)}"
                          >
                            ${escapeHtml(shortConsoleSource(source))}
                          </a>
                        `
            : ''}
                  </div>

                  <pre
                    class="
                      console-message
                      ${isStructuredConsoleMessage(message) ? 'structured' : ''}
                    "
                  >${escapeHtml(formatConsoleMessage(message))}</pre>
                </div>
              </div>
            `;
      })
      .join('')}
    </div>
  `;
}
function consoleLevelIcon(level: string) {
  if (level === 'error') {
    return '×';
  }
  if (level === 'warn' ||
    level === 'warning') {
    return '!';
  }
  if (level === 'debug') {
    return '◆';
  }
  if (level === 'info') {
    return 'i';
  }
  return '›';
}
function shortConsoleSource(value: string) {
  try {
    const url = new URL(value);
    const parts = url.pathname
      .split('/')
      .filter(Boolean);
    const last = parts[parts.length - 1];
    return (last ||
      url.host ||
      value).slice(0, 62);
  }
  catch {
    const parts = value
      .split('/')
      .filter(Boolean);
    return (parts[parts.length - 1] ||
      value).slice(0, 62);
  }
}
function isStructuredConsoleMessage(value: string) {
  const trimmed = value.trim();
  return ((trimmed.startsWith('{') &&
    trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') &&
      trimmed.endsWith(']')));
}
function formatConsoleMessage(value: string) {
  const trimmed = value.trim();
  if (!isStructuredConsoleMessage(trimmed)) {
    return value;
  }
  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  }
  catch {
    return value;
  }
}
function renderNetworkTable(items: TelemetryNetworkItem[], filter: string, errorsOnly: boolean, kind: string, selectedRequestId: string) {
  const query = filter
    .trim()
    .toLowerCase();
  const rows = items.filter(item => {
    const status = Number(item.statusCode ||
      0);
    const isError = Boolean(item.error) ||
      status >= 400;
    if (errorsOnly &&
      !isError) {
      return false;
    }
    if (kind !== 'all' &&
      normalizeNetworkKind(String(item.type ||
        'other')) !== kind) {
      return false;
    }
    if (!query) {
      return true;
    }
    return `
        ${item.url || ''}
        ${item.method || ''}
        ${item.statusCode || ''}
        ${item.mimeType || ''}
      `
      .toLowerCase()
      .includes(query);
  });
  if (!rows.length) {
    return `
      <div class="dev-empty">
        No network requests.
      </div>
    `;
  }
  return `
    <div class="network-table-wrap">
      <table class="network-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Method</th>
            <th>Status</th>
            <th>Domain</th>
            <th>Type</th>
            <th>Size</th>
            <th>Time</th>
            <th>Waterfall</th>
          </tr>
        </thead>

        <tbody>
          ${rows
      .map((item, index) => {
        const url = safeUrl(String(item.url ||
          ''));
        const status = item.error
          ? item.error
          : String(item.statusCode ??
            '');
        const isError = Boolean(item.error) ||
          Number(item.statusCode ||
            0) >= 400;
        const duration = Math.max(0, Number(item.durationMs ||
          0));
        const selected = selectedRequestId &&
          item.requestId ===
          selectedRequestId;
        return `
                    <tr
                      class="
                        ${isError ? 'network-error' : ''}
                        ${selected ? 'network-selected' : ''}
                      "
                      data-request-id="${escapeAttr(String(item.requestId || ''))}"
                    >
                      <td>${index + 1}</td>

                      <td title="${escapeAttr(String(item.url || ''))}">
                        ${escapeHtml(shortName(url.pathname || url.href))}
                      </td>

                      <td>
                        ${escapeHtml(String(item.method || ''))}
                      </td>

                      <td>
                        ${escapeHtml(status)}
                      </td>

                      <td>
                        ${escapeHtml(url.host)}
                      </td>

                      <td>
                        ${escapeHtml(String(item.type || ''))}
                      </td>

                      <td>
                        ${formatBytes(Number(item.encodedDataLength || 0))}
                      </td>

                      <td>
                        ${Math.round(duration)} ms
                      </td>

                      <td>
                        <span
                          class="waterfall"
                          style="--w:${Math.min(100, Math.max(3, duration / 6))}%"
                        ></span>
                      </td>
                    </tr>
                  `;
      })
      .join('')}
        </tbody>
      </table>
    </div>
  `;
}
function renderNetworkDetails(item: TelemetryNetworkItem, activeTab: NetworkDetailTab) {
  const tabs: Array<{
    key: NetworkDetailTab;
    label: string;
  }> = [
      {
        key: 'headers',
        label: 'Headers'
      },
      {
        key: 'payload',
        label: 'Payload'
      },
      {
        key: 'response',
        label: 'Response'
      },
      {
        key: 'preview',
        label: 'Preview'
      },
      {
        key: 'timing',
        label: 'Timing'
      },
      {
        key: 'initiator',
        label: 'Initiator'
      }
    ];
  return `
    <div class="network-detail">
      <div class="network-detail-title">
        <strong>
          ${escapeHtml(String(item.method || 'GET'))}
        </strong>

        <span>
          ${escapeHtml(String(item.url || ''))}
        </span>
      </div>

      <div class="network-detail-tabs">
        ${tabs
      .map(tab => `
              <button
                class="${tab.key === activeTab ? 'active' : ''}"
                data-network-detail-tab="${tab.key}"
              >
                ${tab.label}
              </button>
            `)
      .join('')}
      </div>

      <div class="network-detail-body">
        ${renderNetworkDetailBody(item, activeTab)}
      </div>
    </div>
  `;
}
function renderNetworkDetailBody(item: TelemetryNetworkItem, tab: NetworkDetailTab) {
  if (tab === 'headers') {
    return `
      ${detailSection('General', keyValueRows({
      'Request URL': item.url || '',
      'Request Method': item.method || '',
      'Status Code': `${item.statusCode ?? ''} ${item.statusText || ''}`.trim(),
      'Remote Address': `${item.ip || ''}${item.remotePort
        ? `:${item.remotePort}`
        : ''}`,
      'Referrer Policy': String(item.requestHeaders?.['Referer'] ||
        item.requestHeaders?.['referer'] ||
        '')
    }))}

      ${detailSection('Response Headers', headerRows(item.responseHeaders))}

      ${detailSection('Request Headers', headerRows(item.requestHeaders))}
    `;
  }
  if (tab === 'payload') {
    const payload = item.requestBody ||
      '';
    return payload
      ? codeBlock(prettyMaybeJson(payload))
      : `
        <div class="dev-empty">
          No request payload.
        </div>
      `;
  }
  if (tab === 'response') {
    if (item.responseBodyError) {
      return `
        <div class="network-body-error">
          ${escapeHtml(item.responseBodyError)}
        </div>
      `;
    }
    if (!item.responseBody) {
      return `
        <div class="dev-empty">
          No response body captured.
        </div>
      `;
    }
    return `
      ${item.responseBodyTruncated
        ? `
            <div class="network-body-warning">
              Response truncated to protect extension memory.
            </div>
          `
        : ''}

      ${codeBlock(item.responseBodyBase64
          ? '[Base64 encoded body]\n' + item.responseBody
          : prettyMaybeJson(item.responseBody))}
    `;
  }
  if (tab === 'preview') {
    return renderPreview(item);
  }
  if (tab === 'timing') {
    return `
      ${detailSection('Summary', keyValueRows({
      'Started': formatDate(Number(item.startedAt || 0)),
      'Completed': formatDate(Number(item.completedAt || 0)),
      'Duration': `${Math.round(Number(item.durationMs || 0))} ms`,
      'Encoded size': formatBytes(Number(item.encodedDataLength || 0)),
      'Protocol': item.protocol || '',
      'From disk cache': item.fromDiskCache ? 'Yes' : 'No',
      'From service worker': item.fromServiceWorker ? 'Yes' : 'No'
    }))}

      ${detailSection('CDP Timing', keyValueRows(item.timing ||
      {}))}
    `;
  }
  return detailSection('Initiator', codeBlock(JSON.stringify(item.initiator || {}, null, 2)));
}
function renderPreview(item: TelemetryNetworkItem) {
  const mime = String(item.mimeType ||
    '').toLowerCase();
  const body = item.responseBody ||
    '';
  if (!body) {
    return `
      <div class="dev-empty">
        No preview available.
      </div>
    `;
  }
  if (mime.includes('application/json') ||
    mime.includes('+json') ||
    looksLikeJson(body)) {
    return codeBlock(prettyMaybeJson(body));
  }
  if (mime.startsWith('text/') ||
    mime.includes('javascript') ||
    mime.includes('xml') ||
    mime.includes('html')) {
    return codeBlock(body);
  }
  return `
    <div class="dev-empty">
      Binary preview is not rendered.
      Open Response to inspect captured data.
    </div>
  `;
}
function renderActions(telemetry: TabTelemetryData, markers: TimelineMarker[], filter: string, kind: string) {
  type Row = {
    timestamp: number;
    kind: 'navigation' | 'error' | 'user' | 'video';
    html: string;
  };
  const rows: Row[] = [];
  for (const marker of markers) {
    rows.push({
      timestamp: marker.timestamp,
      kind: 'video',
      html: `
        <span class="action-icon">▣</span>
        <span>${escapeHtml(marker.label)}</span>
      `
    });
  }
  for (const item of telemetry.actions) {
    const eventType = String(item['eventType'] ||
      'ACTION');
    const timestamp = Number(item['timestamp'] ||
      telemetry.openedAt);
    if (eventType === 'NAVIGATION') {
      rows.push({
        timestamp,
        kind: 'navigation',
        html: `
          <span class="action-icon">🌐</span>
          <span>
            Navigated to
            <a
              href="${escapeAttr(String(item['url'] || ''))}"
              target="_blank"
            >
              ${escapeHtml(String(item['url'] || ''))}
            </a>
          </span>
        `
      });
    }
    else {
      const details = eventType === 'CLICK'
        ? `Clicked ${elementSnippet(item)}`
        : `${eventType} ${elementSnippet(item)}`;
      rows.push({
        timestamp,
        kind: 'user',
        html: `
          <span class="action-icon">⌁</span>
          <span>${details}</span>
        `
      });
    }
  }
  for (const item of telemetry.network) {
    const status = Number(item.statusCode ||
      0);
    if (!item.error &&
      status < 400) {
      continue;
    }
    rows.push({
      timestamp: Number(item.startedAt ||
        telemetry.openedAt),
      kind: 'error',
      html: `
        <span class="action-icon">❗</span>
        <span>
          ${escapeHtml(String(item.method || 'GET'))}
          ${escapeHtml(String(item.error || status))}
          <a
            href="${escapeAttr(String(item.url || ''))}"
            target="_blank"
          >
            ${escapeHtml(String(item.url || ''))}
          </a>
        </span>
      `
    });
  }
  rows.sort((a, b) => a.timestamp -
    b.timestamp);
  const query = filter
    .trim()
    .toLowerCase();
  const visible = rows.filter(row => {
    if (kind !== 'all' &&
      row.kind !== kind &&
      !(kind === 'user' &&
        row.kind === 'video')) {
      return false;
    }
    if (!query) {
      return true;
    }
    return stripHtml(row.html)
      .toLowerCase()
      .includes(query);
  });
  if (!visible.length) {
    return `
      <div class="dev-empty">
        No actions.
      </div>
    `;
  }
  return `
    <div class="actions-list">
      ${visible
      .map(row => `
            <div class="action-row action-${row.kind}">
              <span class="action-time">
                ${formatOffset(row.timestamp - telemetry.openedAt)}
              </span>

              ${row.html}
            </div>
          `)
      .join('')}
    </div>
  `;
}
function detailSection(title: string, content: string) {
  return `
    <section class="network-detail-section">
      <h4>${escapeHtml(title)}</h4>
      ${content}
    </section>
  `;
}
function keyValueRows(values: Record<string, unknown>) {
  const entries = Object.entries(values);
  if (!entries.length) {
    return `
      <div class="dev-empty">
        No data.
      </div>
    `;
  }
  return `
    <div class="network-kv">
      ${entries
      .map(([key, value]) => `
              <div class="network-kv-row">
                <b>${escapeHtml(key)}</b>
                <span>${escapeHtml(formatValue(value))}</span>
              </div>
            `)
      .join('')}
    </div>
  `;
}
function headerRows(headers: Record<string, string> | undefined) {
  if (!headers ||
    Object.keys(headers).length === 0) {
    return `
      <div class="dev-empty">
        No headers captured.
      </div>
    `;
  }
  return keyValueRows(headers);
}
function codeBlock(value: string) {
  return `
    <pre class="network-code">${escapeHtml(value)}</pre>
  `;
}
function prettyMaybeJson(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  }
  catch {
    return value;
  }
}
function looksLikeJson(value: string) {
  const trimmed = value.trim();
  return ((trimmed.startsWith('{') &&
    trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') &&
      trimmed.endsWith(']')));
}
function formatValue(value: unknown) {
  if (value == null) {
    return '';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    }
    catch {
      return String(value);
    }
  }
  return String(value);
}
function elementSnippet(item: Record<string, unknown>) {
  const tag = String(item['tag'] ||
    'element').toLowerCase();
  const selector = String(item['selector'] ||
    '');
  const text = String(item['text'] ||
    '').slice(0, 80);
  return `
    <code>
      &lt;${escapeHtml(tag)}
      ${selector
      ? ` ${escapeHtml(selector)}`
      : ''}
      &gt;
      ${text
      ? ` ${escapeHtml(text)}`
      : ''}
    </code>
  `;
}
function formatOffset(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const mm = Math.floor(total / 60)
    .toString()
    .padStart(1, '0');
  const ss = (total % 60)
    .toString()
    .padStart(2, '0');
  return `${mm}:${ss}`;
}
function formatDate(timestamp: number) {
  if (!timestamp) {
    return '';
  }
  return new Date(timestamp).toLocaleString();
}
function browserLabel(ua: string) {
  const chrome = ua.match(/Chrome\/(\d+(?:\.\d+)*)/);
  if (chrome) {
    return `Chrome ${chrome[1]}`;
  }
  if (!ua) {
    return '';
  }
  const firefox = ua.match(/Firefox\/(\d+(?:\.\d+)*)/);
  if (firefox) {
    return `Firefox ${firefox[1]}`;
  }
  const edge = ua.match(/Edg\/(\d+(?:\.\d+)*)/);
  if (edge) {
    return `Edge ${edge[1]}`;
  }
  return ua;
}
function normalizeNetworkKind(type: string) {
  const value = type.toLowerCase();
  if (value === 'xhr' ||
    value === 'fetch' ||
    value === 'xmlhttprequest') {
    return 'xhr';
  }
  if (value === 'websocket') {
    return 'websocket';
  }
  if (value === 'script') {
    return 'script';
  }
  if (value === 'stylesheet') {
    return 'stylesheet';
  }
  if (value === 'image') {
    return 'image';
  }
  if (value === 'media') {
    return 'media';
  }
  if (value === 'font') {
    return 'font';
  }
  if (value === 'document' ||
    value === 'main_frame' ||
    value === 'sub_frame') {
    return 'main_frame';
  }
  return 'other';
}
function kindLabel(kind: string) {
  const labels: Record<string, string> = {
    all: 'All',
    xhr: 'Fetch/XHR',
    websocket: 'WS',
    script: 'JS',
    stylesheet: 'CSS',
    image: 'Img',
    media: 'Media',
    font: 'Font',
    main_frame: 'Doc',
    other: 'Other'
  };
  return labels[kind] || kind;
}
function safeUrl(value: string) {
  try {
    return new URL(value);
  }
  catch {
    return new URL('https://invalid.local/' +
      encodeURIComponent(value));
  }
}
function shortName(path: string) {
  const parts = path
    .split('/')
    .filter(Boolean);
  return (parts[parts.length - 1] ||
    path ||
    '/');
}
function formatBytes(bytes: number) {
  if (!bytes) {
    return '-';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes <
    1024 * 1024) {
    return `${(bytes /
      1024).toFixed(1)} KiB`;
  }
  return `${(bytes /
    1024 /
    1024).toFixed(1)} MiB`;
}
function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ');
}
function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function escapeAttr(value: string) {
  return escapeHtml(value);
}
