import download from "downloadjs";
import { PDFField } from "pdf-lib";
import { Pdf } from "../pdf/Pdf";
import { getPageCoorinates } from "./Position";

const SVG_NS = "http://www.w3.org/2000/svg";

export interface FormField {
  container: HTMLElement;
  field: PDFField;
}

export interface Connection {
  field: FormField;
  cell: HTMLElement;
}

interface SavedConnection {
  dataX: string;
  dataY: string;
  dataI: string;
}

export class ConnectionHandler {
  private connections: Set<Connection> = new Set();
  private selectedField: FormField | null = null;
  private activeLine: SVGLineElement | null = null;

  constructor() {
    const _this = this;
    window.addEventListener("mousemove", function (ev) {
      _this.mouseMove(ev);
    });
    window.addEventListener("mouseup", function (ev) {
      _this.mouseUp(ev);
    });
  }

  private mouseMove(ev: MouseEvent) {
    if (this.activeLine !== null && this.selectedField !== null) {
      const pos = getPageCoorinates(this.selectedField.container!);
      this.activeLine.setAttributeNS(null, "x1", `${ev.pageX - pos.x}`);
      this.activeLine.setAttributeNS(null, "y1", `${ev.pageY - pos.y}`);
    }
  }

  private mouseUp(ev: MouseEvent) {
    if (
      this.selectedField !== null &&
      this.selectedField.container !==
        document.elementFromPoint(ev.clientX, ev.clientY)
    ) {
      this.selectedField.container.textContent = "";

      this.activeLine = null;
      this.selectedField = null;
    }
  }

  private removeConnection(field: FormField) {
    this.connections.forEach((connection) => {
      if (field.container === connection.field.container) {
        field.container.textContent = "";
        this.connections.delete(connection);
      }
    });
  }

  private addConnection(connection: Connection) {
    this.removeConnection(connection.field);
    this.connections.add(connection);
    this.drawConnection(connection);
  }

  private drawConnection(connection: Connection) {
    connection.field.container.textContent = "";

    const coords = getPageCoorinates(connection.cell);
    const pos = getPageCoorinates(connection.field.container);

    const svg = document.createElementNS(SVG_NS, "svg");

    const line = document.createElementNS(SVG_NS, "line");
    line.setAttributeNS(null, "x2", "0");
    line.setAttributeNS(null, "y2", "0");
    line.setAttributeNS(null, "x1", `${coords.right - pos.x}`);
    line.setAttributeNS(null, "y1", `${coords.y - pos.y}`);
    line.setAttributeNS(null, "stroke-width", "2");
    line.setAttributeNS(null, "stroke", "red");
    svg.appendChild(line);

    const box = document.createElementNS(SVG_NS, "rect");
    box.setAttributeNS(null, "x", `${coords.left - pos.x}`);
    box.setAttributeNS(null, "y", `${coords.top - pos.y}`);
    box.setAttributeNS(null, "width", `${coords.width}`);
    box.setAttributeNS(null, "height", `${coords.height}`);
    box.setAttributeNS(null, "fill", "rgba(255,0,0,0.1)");
    box.setAttributeNS(null, "stroke", "rgba(255,0,0,1)");
    box.setAttributeNS(null, "stroke-width", "2");
    svg.appendChild(box);

    connection.field.container.appendChild(svg);
  }

  private parseConnection(connection: SavedConnection, pdf: Pdf) {
    const container: HTMLElement | null = document.querySelector(
      `[data-i="${connection.dataI}"]`
    );
    const cell: HTMLElement | null = document.querySelector(
      `[data-x="${connection.dataX}"][data-y="${connection.dataY}"]`
    );
    const field = pdf.getFormField(+connection.dataI);

    if (container && field && cell) {
      this.addConnection({
        field: { container: container, field: field },
        cell: cell,
      });
    }
  }

  public liftCell = (cell: HTMLElement) => {
    if (this.selectedField !== null) {
      this.addConnection({ field: this.selectedField, cell: cell });
      this.selectedField = null;
    }
  };

  public selectField = (field: FormField) => {
    if (this.selectedField !== null) {
      this.selectedField.container.textContent = "";
    }
    this.removeConnection(field);
    this.selectedField = field;

    const svg = document.createElementNS(SVG_NS, "svg");

    this.activeLine = document.createElementNS(SVG_NS, "line");

    this.activeLine.setAttributeNS(null, "x2", "0");
    this.activeLine.setAttributeNS(null, "y2", "0");
    this.activeLine.setAttributeNS(null, "x1", "0");
    this.activeLine.setAttributeNS(null, "y1", "0");
    this.activeLine.setAttributeNS(null, "stroke-width", "2");
    this.activeLine.setAttributeNS(null, "stroke", "red");
    svg.appendChild(this.activeLine);

    this.selectedField.container.appendChild(svg);
  };

  public getConnections(): Set<Connection> {
    return this.connections;
  }

  public clearConnections() {
    this.connections.forEach((connection) => {
      connection.field.container.textContent = "";
    });
    this.connections.clear();
  }

  public redrawConnections() {
    this.connections.forEach((connection) => {
      connection.cell.style.backgroundColor = "";
      connection.field.container.textContent = "";

      this.drawConnection(connection);
    });
  }

  public focusConnection() {
    const focusedFields = document.querySelectorAll(".focused-field");
    focusedFields.forEach((element) => {
      element.classList.remove("focused-field");
    });

    const focusedCells = document.querySelectorAll("td.highlight");
    focusedCells.forEach((cell) => {
      this.connections.forEach((connection) => {
        if (connection.cell === cell) {
          connection.field.container.classList.add("focused-field");
        }
      });
    });
  }

  public saveConnections() {
    let data: SavedConnection[] = [];
    this.connections.forEach((connection) => {
      const dataX = connection.cell.dataset.x;
      const dataY = connection.cell.dataset.y;
      const dataI = connection.field.container.dataset.i;
      if (dataX && dataY && dataI) {
        data.push({ dataX, dataY, dataI });
      }
    });

    const json = JSON.stringify(data);
    download(json, "connections.json", "application/json");
  }

  public autoFillConnections(pdf: Pdf, position: { x: number; y: number }) {
    const fieldCount: number = pdf.getFormFieldCount();
    for (let i = 0; i < fieldCount; i++) {
      this.parseConnection(
        { dataX: `${position.x}`, dataY: `${position.y + i}`, dataI: `${i}` },
        pdf
      );
    }
  }

  public loadConnections(file: File, pdf: Pdf) {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        const json: string = event.target.result as string;
        const data: SavedConnection[] = JSON.parse(json);

        data.forEach((connection) => {
          this.parseConnection(connection, pdf);
        });
      }
    };

    reader.readAsText(file);
  }
}
