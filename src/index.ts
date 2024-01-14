import { Spreadsheet } from "./spreadsheet/Spreadsheet";
import { Pdf } from "./pdf/Pdf";
import { FileLoader, selectFile } from "./utilities/FileLoader";
import { ConnectionHandler } from "./utilities/ConnectionHandler";

const connectionHandler = new ConnectionHandler();
let pdf: Pdf;
let selectedIndex: { x: number; y: number } = { x: 0, y: 0 };

const spreadsheetContainer: HTMLDivElement = document.getElementById(
  "spreadsheet-container"
)! as HTMLDivElement;

const pdfContainer: HTMLElement = document.getElementById(
  "pdf-container"
)! as HTMLDivElement;

const spreadsheetGenerateForm = document.getElementById(
  "spreadhseet-generate-form"
)! as HTMLFormElement;

document.getElementById("button-reset-spreadsheet")!.onclick = function () {
  connectionHandler.clearConnections();
  initSpreadsheetFileLoader();
};

document.getElementById("button-autofill-connections")!.onclick = function () {
  connectionHandler.autoFillConnections(pdf, selectedIndex); //TODO: make dynamic based on selection
};

document.getElementById("button-save-connections")!.onclick = function () {
  connectionHandler.saveConnections();
};

document.getElementById("button-load-connections")!.onclick =
  async function () {
    const file = await selectFile("application/json");
    connectionHandler.loadConnections(file, pdf);
  };

document.getElementById("button-clear-connections")!.onclick = function () {
  connectionHandler.clearConnections();
};

document.getElementById("button-reset-pdf")!.onclick = function () {
  connectionHandler.clearConnections();
  initPdfFileLoader();
};

document.getElementById("button-download")!.onclick = function () {
  pdf.downloadDoc(connectionHandler.getConnections());
};

spreadsheetGenerateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  connectionHandler.clearConnections();

  const spreadhseetWidthInput: HTMLInputElement = document.getElementById(
    "spreadsheet-width-input"
  )! as HTMLInputElement;

  const spreadhseetHeightInput: HTMLInputElement = document.getElementById(
    "spreadsheet-height-input"
  )! as HTMLInputElement;

  new Spreadsheet(
    spreadsheetContainer,
    {
      width: +spreadhseetWidthInput.value,
      height: +spreadhseetHeightInput.value,
    },
    connectionHandler.liftCell,
    () => connectionHandler.redrawConnections(),
    (index) => {
      if (index !== null) {
        selectedIndex = index;
      }
      connectionHandler.focusConnection();
    }
  );
});

function initSpreadsheetFileLoader() {
  spreadsheetContainer.textContent = "";

  new FileLoader(
    spreadsheetContainer,
    (file) => {
      new Spreadsheet(
        spreadsheetContainer,
        file,
        connectionHandler.liftCell,
        () => connectionHandler.redrawConnections(),
        (index) => {
          if (index !== null) {
            selectedIndex = index;
          }
          connectionHandler.focusConnection();
        }
      );
    },
    "text/csv",
    ".csv, .xlsx, .xls"
  );
}

function initPdfFileLoader() {
  pdfContainer.textContent = "";

  new FileLoader(
    pdfContainer,
    (file) => {
      pdf = new Pdf(pdfContainer, file, connectionHandler.selectField);
    },
    "application/pdf",
    ".pdf"
  );
}

initSpreadsheetFileLoader();
initPdfFileLoader();
