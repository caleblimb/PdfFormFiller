import jspreadsheet from "jspreadsheet-ce";

export class Spreadsheet {
  constructor(htmlElement: HTMLDivElement, file: File | null) {
    htmlElement.textContent = "";

    if (file !== null) {
      parseFile(htmlElement, file);
    } else {
      const data = [
        ["1,1", "2", "3", "4"],
        ["1,2", "2", "3", "4"],
        ["1,3", "2", "3", "4"],
        ["1,4", "2", "3", "4"],
      ];
      jspreadsheet(htmlElement, {
        // csv: "assets/jspreadsheet.csv",

        data: data,

        csvHeaders: false,
        tableOverflow: true,

        columns: [
          { type: "text", width: 300 },
          { type: "text", width: 80 },
          { type: "text", width: 120 },
          { type: "text", width: 120 },
        ],
      });
    }

    async function parseFile(htmlElement: HTMLDivElement, file: File) {
      const content: string = await file.text();
      const rows: string[] = content.split("\n");
      const data: string[][] = rows.map((row) => row.split(","));
      const columns: jspreadsheet.Column[] = data[0].map(() => {
        return { type: "text", width: 100 };
      });

      jspreadsheet(htmlElement, {
        data: data,

        csvHeaders: false,
        tableOverflow: false,

        columns: columns,
      });
    }
  }
}
