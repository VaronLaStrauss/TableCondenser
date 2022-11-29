"use strict";

class TableCondenser {
  /** @type {HTMLElement} */
  tbody = null;
  /** @type {HTMLElement} */
  thead = null;

  /** @type {Array<number>} */
  filterColumns = [];
  filter = "";

  /** @type {'asc' | 'desc'} */
  sortDirection = "asc";
  sortColumn = undefined;

  page = 0;
  limit = 5;

  /** @type {Array<[HTMLElement, number]>} */
  currentRows = [];

  /** @type {Array<[HTMLElement, number]>} */
  unpaginatedRows = [];

  cbxSelector = `input[type="checkbox"]`;
  hasCbx = true;

  /**
   * @param {HTMLElement} tbody
   * @param {HTMLElement} thead
   * @param {boolean | undefined} hasCbx
   */
  constructor(tbody, thead, hasCbx = true) {
    this.tbody = tbody.cloneNode(true);
    this.thead = thead;
    this.hasCbx = hasCbx;
  }

  /**
   * @param {HTMLInputElement} cbx
   */
  selectCurrentRows(cbxTh) {
    if (!this.hasCbx) return;
    const checked = cbxTh.checked;
    for (const [tr] of this.currentRows) {
      const cbx = tr.querySelector(this.cbxSelector);
      cbx.checked = checked;
    }
  }

  /**
   * @param {HTMLInputElement} cbxTh
   */
  selectOneRow(cbxTh) {
    if (!this.hasCbx) return;
    if (this.isAllSelected()) cbxTh.checked = true;
    else cbxTh.checked = false;
  }

  isAllSelected() {
    if (!this.hasCbx) return [];
    return this.currentRows.every(
      ([tr]) => tr.querySelector(this.cbxSelector).checked
    );
  }

  deleteCheckedRows() {
    if (!this.hasCbx) return;
    const sortedRows = this.currentRows.sort(([_x, i], [_y, j]) => j - i);
    for (const [tr, i] of sortedRows) {
      if (!tr.querySelector(this.cbxSelector).checked) continue;
      this.tbody.children[i].remove();
      tr.remove();
    }
    this.deselectHeaderCbx();
  }

  get checkedRows() {
    if (!this.hasCbx) return [];
    return this.currentRows.filter(
      ([tr]) => tr.querySelector(this.cbxSelector).checked
    );
  }

  deselectHeaderCbx() {
    if (!this.hasCbx) return;
    /** @type {HTMLInputElement} */
    const cbxTh = this.thead.querySelector(this.cbxSelector);
    cbxTh.checked = false;
  }

  nextPage() {
    this.deselectHeaderCbx();
    if (this.hasNextPage()) this.page++;
  }

  prevPage() {
    this.deselectHeaderCbx();
    if (this.hasPrevPage()) this.page--;
  }

  hasNextPage() {
    const endIdx = (this.page + 1) * this.limit;
    return this.unpaginatedRows.length > endIdx;
  }

  hasPrevPage() {
    return this.page > 0;
  }

  get rawRows() {
    return this.tbody.getElementsByTagName("tr");
  }

  setListeners() {
    /** @type {HTMLInputElement} */
    const cbxTh = this.thead.querySelector(this.cbxSelector);
    cbxTh.onclick = this.selectCurrentRows.bind(this, cbxTh);

    for (const [tr] of this.currentRows) {
      const cbxTd = tr.querySelector(this.cbxSelector);
      cbxTd.onclick = this.selectOneRow.bind(this, cbxTh);
    }
  }

  get rows() {
    this.deselectHeaderCbx();
    /** @type {Set<number>} */
    const idx = new Set([]);

    const rawRows = this.rawRows;

    for (let i = 0; i < rawRows.length; i++) {
      const dataRow = rawRows[i];
      let shouldIncludeRow = false;

      const filter = this.filter.trim().toLowerCase();
      // Apply search filter
      if (filter === "" || this.filterColumns.length === 0)
        shouldIncludeRow = true;
      else {
        shouldIncludeRow = false;
        for (const columnIdx of this.filterColumns) {
          const dataColumn = Array.from(dataRow.getElementsByTagName("td"))[
            columnIdx
          ];
          const dataValue = (dataColumn.textContent || dataColumn.innerText)
            .trim()
            .toLowerCase();
          if (dataValue.indexOf(filter) > -1) {
            shouldIncludeRow = true;
            break;
          }
        }
      }

      if (shouldIncludeRow) idx.add(i);
    }

    /** @type {Array<[HTMLElement, number]>} */
    let rows = Array.from(
      this.tbody.cloneNode(true).getElementsByTagName("tr")
    ).reduce((acc, tr, i) => {
      return idx.has(i) ? [...acc, [tr, i]] : acc;
    }, []);

    if (this.sortColumn !== undefined) {
      rows = rows.sort(([a], [b]) => {
        const sortFieldA = a.children[this.sortColumn];
        const sortFieldB = b.children[this.sortColumn];

        let textA = sortFieldA.textContent || sortFieldA.innerText;
        let textB = sortFieldB.textContent || sortFieldB.innerText;

        textA = textA.toLowerCase().trim();
        textB = textB.toLowerCase().trim();

        if (Number(textA)) textA = Number(textA);
        if (Number(textB)) textB = Number(textB);

        let comparator = false;

        if (this.sortDirection === "asc") comparator = textA > textB;
        else comparator = textA < textB;
        return comparator ? 1 : -1;
      });
    }

    this.unpaginatedRows = [...rows];
    rows = rows.slice(this.page * this.limit, (this.page + 1) * this.limit);
    this.currentRows = [...rows];

    if (this.hasCbx) this.setListeners();

    return this.currentRows.map(([tr]) => tr);
  }
}
