import { Spreadsheet } from "./spreadsheet/Spreadsheet";
import { Pdf } from "./pdf/Pdf";
import { FileLoader } from "./utilities/FileLoader";
import { ConnectionHandler } from "./utilities/ConnectionHandler";

const spreadsheetContainer: HTMLDivElement = document.getElementById(
  "spreadsheet-container"
)! as HTMLDivElement;

const pdfContainer: HTMLElement = document.getElementById(
  "pdf-container"
)! as HTMLDivElement;

const spreadsheetGenerateForm = document.getElementById(
  "spreadhseet-generate-form"
)! as HTMLFormElement;

const connectionHandler = new ConnectionHandler();

spreadsheetGenerateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const spreadhseetWidthInput: HTMLInputElement = document.getElementById(
    "spreadsheet-width-input"
  )! as HTMLInputElement;
  const spreadhseetHeightInput: HTMLInputElement = document.getElementById(
    "spreadsheet-height-input"
  )! as HTMLInputElement;
  new Spreadsheet(
    spreadsheetContainer,
    [+spreadhseetWidthInput.value, +spreadhseetHeightInput.value],
    connectionHandler.liftCell,
    () => connectionHandler.redrawConnections(),
    () => connectionHandler.focusConnection()
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
        () => connectionHandler.focusConnection()
      );
    },
    "text/csv",
    ".csv, .xlsx, .xls"
  );
}

let pdf!: Pdf;

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

document.getElementById("button-reset-spreadsheet")!.onclick = function () {
  connectionHandler.clearConnections();
  initSpreadsheetFileLoader();
};
document.getElementById("button-autofill-connections")!.onclick =
  function () {};
document.getElementById("button-clear-connections")!.onclick = function () {
  connectionHandler.clearConnections();
};
document.getElementById("button-reset-pdf")!.onclick = function () {
  connectionHandler.clearConnections();
  initPdfFileLoader();
};
document.getElementById("button-download")!.onclick = function () {
  pdf.downloadDoc(connectionHandler.connections);
};

initSpreadsheetFileLoader();
initPdfFileLoader();
