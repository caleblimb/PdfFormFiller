import jspreadsheet, { JspreadsheetInstance, Column } from "jspreadsheet-ce";

export class Spreadsheet {
  spreadSheet!: JspreadsheetInstance;
  onFieldMouseDown!: (Element: HTMLElement) => void;
  onFieldMouseUp!: (Element: HTMLElement) => void;
  constructor(
    htmlElement: HTMLDivElement,
    file: File | number[],
    onFieldMouseDown: (element: HTMLElement) => void,
    onFieldMouseUp: (element: HTMLElement) => void
  ) {
    htmlElement.textContent = "";

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

    jspreadsheet(htmlElement, {
      data: data,
      csvHeaders: false,
      tableOverflow: false,
      columns: columns,
    });
  }

  async parseFile(htmlElement: HTMLDivElement, file: File) {
    const content: string = await file.text();
    const rows: string[] = content.split("\n");
    const data: string[][] = rows.map((row) => row.split(","));
    const columns: jspreadsheet.Column[] = data[0].map(() => {
      return { type: "text", width: 100 };
    });

    this.spreadSheet = jspreadsheet(htmlElement, {
      data: data,

      csvHeaders: false,
      tableOverflow: false,

      columns: columns,
    });
  }
}
