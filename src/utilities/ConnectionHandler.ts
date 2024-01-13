const svgNS = "http://www.w3.org/2000/svg";

export class ConnectionHandler {
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
    return { x: pageX, y: pageY };
  }

  liftField = (field: HTMLElement) => {};
  selectCell = (cell: HTMLElement) => {};
  liftCell = (cell: HTMLElement) => {};

  selectField = (field: HTMLElement) => {
    this.selectedField = field;

    this.selectedField.textContent = "";

    const svg = document.createElementNS(svgNS, "svg");

    this.activeLine = document.createElementNS(svgNS, "line");

    this.activeLine.setAttributeNS(null, "x2", "0");
    this.activeLine.setAttributeNS(null, "y2", "0");
    this.activeLine.setAttributeNS(null, "x1", "0");
    this.activeLine.setAttributeNS(null, "y1", "0");
    this.activeLine.setAttributeNS(null, "stroke-width", "2");
    this.activeLine.setAttributeNS(null, "stroke", "black");
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
      const pos = this.getPageCoorinates(this.selectedField!);

      if (this.activeLine !== null) {
        const pos = this.getPageCoorinates(this.selectedField!);
        this.activeLine.setAttributeNS(null, "x1", `${ev.pageX - pos.x}`);
        this.activeLine.setAttributeNS(null, "y1", `${ev.pageY - pos.y}`);

        this.activeLine = null;
      }

      this.selectedField = null;
    }
  }
}
