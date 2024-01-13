import { Spreadsheet } from "./spreadsheet/spreadsheet";
import { Pdf } from "./pdf/pdf";
import { FileLoader } from "./utilities/fileLoader";

const spreadsheetContainer: HTMLDivElement = document.getElementById(
  "spreadsheet-container"
)! as HTMLDivElement;

const pdfContainer: HTMLElement = document.getElementById(
  "pdf-container"
)! as HTMLDivElement;

const sheetDropzone = new FileLoader(
  spreadsheetContainer,
  (file) => {
    new Spreadsheet(spreadsheetContainer, file);
  },
  "text/csv",
  ".csv, .xlsx, .xls"
);

const pdfDropzone = new FileLoader(
  pdfContainer,
  (file) => {
    new Pdf(pdfContainer, file, selectField, () => {});
  },
  "application/pdf",
  ".pdf"
);

let selectedField: HTMLElement | null = null;
let activeLine: SVGLineElement | null = null;
const selectField = (field: HTMLElement) => {
  selectedField = field;

  selectedField.textContent = "";

  const svg = document.createElementNS(svgNS, "svg");

  activeLine = document.createElementNS(svgNS, "line");

  activeLine.setAttributeNS(null, "x2", `0`);
  activeLine.setAttributeNS(null, "y2", `0`);
  activeLine.setAttributeNS(null, "x1", `0`);
  activeLine.setAttributeNS(null, "y1", `0`);
  activeLine.setAttributeNS(null, "stroke-width", "2");
  activeLine.setAttributeNS(null, "stroke", "black");
  svg.appendChild(activeLine);

  selectedField.appendChild(svg);
};

const svgNS = "http://www.w3.org/2000/svg";

window.addEventListener("mousemove", function (ev) {
  if (activeLine !== null) {
    const pos = getPageCoorinates(selectedField!);
    activeLine.setAttributeNS(null, "x1", `${ev.pageX - pos.x}`);
    activeLine.setAttributeNS(null, "y1", `${ev.pageY - pos.y}`);
  }
});

window.addEventListener("mouseup", function (ev) {
  if (selectedField !== null) {
    const pos = getPageCoorinates(selectedField!);

    console.log(ev.pageX, ev.pageY, pos.x, pos.y);
    selectedField = null;
  }
  if (activeLine !== null) {
    const pos = getPageCoorinates(selectedField!);
    activeLine.setAttributeNS(null, "x1", `${ev.pageX - pos.x}`);
    activeLine.setAttributeNS(null, "y1", `${ev.pageY - pos.y}`);

    activeLine = null;
  }
});

function getPageCoorinates(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const pageX = rect.left + rect.width / 2 + window.scrollX;
  const pageY = rect.top + rect.height / 2 + window.scrollY;
  return { x: pageX, y: pageY };
}
