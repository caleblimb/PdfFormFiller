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
    connectionHandler.selectCell,
    connectionHandler.liftCell
  );
});

new FileLoader(
  spreadsheetContainer,
  (file) => {
    new Spreadsheet(
      spreadsheetContainer,
      file,
      connectionHandler.selectCell,
      connectionHandler.liftCell
    );
  },
  "text/csv",
  ".csv, .xlsx, .xls"
);

new FileLoader(
  pdfContainer,
  (file) => {
    new Pdf(
      pdfContainer,
      file,
      connectionHandler.selectField,
      connectionHandler.liftField
    );
  },
  "application/pdf",
  ".pdf"
);
