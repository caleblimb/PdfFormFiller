import { Spreadsheet } from "./spreadsheet/Spreadsheet";
import { Pdf } from "./pdf/Pdf";
import { FileLoader, selectFile } from "./utilities/FileLoader";
import { ConnectionHandler } from "./utilities/ConnectionHandler";
import { ContextMenu } from "./utilities/ContextMenu";

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

function createPdfContextMenu() {
  new ContextMenu(pdfContainer, [
    {
      text: "Load Connections",
      action: async function () {
        const file = await selectFile("application/json");
        connectionHandler.loadConnections(file, pdf);
      },
    },
    {
      text: "Save Connections",
      action: () => {
        connectionHandler.saveConnections();
      },
    },
    {
      text: "Clear Connections",
      action: () => {
        connectionHandler.clearConnections();
      },
    },
    {
      text: "AutoFill Connections",
      action: () => {
        connectionHandler.autoFillConnections(pdf, selectedIndex);
      },
    },
  ]);
}

function initPdfFileLoader() {
  pdfContainer.textContent = "";

  new FileLoader(
    pdfContainer,
    (file) => {
      pdf = new Pdf(pdfContainer, file, connectionHandler.selectField);
      createPdfContextMenu();
    },
    "application/pdf",
    ".pdf"
  );
}

initSpreadsheetFileLoader();
initPdfFileLoader();
