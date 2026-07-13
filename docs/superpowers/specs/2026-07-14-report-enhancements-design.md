# Report & Dashboard Enhancements — Design

Date: 2026-07-14
App: `ssreports` (Angular frontend)

## Context

Five small, independent enhancements to the reports app, gathered in one batch since each is narrowly scoped. No backend (.NET) changes are required — all five are frontend-only.

## 1. Reports must only open, never force a download

**Current state:** every report dialog calls `GlobalService.genReport(...)`, wraps the PDF response in a `Blob`, and opens it with `window.URL.createObjectURL(blob)` + `window.open(downloadURL, '_blank')`. This opens the PDF in a new browser tab.

The one exception is `ssreports/src/app/reports/customer-ledger/customer-ledger.component.ts` (`generate()`), which is the shared dialog behind **Cash Book, Account Ledger, Customer Ledger, and Supplier Ledger**. It instead builds a hidden `<a>` with a `download` attribute and `.click()`s it, forcing a save-to-disk:

```ts
const a = document.createElement('a');
a.href = downloadURL;
a.download = `report-${this.code.find(c => c.col1 === Icode)?.col2}.pdf`;
a.click();
window.URL.revokeObjectURL(downloadURL);
```

**Change:** replace that block with the same pattern used by every other report:

```ts
const downloadURL = window.URL.createObjectURL(blob);
window.open(downloadURL, '_blank')
```

No other report component needs changes — they already open-only.

## 2. Dashboard "Sale vs Recovery" pie chart: show item values

**Current state:** `dashboard.component.ts` → `saleVsRecovery(x)` builds `sVSr = [{name:'Sale', value:x[0]}, {name:'Recovery', value:x[1]}]`, rendered by `ngx-charts-pie-chart` with `[labels]="false"`. Values are only visible on hover.

**Precedent already in this codebase:** `GlobalService.getTOP10()` bakes the quantity into the label for the "Top 10 Products" gauge chart: `name: ${pname} (${qty})`.

**Change:** apply the same pattern to `saleVsRecovery()`:

```ts
saleVsRecovery(x: any[]){
  const sale = { name: `Sale (${x[0].toLocaleString()})`, value: x[0] };
  const recovery = { name: `Recovery (${x[1].toLocaleString()})`, value: x[1] };
  return this.sVSr = [sale, recovery];
}
```

And set `[labels]="true"` on the `ngx-charts-pie-chart` in `dashboard.component.html`. This shows the formatted amount both on the slice label and in the legend (legend already renders `name`).

## 3. Remove the "Shoes" radio option

**Current state:** `ssreports/src/app/reports/stock-balance/stock-balance.component.html` has one Material/Shoes/WIP/SFG radio group, shared (one dialog, one template) across four inventory report menu entries: Stock Balance, Stock (color wise), Stock Amount, and Trading Stock Balance.

**Change:** delete the one radio button:

```html
<mat-radio-button value="1" class="mr-4">Shoes</mat-radio-button>
```

