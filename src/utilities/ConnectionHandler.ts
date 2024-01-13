const svgNS = "http://www.w3.org/2000/svg";

interface Connection {
  field: HTMLElement;
  cell: HTMLElement;
}

export class ConnectionHandler {
  connections: Set<Connection> = new Set();
  selectedField: HTMLElement | null = null;
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
    return { x: pageX, y: pageY, right: pageRight };
  }

  liftField = (field: HTMLElement) => {};
  selectCell = (cell: HTMLElement) => {};

  liftCell = (cell: HTMLElement) => {
    if (this.selectedField !== null) {
      this.addConnection({ field: this.selectedField, cell: cell });
      this.selectedField = null;
    }
  };

  selectField = (field: HTMLElement) => {
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

    this.selectedField.appendChild(svg);
  };

  mouseMove(ev: MouseEvent) {
    if (this.activeLine !== null && this.selectedField !== null) {
      const pos = this.getPageCoorinates(this.selectedField!);
      this.activeLine.setAttributeNS(null, "x1", `${ev.pageX - pos.x}`);
      this.activeLine.setAttributeNS(null, "y1", `${ev.pageY - pos.y}`);
    }
  }

  mouseUp(ev: MouseEvent) {
    if (this.selectedField !== null) {
      this.selectedField.textContent = "";

      this.activeLine = null;
      this.selectedField = null;
    }
  }

  removeConnection(field: HTMLElement) {
    this.connections.forEach((connection) => {
      if (field === connection.field) {
        connection.cell.style.backgroundColor = "";
        field.textContent = "";
        this.connections.delete(connection);
      }
    });
  }

  addConnection(connection: Connection) {
    this.connections.add(connection);
    this.drawConnection(connection);
  }

  drawConnection(connection: Connection) {
    connection.field.textContent = "";

    const svg = document.createElementNS(svgNS, "svg");

    const line = document.createElementNS(svgNS, "line");
    line.setAttributeNS(null, "x2", "0");
    line.setAttributeNS(null, "y2", "0");

    connection.cell.style.backgroundColor = "rgba(255,0,0,0.1)";
    const coords = this.getPageCoorinates(connection.cell);
    const pos = this.getPageCoorinates(connection.field);

    line.setAttributeNS(null, "x1", `${coords.right - pos.x - 4}`);
    line.setAttributeNS(null, "y1", `${coords.y - pos.y}`);
    line.setAttributeNS(null, "stroke-width", "2");
    line.setAttributeNS(null, "stroke", "red");
    svg.appendChild(line);

    connection.field.appendChild(svg);
  }

  redrawConnections() {
    this.connections.forEach((connection) => {
      connection.cell.style.backgroundColor = "";
      connection.field.textContent = "";

      this.drawConnection(connection);
    });
  }
}
