import { Spreadsheet } from "./spreadsheet/spreadsheet";
import { Pdf } from "./pdf/pdf";
import { FileLoader } from "./utilities/fileLoader";

const sheetDropzone = new FileLoader(
  document.getElementById("spreadsheet-dropzone")!,
  (a) => {},
  "text/csv",
  ".csv, .xlsx, .xls"
);

const pdfDropzone = new FileLoader(
  document.getElementById("pdf-dropzone")!,
  (a) => {},
  "application/pdf",
  ".pdf"
);