This removes it from all four reports that use this dialog (confirmed acceptable, including Trading Stock Balance which wasn't explicitly named in the request). No other file references "Shoes"; the `header` value `'1'` simply becomes unreachable from the UI. `Material` (`0`), `WIP` (`2`), and `SFG` (`3`) options are unaffected.

## 4. Ledger reports: default start date = 30 days prior

**Current state:** both of the following default `datefrom` to the 1st of the current month via `new Date(new Date().getFullYear(), new Date().getMonth(), 1)`:
- `customer-ledger.component.ts` — shared dialog for **Cash Book, Account Ledger, Customer Ledger, Supplier Ledger**
- `product-ledger.component.ts` — **Product Ledger**

**Change (both files):** switch to the same "30 days back" pattern already used by `dashboard.component.ts`:

```ts
dateto = new Date();
datefrom = new Date();

constructor(...) {
  ...
  this.datefrom.setDate(this.dateto.getDate() - 30);
}
```

All four ledger-dialog branches (Cash Book included) and Product Ledger get the new default. No other report component is touched — reports like Recovery, PO Status, Periodic Sales, etc. keep their existing 1st-of-month default since they weren't part of this request.

## 5. Dashboard KPI cards: hidden-by-default with click-to-reveal

**Current state:** the 9 KPI cards (`cash`, `bankBalance`, `netCashSale`, `advCreditSale`, `pdcCheques`, `receivable`, `payable`, `dispatch`, `production`) are each wrapped in `*ngIf="config.enabled('dashboard.kpis.<key>')"`, which controls whether the *card* renders at all. That flag is untouched by this change. This item adds a second, orthogonal behavior: whether a rendered card's *value* starts masked.

**Config (`ssreports/src/app-config.json`):** add one global flag as a sibling of `dashboard.kpis` / `dashboard.charts`:

```json
"dashboard": {
  "hiddenByDefault": true,
  "kpis": { ... },
  "charts": { ... }
}
```

Uses the existing `ConfigService.enabled(path)` semantics (true unless explicitly `false`) — no `ConfigService` code change needed. Add a line to the file's `_readme` array documenting it. Default ships as `true` (masked out of the box), matching the request; an installer can flip it to `false` to restore always-visible values.

**Component (`dashboard.component.ts`):** track per-card reveal state client-side (resets on reload/navigation — this is UI state, not a persisted preference):

```ts
revealed: { [key: string]: boolean } = {};

isRevealed(key: string): boolean {
  return key in this.revealed ? this.revealed[key] : !this.config.enabled('dashboard.hiddenByDefault');
}

toggle(key: string): void {
  this.revealed[key] = !this.isRevealed(key);
}
```

**Template (`dashboard.component.html`):** for each of the 9 KPI cards, mask the value when not revealed and add a click target. Example (`cash`):

```html
<mat-card-header>
  <img src="../../assets/cashINhand1.png" alt="Cash in hand">
  <mat-card-title>{{ config.label('dashboard.kpis.cash', 'Cash In Hand') }}</mat-card-title>
  <i class="fa" [ngClass]="isRevealed('cash') ? 'fa-eye-slash' : 'fa-eye'" (click)="toggle('cash')"></i>
</mat-card-header>
<mat-card-content class="cashInHand" (click)="toggle('cash')">
  <ng-container *ngIf="isRevealed('cash'); else hiddenCash">
    {{cash<0? '(' + (cash*-1|number) +')':cash|number}} <small>PKR</small>
  </ng-container>
  <ng-template #hiddenCash>•••••• <small>PKR</small></ng-template>
</mat-card-content>
```

Same pattern repeats for the other 8 cards, each keyed by its own config path segment (`bankBalance`, `netCashSale`, `advCreditSale`, `pdcCheques`, `receivable`, `payable`, `dispatch`, `production`).

**Styling (`dashboard.component.css`):** add `cursor: pointer;` to the existing `mat-card-content{}` rule (scoped to this component; only used by the 9 KPI cards today) and a small margin/size rule for the new `fa-eye`/`fa-eye-slash` icon in the header, consistent with existing icon usage elsewhere in the app (e.g. `fa-power-off`, `fa-caret-down`).

## Out of scope

- No backend/.NET changes.
- No changes to non-ledger reports' default date ranges.
- No persistence of KPI reveal state across page reloads (resets each visit, by design — this mirrors "hidden by default").
- No changes to which reports/KPIs are enabled/visible — items 3 and 5 only touch what's already visible.

## Verification plan

- `ng build` (or `ng serve`) the `ssreports` app and manually exercise each of the 5 changes in the browser:
  1. Open Cash Book / Account Ledger / Customer Ledger / Supplier Ledger and confirm the PDF opens in a new tab instead of downloading.
  2. Open the dashboard and confirm the Sale vs Recovery pie chart shows amounts on the slices and in the legend.
  3. Open Stock Balance, Stock (color wise), Stock Amount, and Trading Stock Balance and confirm "Shoes" is gone from the radio group.
  4. Open each of the 5 ledger-family dialogs and confirm the start date defaults to 30 days before today.
  5. Load the dashboard fresh and confirm all 9 KPI values are masked; click each card/icon and confirm it reveals, click again to re-hide; confirm setting `dashboard.hiddenByDefault: false` in `app-config.json` makes them start revealed.
