import jspreadsheet, { JspreadsheetInstance, Column } from "jspreadsheet-ce";

export class Spreadsheet {
  spreadsheet!: JspreadsheetInstance;
  onCellMouseDown!: (Element: HTMLElement) => void;
  onCellMouseUp!: (Element: HTMLElement) => void;
  onStructureChange!: () => void;
  constructor(
    htmlElement: HTMLDivElement,
    file: File | number[],
    onCellMouseDown: (element: HTMLElement) => void,
    onCellMouseUp: (element: HTMLElement) => void,
    onStructureChange: () => void
  ) {
    htmlElement.textContent = "";
    this.onCellMouseDown = onCellMouseDown;
    this.onCellMouseUp = onCellMouseUp;
    this.onStructureChange = onStructureChange;

    if (file instanceof File) {
      this.parseFile(htmlElement, file);
    } else {
      this.generateTable(htmlElement, file);
    }
  }

  generateTable(htmlElement: HTMLDivElement, dimensions: number[]) {
    let data: string[][] = [];

    let row: string[] = [];
    for (let i = 0; i < dimensions[0]; i++) {
      row.push("");
    }
    for (let i = 0; i < dimensions[1]; i++) {
      data.push([...row]);
    }

    const columns: Column[] = row.map((cell) => {
      return { type: "text", width: 100 };
    });

    this.createSpreadsheet(htmlElement, data, columns);
  }

  async parseFile(htmlElement: HTMLDivElement, file: File) {
    const content: string = await file.text();
    const rows: string[] = content.split("\n");
    const data: string[][] = rows.map((row) => row.split(","));
    const columns: jspreadsheet.Column[] = data[0].map(() => {
      return { type: "text", width: 100 };
    });

    this.createSpreadsheet(htmlElement, data, columns);
  }

  createSpreadsheet(
    element: HTMLDivElement,
    data: string[][],
    columns: jspreadsheet.Column[]
  ) {
    this.spreadsheet = jspreadsheet(element, {
      data: data,
      csvHeaders: false,
      tableOverflow: false,
      columns: columns,

      oninsertrow: this.onStructureChange,
      oninsertcolumn: this.onStructureChange,
      ondeleterow: this.onStructureChange,
      ondeletecolumn: this.onStructureChange,
      onresizerow: this.onStructureChange,
      onresizecolumn: this.onStructureChange,
      onmoverow: this.onStructureChange,
      onmovecolumn: this.onStructureChange,
    });

    this.addEvents();
  }

  addEvents() {
    const _this = this;
    const elements = document.querySelectorAll("[data-x][data-y]");
    (elements as NodeListOf<HTMLElement>).forEach((cell) => {
      cell.onmousedown = function (ev) {
        _this.onCellMouseDown(cell);
      };
      cell.onmouseup = function (ev) {
        _this.onCellMouseUp(cell);
      };
    });
  }
}
