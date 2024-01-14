import { PDFField } from "pdf-lib";

const svgNS = "http://www.w3.org/2000/svg";

export interface FormField {
  container: HTMLElement;
  field: PDFField;
}

export interface Connection {
  field: FormField;
  cell: HTMLElement;
}

export class ConnectionHandler {
  connections: Set<Connection> = new Set();
  selectedField: FormField | null = null;
  activeLine: SVGLineElement | null = null;

  constructor() {
    const _this = this;
    window.addEventListener("mousemove", function (ev) {
      _this.mouseMove(ev);
    });
    window.addEventListener("mouseup", function (ev) {
      _this.mouseUp(ev);
    });
  }

  getPageCoorinates(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const pageX = rect.left + rect.width / 2 + window.scrollX;
    const pageY = rect.top + rect.height / 2 + window.scrollY;
    const pageRight = rect.right + window.scrollX;
    const pageLeft = rect.left + window.scrollX;
    const pageTop = rect.top + window.scrollY;
    const width = rect.width;
    const height = rect.height;
    return {
      x: pageX,
      y: pageY,
      right: pageRight,
      top: pageTop,
      left: pageLeft,
      width: width,
      height: height,
    };
  }

  liftCell = (cell: HTMLElement) => {
    if (this.selectedField !== null) {
      this.addConnection({ field: this.selectedField, cell: cell });
      this.selectedField = null;
    }
  };

  selectField = (field: FormField) => {
    if (this.selectedField !== null) {
      this.selectedField.container.textContent = "";
    }
    this.removeConnection(field);
    this.selectedField = field;

    const svg = document.createElementNS(svgNS, "svg");

    this.activeLine = document.createElementNS(svgNS, "line");

    this.activeLine.setAttributeNS(null, "x2", "0");
    this.activeLine.setAttributeNS(null, "y2", "0");
    this.activeLine.setAttributeNS(null, "x1", "0");
    this.activeLine.setAttributeNS(null, "y1", "0");
    this.activeLine.setAttributeNS(null, "stroke-width", "2");
    this.activeLine.setAttributeNS(null, "stroke", "red");
    svg.appendChild(this.activeLine);

    this.selectedField.container.appendChild(svg);
  };

  mouseMove(ev: MouseEvent) {
    if (this.activeLine !== null && this.selectedField !== null) {
      const pos = this.getPageCoorinates(this.selectedField.container!);
      this.activeLine.setAttributeNS(null, "x1", `${ev.pageX - pos.x}`);
      this.activeLine.setAttributeNS(null, "y1", `${ev.pageY - pos.y}`);
    }
  }

  mouseUp(ev: MouseEvent) {
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

  removeConnection(field: FormField) {
    this.connections.forEach((connection) => {
      if (field.container === connection.field.container) {
        field.container.textContent = "";
        this.connections.delete(connection);
      }
    });
  }

  clearConnections() {
    this.connections.forEach((connection) => {
      connection.field.container.textContent = "";
    });
    this.connections.clear();
  }

  addConnection(connection: Connection) {
    this.removeConnection(connection.field);
    this.connections.add(connection);
    this.drawConnection(connection);
  }

  drawConnection(connection: Connection) {
    connection.field.container.textContent = "";

    const coords = this.getPageCoorinates(connection.cell);
    const pos = this.getPageCoorinates(connection.field.container);

    const svg = document.createElementNS(svgNS, "svg");

    const line = document.createElementNS(svgNS, "line");
    line.setAttributeNS(null, "x2", "0");
    line.setAttributeNS(null, "y2", "0");
    line.setAttributeNS(null, "x1", `${coords.right - pos.x}`);
    line.setAttributeNS(null, "y1", `${coords.y - pos.y}`);
    line.setAttributeNS(null, "stroke-width", "2");
    line.setAttributeNS(null, "stroke", "red");
    svg.appendChild(line);

    const box = document.createElementNS(svgNS, "rect");
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

  redrawConnections() {
    this.connections.forEach((connection) => {
      connection.cell.style.backgroundColor = "";
      connection.field.container.textContent = "";

      this.drawConnection(connection);
    });
  }

  focusConnection() {
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

  saveConnections() {
    let json: any[] = [];
    this.connections.forEach((connection) => {
      const dataX = connection.cell.getAttribute("data-x");
      const dataY = connection.cell.getAttribute("data-y");
      // const fieldIndex = connection.field.field
      json.push({ dataX, dataY });
    });
  }
}
