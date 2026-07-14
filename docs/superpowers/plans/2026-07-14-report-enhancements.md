# Report & Dashboard Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship five small, independent frontend fixes to the `ssreports` Angular app: open-only reports, value labels on the Sale vs Recovery chart, removing the "Shoes" stock filter, 30-day ledger date defaults, and hide/reveal dashboard KPI cards.

**Architecture:** Each task is a self-contained edit to one existing Angular component (or, for the last task, one component plus its shared config file). No new components, services, or dependencies are introduced. All changes follow patterns already present elsewhere in this codebase (see each task's rationale).

**Tech Stack:** Angular 11, Angular Material, `@swimlane/ngx-charts` 17, plain JSON runtime config (`src/app-config.json`) read by the existing `ConfigService`.

## Global Constraints

- Frontend-only. Do not touch any `.cs`/`.sql`/`Web.config` file — this plan is scoped to `ssreports/`.
- Follow the existing `window.open(window.URL.createObjectURL(blob), '_blank')` pattern for opening report PDFs (used by every report component except one, which Task 1 fixes).
- Follow the existing `ConfigService.enabled(path)` / `ConfigService.label(path, fallback)` dot-path convention (`ssreports/src/app/config.service.ts`) for any new config-driven behavior. Do not modify `ConfigService` itself — its generic `enabled()` method already supports the new key this plan adds.
- Do not change the default date range of any report other than the ones named in Task 2 and Task 3 (e.g. leave Recovery, PO Status, Periodic Sales, etc. untouched).
- **No automated test suite exists in this project** — `ssreports/src` has zero `*.spec.ts` files despite Karma/Jasmine being installed. Do not add a test framework or new spec files as a side effect of this work; that would be a disproportionate, unrequested change. Verification instead uses (a) `npx ng build --configuration=production` from `ssreports/` as a compile-correctness check (confirmed working in this environment: Angular CLI 11.0.7 runs fine under the installed Node 14.21.3, despite an unrelated shell-startup banner suggesting otherwise) and (b) manual browser verification via `npx ng serve`, matching this project's existing QA practice.
- Manual browser verification requires the .NET backend running locally and reachable at `http://localhost:52305/api` (see `ssreports/src/environments/environment.ts`). If the backend isn't running, still perform the `ng build` check and a visual/DOM read of the rendered dialog (open it, inspect the fields/markup) — you just won't be able to click "Generate" through to a real PDF.
- Each task ends with its own commit — these are independently revertable, user-requested enhancements.

---

### Task 1: Ledger dialog — open PDFs instead of forcing a download

**Files:**
- Modify: `ssreports/src/app/reports/customer-ledger/customer-ledger.component.ts:63-78`

**Interfaces:**
- Consumes: none (self-contained method body change).
- Produces: none (no other task depends on this).

**Context:** This component backs 4 sidebar entries — Cash Book, Account Ledger, Customer Ledger, Supplier Ledger (dispatched from `app.component.ts`'s `ledger()` method). Every other report component in this app opens its generated PDF in a new tab via `window.open`. This is the one exception — it builds a hidden `<a download>` and clicks it, which forces a save-to-disk dialog instead.

- [ ] **Step 1: Read the current file to confirm the exact text to replace**

Open `ssreports/src/app/reports/customer-ledger/customer-ledger.component.ts` and confirm the `generate()` method currently reads:

```ts
  generate(Icode: string){
    if(Icode.trim()) Icode = this.code.some(x => x.col1 === Icode)? Icode:'All';
    else Icode = 'All'
    this.service.genReport("mb", this.withCheck === '1' ? 'CustLgrWdChq' : this.title[1], this.datefrom, this.dateto, Icode, "","","","").subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      const downloadURL = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadURL;
      a.download = `report-${this.code.find(c => c.col1 === Icode)?.col2}.pdf`;
      a.click();

      window.URL.revokeObjectURL(downloadURL);
    });

    this.dialogRef.close();
  }
```

If someone has already edited this file since this plan was written, stop and re-diff against the current content before proceeding — don't blindly apply the patch below.

- [ ] **Step 2: Replace the forced-download block with the standard open-in-new-tab pattern**

```ts
  generate(Icode: string){
    if(Icode.trim()) Icode = this.code.some(x => x.col1 === Icode)? Icode:'All';
    else Icode = 'All'
    this.service.genReport("mb", this.withCheck === '1' ? 'CustLgrWdChq' : this.title[1], this.datefrom, this.dateto, Icode, "","","","").subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      const downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });

    this.dialogRef.close();
  }
```

- [ ] **Step 3: Compile check**

Run from `ssreports/`: `npx ng build --configuration=production`
Expected: `✔ Browser application bundle generation complete.` with no errors (matches the baseline build already confirmed working).

- [ ] **Step 4: Manual verification**

Run `npx ng serve` from `ssreports/`, log in, and for each of: Financial Reports → Cash Book, Financial Reports → Account Ledger, Accounts Receivable → Customer Ledger, Account Payable → Supplier Ledger — pick a date range and account, click Generate, and confirm the PDF opens in a new browser tab instead of triggering a save-file prompt.

- [ ] **Step 5: Commit**

```bash
git add ssreports/src/app/reports/customer-ledger/customer-ledger.component.ts
git commit -m "fix: open ledger reports instead of forcing a download"
```

---

### Task 2: Ledger dialog — default start date 30 days prior

**Files:**
- Modify: `ssreports/src/app/reports/customer-ledger/customer-ledger.component.ts:14-27`

**Interfaces:**
- Consumes: none.
- Produces: none.

**Context:** Same component as Task 1 (Cash Book, Account Ledger, Customer Ledger, Supplier Ledger), different part of the file. Currently `datefrom` defaults to the 1st of the current month. The dashboard (`dashboard.component.ts`) already uses a "30 days back" default via `this.datefrom.setDate(this.dateto.getDate() - 30)` in its constructor — reuse that exact pattern here.

- [ ] **Step 1: Confirm current field/constructor content**

```ts
export class CustomerLedgerComponent implements OnInit {
  code: any[];
  filteredOptions: Observable<string[]>;
  accInput = new FormControl();
  dateto = new Date();
  datefrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  aname='';
  withCheck = '0';
  isCustomerLeger = false;

  constructor(
    private service: GlobalService,
    public dialogRef: MatDialogRef<CustomerLedgerComponent>,
    @Inject(MAT_DIALOG_DATA) public title: string[]) {}
```

(If Task 1 has already been applied to this file, only this block will differ — the `generate()` method below it stays as Task 1 left it.)

- [ ] **Step 2: Change the default and add the 30-day offset in the constructor**

```ts
export class CustomerLedgerComponent implements OnInit {
  code: any[];
  filteredOptions: Observable<string[]>;
  accInput = new FormControl();
  dateto = new Date();
  datefrom = new Date();
  aname='';
  withCheck = '0';
  isCustomerLeger = false;

  constructor(
    private service: GlobalService,
    public dialogRef: MatDialogRef<CustomerLedgerComponent>,
    @Inject(MAT_DIALOG_DATA) public title: string[]) {
    this.datefrom.setDate(this.dateto.getDate() - 30);
  }
```

- [ ] **Step 3: Compile check**

Run from `ssreports/`: `npx ng build --configuration=production`
Expected: success, no errors.

- [ ] **Step 4: Manual verification**

`npx ng serve`, open each of Cash Book, Account Ledger, Customer Ledger, Supplier Ledger. Confirm the "Start date" field is pre-filled with today's date minus 30 days (not the 1st of the current month).

- [ ] **Step 5: Commit**

```bash
git add ssreports/src/app/reports/customer-ledger/customer-ledger.component.ts
git commit -m "feat: default ledger reports to a 30-day start date"
```

---

### Task 3: Product Ledger — default start date 30 days prior

**Files:**
- Modify: `ssreports/src/app/reports/product-ledger/product-ledger.component.ts:13-25`

**Interfaces:**
- Consumes: none.
- Produces: none.

**Context:** Same "1st of current month" default as Task 2's component, in a separate report (Inventory Reports → Product Ledger). Same fix, same pattern.

- [ ] **Step 1: Confirm current content**

```ts
export class ProductLedgerComponent implements OnInit {
  dateto = new Date();
  datefrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  products: any[]; //return 2 columns col1(pcode) & col2(pname)
  locations: string[];
  filteredOptions: Observable<string[]>;
  accInput = new FormControl();
  aname='';

  constructor(
    private service: GlobalService,
    public dialogRef: MatDialogRef<ProductLedgerComponent>,
    @Inject(MAT_DIALOG_DATA) public title: string) {}
```

- [ ] **Step 2: Change the default and add the 30-day offset in the constructor**

```ts
export class ProductLedgerComponent implements OnInit {
  dateto = new Date();
  datefrom = new Date();
  products: any[]; //return 2 columns col1(pcode) & col2(pname)
  locations: string[];
  filteredOptions: Observable<string[]>;
  accInput = new FormControl();
  aname='';

  constructor(
    private service: GlobalService,
    public dialogRef: MatDialogRef<ProductLedgerComponent>,
    @Inject(MAT_DIALOG_DATA) public title: string) {
    this.datefrom.setDate(this.dateto.getDate() - 30);
  }
```

- [ ] **Step 3: Compile check**

Run from `ssreports/`: `npx ng build --configuration=production`
Expected: success, no errors.

- [ ] **Step 4: Manual verification**

`npx ng serve`, open Inventory Reports → Product Ledger. Confirm "Start date" defaults to today minus 30 days.

- [ ] **Step 5: Commit**

```bash
git add ssreports/src/app/reports/product-ledger/product-ledger.component.ts
git commit -m "feat: default product ledger to a 30-day start date"
```

---

### Task 4: Remove the "Shoes" stock-category option

**Files:**
- Modify: `ssreports/src/app/reports/stock-balance/stock-balance.component.html:5-11`

**Interfaces:**
- Consumes: none.
- Produces: none.

**Context:** This one dialog/template is shared by 4 sidebar entries under Inventory Reports: Stock Balance, Stock (color wise), Stock Amount, and Trading Stock Balance (`app.component.html` lines 82-89, all calling `stockBalance(title)` with different `title` strings, all opening `StockBalanceComponent`). Removing this radio button removes "Shoes" from all four.

- [ ] **Step 1: Confirm current radio group content**

```html
            <mat-radio-group aria-label="Select an option" [(ngModel)]="header">
            <mat-radio-button value="All" class="mr-4" [checked]="true">All</mat-radio-button>
            <mat-radio-button value="0" class="mr-4">Material</mat-radio-button>
            <mat-radio-button value="1" class="mr-4">Shoes</mat-radio-button>
            <mat-radio-button value="2" class="mr-4">WIP</mat-radio-button>
            <mat-radio-button value="3">SFG</mat-radio-button>
            </mat-radio-group>
```

- [ ] **Step 2: Delete the Shoes radio button line**

```html
            <mat-radio-group aria-label="Select an option" [(ngModel)]="header">
            <mat-radio-button value="All" class="mr-4" [checked]="true">All</mat-radio-button>
            <mat-radio-button value="0" class="mr-4">Material</mat-radio-button>
            <mat-radio-button value="2" class="mr-4">WIP</mat-radio-button>
            <mat-radio-button value="3">SFG</mat-radio-button>
            </mat-radio-group>
```

- [ ] **Step 3: Compile check**

Run from `ssreports/`: `npx ng build --configuration=production`
Expected: success, no errors.

- [ ] **Step 4: Manual verification**

`npx ng serve`, open each of Stock Balance, Stock (color wise), Stock Amount, and Trading Stock Balance (Inventory Reports menu). Confirm the radio group shows only All / Material / WIP / SFG.

- [ ] **Step 5: Commit**

```bash
git add ssreports/src/app/reports/stock-balance/stock-balance.component.html
git commit -m "fix: remove Shoes stock-category option"
```

---

### Task 5: Dashboard "Sale vs Recovery" pie chart — show item values

**Files:**
- Modify: `ssreports/src/app/dashboard/dashboard.component.ts:53-63`
- Modify: `ssreports/src/app/dashboard/dashboard.component.html:183-198`

**Interfaces:**
- Consumes: none.
- Produces: none.

**Context:** `sVSr` currently gets `{name: 'Sale', value}`/`{name: 'Recovery', value}`, rendered by `ngx-charts-pie-chart` with `[labels]="false"` — no value is visible without hovering. `GlobalService.getTOP10()` (`ssreports/src/app/global.service.ts`) already bakes a value into a chart label the same way this task will (`name: \`${pname} (${qty})\``), for the "Top 10 Products" gauge — follow that existing precedent.

- [ ] **Step 1: Confirm current `saleVsRecovery` method**

```ts
  saleVsRecovery(x: any[]){
    const sale = {
      name: "Sale",
      value: x[0]
    }
    const recovery = {
      name: "Recovery",
      value: x[1]
    }
    return this.sVSr = [sale, recovery];
  }
```

- [ ] **Step 2: Bake the formatted value into each slice's name**

```ts
  saleVsRecovery(x: any[]){
    const sale = {
      name: `Sale (${x[0].toLocaleString()})`,
      value: x[0]
    }
    const recovery = {
      name: `Recovery (${x[1].toLocaleString()})`,
      value: x[1]
    }
    return this.sVSr = [sale, recovery];
  }
```

- [ ] **Step 3: Confirm current pie chart template block**

```html
    <mat-card *ngIf="config.enabled('dashboard.charts.salesVsRecovery')">
      <mat-card-header>
        <mat-card-title>{{ config.label('dashboard.charts.salesVsRecovery', 'Sales Vs Recovery') }}</mat-card-title>
      </mat-card-header>
      <ngx-charts-pie-chart class="d-flex justify-content-around"
        [view]="view"
        [scheme]="'nightLights'"
        [results]="sVSr"
        [gradient]="gradient"
        [explodeSlices]="true"
        [labels]="false"
        [legend]="true"
        [legendTitle]="'Amounts'"
        [legendPosition]="'below'">
      </ngx-charts-pie-chart>
    </mat-card>
```

- [ ] **Step 4: Turn on slice labels**

```html
    <mat-card *ngIf="config.enabled('dashboard.charts.salesVsRecovery')">
      <mat-card-header>
        <mat-card-title>{{ config.label('dashboard.charts.salesVsRecovery', 'Sales Vs Recovery') }}</mat-card-title>
      </mat-card-header>
      <ngx-charts-pie-chart class="d-flex justify-content-around"
        [view]="view"
        [scheme]="'nightLights'"
        [results]="sVSr"
        [gradient]="gradient"
        [explodeSlices]="true"
        [labels]="true"
        [legend]="true"
        [legendTitle]="'Amounts'"
        [legendPosition]="'below'">
      </ngx-charts-pie-chart>
    </mat-card>
```

- [ ] **Step 5: Compile check**

Run from `ssreports/`: `npx ng build --configuration=production`
Expected: success, no errors.

- [ ] **Step 6: Manual verification**

`npx ng serve`, load the dashboard. Confirm the "Sales Vs Recovery" pie chart shows the formatted amount both as a label pointing at each slice (e.g. "Sale (1,234,567)") and in the legend below it.

- [ ] **Step 7: Commit**

```bash
git add ssreports/src/app/dashboard/dashboard.component.ts ssreports/src/app/dashboard/dashboard.component.html
git commit -m "feat: show sale/recovery amounts on the dashboard pie chart"
```

---

### Task 6: Dashboard KPI cards — hidden-by-default with click-to-reveal

**Files:**
- Modify: `ssreports/src/app-config.json`
- Modify: `ssreports/src/app/dashboard/dashboard.component.ts:38-65`
- Modify: `ssreports/src/app/dashboard/dashboard.component.html:17-125`
- Modify: `ssreports/src/app/dashboard/dashboard.component.css:11-30`

**Interfaces:**
- Consumes: `ConfigService.enabled(path: string): boolean` (existing, `ssreports/src/app/config.service.ts` — already injected into `DashboardComponent` as `public config`). True unless the value at `path` is explicitly `false`.
- Produces: `DashboardComponent.isRevealed(key: string): boolean` and `DashboardComponent.toggle(key: string): void`, used by all 9 KPI card blocks in the template within this same task.

**Context:** The 9 KPI cards (`cash`, `bankBalance`, `netCashSale`, `advCreditSale`, `pdcCheques`, `receivable`, `payable`, `dispatch`, `production`) are each already gated by `*ngIf="config.enabled('dashboard.kpis.<key>')"`, which controls whether the *card* renders. This task adds an orthogonal, second behavior — whether a rendered card's *value* starts masked — driven by one new global config flag. This is UI-only session state (not persisted), so it intentionally resets on reload.

This must land as one task: a config flag with no reader is inert, and component logic with no template hookup isn't observable — none of the three pieces is independently testable in isolation.

- [ ] **Step 1: Add the config flag to `app-config.json`**

Confirm current `dashboard` section and `_readme`:

```json
  "_readme": [
    "Controls the frontend per install. Two independent sections:",
    "1) Visibility flags below (dashboard, reports): set a value to false to HIDE it.",
    "   A missing key or true means VISIBLE (show by default).",
    "   Setting a report section's _group to false hides that whole sidebar section;",
    "   a section is also hidden automatically when every report inside it is false.",
    "2) labels: rename anything shown on screen. Edit the text on the right of each key.",
    "   A report section header is labels.reports.<section>._title.",
    "   Clearing or removing a label restores the built-in default text.",
    "Edit this file on the server, then reload the app (Ctrl+F5) to apply. No rebuild needed."
  ],
  "dashboard": {
    "kpis": {
```

Replace with:

```json
  "_readme": [
    "Controls the frontend per install. Two independent sections:",
    "1) Visibility flags below (dashboard, reports): set a value to false to HIDE it.",
    "   A missing key or true means VISIBLE (show by default).",
    "   Setting a report section's _group to false hides that whole sidebar section;",
    "   a section is also hidden automatically when every report inside it is false.",
    "   dashboard.hiddenByDefault: true masks all KPI card values until clicked;",
    "   set to false to show KPI values immediately on load.",
    "2) labels: rename anything shown on screen. Edit the text on the right of each key.",
    "   A report section header is labels.reports.<section>._title.",
    "   Clearing or removing a label restores the built-in default text.",
    "Edit this file on the server, then reload the app (Ctrl+F5) to apply. No rebuild needed."
  ],
  "dashboard": {
    "hiddenByDefault": true,
    "kpis": {
```

(Everything else in the file — `kpis` body, `charts`, `reports`, `labels` — is unchanged.)

- [ ] **Step 2: Add reveal-state tracking to `dashboard.component.ts`**

Confirm current fields around `refresh`:

```ts
  cashSale: number | null = null;
  creditSale: number | null = null;
  cheques: number | null = null;
  refresh: boolean = false;
```

Add a `revealed` map:

```ts
  cashSale: number | null = null;
  creditSale: number | null = null;
  cheques: number | null = null;
  refresh: boolean = false;
  revealed: { [key: string]: boolean } = {};
```

Confirm current `showButton`:

```ts
  showButton = (): boolean => this.refresh = !!(this.datefrom && this.dateto);
```

Add `isRevealed` and `toggle` right after it:

```ts
  showButton = (): boolean => this.refresh = !!(this.datefrom && this.dateto);

  isRevealed(key: string): boolean {
    return key in this.revealed ? this.revealed[key] : !this.config.enabled('dashboard.hiddenByDefault');
  }

  toggle(key: string): void {
    this.revealed[key] = !this.isRevealed(key);
  }
```

- [ ] **Step 3: Update the first KPI column in `dashboard.component.html`**

Confirm current block (cash, bankBalance, netCashSale, advCreditSale, pdcCheques):

```html
  <div class="d-md-flex justify-content-around mb-2 align-items-center">
    <div class="d-flex flex-column flex-shrink-1">
      <mat-card *ngIf="config.enabled('dashboard.kpis.cash')">
        <mat-card-header>
          <img src="../../assets/cashINhand1.png" alt="Cash in hand">
          <mat-card-title>{{ config.label('dashboard.kpis.cash', 'Cash In Hand') }}</mat-card-title>
        </mat-card-header>
        <mat-card-content class="cashInHand">
          {{cash<0? '(' + (cash*-1|number) +')':cash|number}} <small>PKR</small>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="config.enabled('dashboard.kpis.bankBalance')">
        <mat-card-header>
          <img src="../../assets/bank1.png" alt="bank">
          <mat-card-title>{{ config.label('dashboard.kpis.bankBalance', 'Bank Balance') }}</mat-card-title>
        </mat-card-header>
        <mat-card-content class="bankBalance">
          {{bbalance<0? '(' + (bbalance*-1|number) +')':bbalance|number}} <small>PKR</small>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="config.enabled('dashboard.kpis.netCashSale')">
        <mat-card-header>
          <img src="../../assets/cash-register.png" alt="Cash register">
          <mat-card-title>{{ config.label('dashboard.kpis.netCashSale', 'Net Cash Sale') }}</mat-card-title>
        </mat-card-header>
        <mat-card-content class="cash-regiter">
          {{cashSale<0? '(' + (cashSale*-1|number) +')':cashSale|number}} <small>PKR</small>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="config.enabled('dashboard.kpis.advCreditSale')">
        <mat-card-header>
          <img src="../../assets/personal.png" alt="Cash in hand">
          <mat-card-title>{{ config.label('dashboard.kpis.advCreditSale', 'Adv Cr Sale') }}</mat-card-title>
        </mat-card-header>
        <mat-card-content class="credit-sale">
          {{creditSale<0? '(' + (creditSale*-1|number) +')':creditSale|number}} <small>PKR</small>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="config.enabled('dashboard.kpis.pdcCheques')">
        <mat-card-header>
          <img src="../../assets/cheque.png" alt="Cheque">
          <mat-card-title>{{ config.label('dashboard.kpis.pdcCheques', 'Overall PDC Cheques') }}</mat-card-title>
        </mat-card-header>
        <mat-card-content class="cheque-border">
          {{cheques<0? '(' + (cheques*-1|number) +')':cheques|number}} <small>PKR</small>
        </mat-card-content>
      </mat-card>
    </div>
```

Replace with:

```html
  <div class="d-md-flex justify-content-around mb-2 align-items-center">
    <div class="d-flex flex-column flex-shrink-1">
      <mat-card *ngIf="config.enabled('dashboard.kpis.cash')">
        <mat-card-header>
          <img src="../../assets/cashINhand1.png" alt="Cash in hand">
          <mat-card-title>{{ config.label('dashboard.kpis.cash', 'Cash In Hand') }}</mat-card-title>
          <i class="fa" [ngClass]="isRevealed('cash') ? 'fa-eye-slash' : 'fa-eye'" (click)="toggle('cash')"></i>
        </mat-card-header>
        <mat-card-content class="cashInHand" (click)="toggle('cash')">
          <ng-container *ngIf="isRevealed('cash'); else hiddenCash">
            {{cash<0? '(' + (cash*-1|number) +')':cash|number}} <small>PKR</small>
          </ng-container>
          <ng-template #hiddenCash>&bull;&bull;&bull;&bull;&bull;&bull; <small>PKR</small></ng-template>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="config.enabled('dashboard.kpis.bankBalance')">
        <mat-card-header>
          <img src="../../assets/bank1.png" alt="bank">
          <mat-card-title>{{ config.label('dashboard.kpis.bankBalance', 'Bank Balance') }}</mat-card-title>
          <i class="fa" [ngClass]="isRevealed('bankBalance') ? 'fa-eye-slash' : 'fa-eye'" (click)="toggle('bankBalance')"></i>
        </mat-card-header>
        <mat-card-content class="bankBalance" (click)="toggle('bankBalance')">
          <ng-container *ngIf="isRevealed('bankBalance'); else hiddenBankBalance">
            {{bbalance<0? '(' + (bbalance*-1|number) +')':bbalance|number}} <small>PKR</small>
          </ng-container>
          <ng-template #hiddenBankBalance>&bull;&bull;&bull;&bull;&bull;&bull; <small>PKR</small></ng-template>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="config.enabled('dashboard.kpis.netCashSale')">
        <mat-card-header>
          <img src="../../assets/cash-register.png" alt="Cash register">
          <mat-card-title>{{ config.label('dashboard.kpis.netCashSale', 'Net Cash Sale') }}</mat-card-title>
          <i class="fa" [ngClass]="isRevealed('netCashSale') ? 'fa-eye-slash' : 'fa-eye'" (click)="toggle('netCashSale')"></i>
        </mat-card-header>
        <mat-card-content class="cash-regiter" (click)="toggle('netCashSale')">
          <ng-container *ngIf="isRevealed('netCashSale'); else hiddenNetCashSale">
            {{cashSale<0? '(' + (cashSale*-1|number) +')':cashSale|number}} <small>PKR</small>
          </ng-container>
          <ng-template #hiddenNetCashSale>&bull;&bull;&bull;&bull;&bull;&bull; <small>PKR</small></ng-template>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="config.enabled('dashboard.kpis.advCreditSale')">
        <mat-card-header>
          <img src="../../assets/personal.png" alt="Cash in hand">
          <mat-card-title>{{ config.label('dashboard.kpis.advCreditSale', 'Adv Cr Sale') }}</mat-card-title>
          <i class="fa" [ngClass]="isRevealed('advCreditSale') ? 'fa-eye-slash' : 'fa-eye'" (click)="toggle('advCreditSale')"></i>
        </mat-card-header>
        <mat-card-content class="credit-sale" (click)="toggle('advCreditSale')">
          <ng-container *ngIf="isRevealed('advCreditSale'); else hiddenAdvCreditSale">
            {{creditSale<0? '(' + (creditSale*-1|number) +')':creditSale|number}} <small>PKR</small>
          </ng-container>
          <ng-template #hiddenAdvCreditSale>&bull;&bull;&bull;&bull;&bull;&bull; <small>PKR</small></ng-template>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="config.enabled('dashboard.kpis.pdcCheques')">
        <mat-card-header>
          <img src="../../assets/cheque.png" alt="Cheque">
          <mat-card-title>{{ config.label('dashboard.kpis.pdcCheques', 'Overall PDC Cheques') }}</mat-card-title>
          <i class="fa" [ngClass]="isRevealed('pdcCheques') ? 'fa-eye-slash' : 'fa-eye'" (click)="toggle('pdcCheques')"></i>
        </mat-card-header>
        <mat-card-content class="cheque-border" (click)="toggle('pdcCheques')">
          <ng-container *ngIf="isRevealed('pdcCheques'); else hiddenPdcCheques">
            {{cheques<0? '(' + (cheques*-1|number) +')':cheques|number}} <small>PKR</small>
          </ng-container>
          <ng-template #hiddenPdcCheques>&bull;&bull;&bull;&bull;&bull;&bull; <small>PKR</small></ng-template>
        </mat-card-content>
      </mat-card>
    </div>
```

- [ ] **Step 4: Update the second KPI column in `dashboard.component.html`**

Confirm current block (receivable, payable, dispatch, production):

```html
    <div class="d-flex flex-column flex-shrink-1">
      <mat-card *ngIf="config.enabled('dashboard.kpis.receivable')">
        <mat-card-header>
          <img src="../../assets/receivable1.png" alt="Total Receivable">
          <mat-card-title>{{ config.label('dashboard.kpis.receivable', 'Receivable') }}</mat-card-title>
        </mat-card-header>
        <mat-card-content class="totalReceivale">
          {{receivable<0? '(' + (receivable*-1|number) +')':receivable|number}} <small>PKR</small>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="config.enabled('dashboard.kpis.payable')">
        <mat-card-header>
          <img src="../../assets/payable1.png" alt="Total payable">
          <mat-card-title>{{ config.label('dashboard.kpis.payable', 'Payable') }}</mat-card-title>
        </mat-card-header>
        <mat-card-content class="totalPayable">
          {{payable<0? '(' + (payable*-1|number) +')':payable|number}} <small>PKR</small>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="config.enabled('dashboard.kpis.dispatch')">
        <mat-card-header>
          <img src="../../assets/sale.png" alt="bank">
          <mat-card-title>{{ config.label('dashboard.kpis.dispatch', 'Dispatch') }}</mat-card-title>
        </mat-card-header>
        <mat-card-content class="dispatch">
          {{totalDisp <0? '(' + (totalDisp*-1|number) +')':totalDisp|number}} <small>DZN</small>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="config.enabled('dashboard.kpis.production')">
        <mat-card-header>
          <img src="../../assets/product.png" alt="Production">
          <mat-card-title>{{ config.label('dashboard.kpis.production', 'Production') }}</mat-card-title>
        </mat-card-header>
        <mat-card-content class="prod">
          {{totalProd<0? '(' + (totalProd*-1|number) +')':totalProd|number}} <small>DZN</small>
        </mat-card-content>
      </mat-card>
    </div>
  </div>
```

Replace with:

```html
    <div class="d-flex flex-column flex-shrink-1">
      <mat-card *ngIf="config.enabled('dashboard.kpis.receivable')">
        <mat-card-header>
          <img src="../../assets/receivable1.png" alt="Total Receivable">
          <mat-card-title>{{ config.label('dashboard.kpis.receivable', 'Receivable') }}</mat-card-title>
          <i class="fa" [ngClass]="isRevealed('receivable') ? 'fa-eye-slash' : 'fa-eye'" (click)="toggle('receivable')"></i>
        </mat-card-header>
        <mat-card-content class="totalReceivale" (click)="toggle('receivable')">
          <ng-container *ngIf="isRevealed('receivable'); else hiddenReceivable">
            {{receivable<0? '(' + (receivable*-1|number) +')':receivable|number}} <small>PKR</small>
          </ng-container>
          <ng-template #hiddenReceivable>&bull;&bull;&bull;&bull;&bull;&bull; <small>PKR</small></ng-template>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="config.enabled('dashboard.kpis.payable')">
        <mat-card-header>
          <img src="../../assets/payable1.png" alt="Total payable">
          <mat-card-title>{{ config.label('dashboard.kpis.payable', 'Payable') }}</mat-card-title>
          <i class="fa" [ngClass]="isRevealed('payable') ? 'fa-eye-slash' : 'fa-eye'" (click)="toggle('payable')"></i>
        </mat-card-header>
        <mat-card-content class="totalPayable" (click)="toggle('payable')">
          <ng-container *ngIf="isRevealed('payable'); else hiddenPayable">
            {{payable<0? '(' + (payable*-1|number) +')':payable|number}} <small>PKR</small>
          </ng-container>
          <ng-template #hiddenPayable>&bull;&bull;&bull;&bull;&bull;&bull; <small>PKR</small></ng-template>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="config.enabled('dashboard.kpis.dispatch')">
        <mat-card-header>
          <img src="../../assets/sale.png" alt="bank">
          <mat-card-title>{{ config.label('dashboard.kpis.dispatch', 'Dispatch') }}</mat-card-title>
          <i class="fa" [ngClass]="isRevealed('dispatch') ? 'fa-eye-slash' : 'fa-eye'" (click)="toggle('dispatch')"></i>
        </mat-card-header>
        <mat-card-content class="dispatch" (click)="toggle('dispatch')">
          <ng-container *ngIf="isRevealed('dispatch'); else hiddenDispatch">
            {{totalDisp <0? '(' + (totalDisp*-1|number) +')':totalDisp|number}} <small>DZN</small>
          </ng-container>
          <ng-template #hiddenDispatch>&bull;&bull;&bull;&bull;&bull;&bull; <small>DZN</small></ng-template>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="config.enabled('dashboard.kpis.production')">
        <mat-card-header>
          <img src="../../assets/product.png" alt="Production">
          <mat-card-title>{{ config.label('dashboard.kpis.production', 'Production') }}</mat-card-title>
          <i class="fa" [ngClass]="isRevealed('production') ? 'fa-eye-slash' : 'fa-eye'" (click)="toggle('production')"></i>
        </mat-card-header>
        <mat-card-content class="prod" (click)="toggle('production')">
          <ng-container *ngIf="isRevealed('production'); else hiddenProduction">
            {{totalProd<0? '(' + (totalProd*-1|number) +')':totalProd|number}} <small>DZN</small>
          </ng-container>
          <ng-template #hiddenProduction>&bull;&bull;&bull;&bull;&bull;&bull; <small>DZN</small></ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  </div>
```

- [ ] **Step 5: Add pointer cursor and icon styling in `dashboard.component.css`**

Confirm current rules:

```css
mat-card-content{
  margin-top: 20px;
  margin-bottom: 5px;
  font-size: 1.7rem;
  font-weight: bold;
  padding-left: 10px;
}
```

```css
mat-card-header{
  justify-content: space-between;
}
```

Replace with:

```css
mat-card-content{
  margin-top: 20px;
  margin-bottom: 5px;
  font-size: 1.7rem;
  font-weight: bold;
  padding-left: 10px;
  cursor: pointer;
}
```

```css
mat-card-header{
  justify-content: space-between;
}

mat-card-header .fa-eye,
mat-card-header .fa-eye-slash{
  cursor: pointer;
  align-self: center;
  color: #888;
}
```

- [ ] **Step 6: Compile check**

Run from `ssreports/`: `npx ng build --configuration=production`
Expected: success, no errors.

- [ ] **Step 7: Manual verification**

`npx ng serve`, with `dashboard.hiddenByDefault` left at `true` in `app-config.json`:
1. Load the dashboard. Confirm all 9 KPI cards show `••••••` instead of a number.
2. Click the "Cash In Hand" card (or its eye icon). Confirm it reveals the real number and the icon switches to the "eye-slash" variant.
3. Click it again. Confirm it re-masks.
4. Reload the page. Confirm all cards reset to masked (no persistence, by design).
5. Edit `ssreports/src/app-config.json`, set `dashboard.hiddenByDefault` to `false`, hard-reload (Ctrl+F5). Confirm all 9 cards show their real values immediately without needing a click. Set it back to `true` afterward.

- [ ] **Step 8: Commit**

```bash
git add ssreports/src/app-config.json ssreports/src/app/dashboard/dashboard.component.ts ssreports/src/app/dashboard/dashboard.component.html ssreports/src/app/dashboard/dashboard.component.css
git commit -m "feat: hide dashboard KPI values by default, reveal on click"
```
