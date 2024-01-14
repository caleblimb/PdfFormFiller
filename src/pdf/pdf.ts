import download from "downloadjs";
import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFField,
  PDFForm,
  PDFPage,
  PDFRadioGroup,
  PDFSignature,
  PDFTextField,
  PDFWidgetAnnotation,
} from "pdf-lib";
import {
  GlobalWorkerOptions,
  PDFDocumentProxy,
  PDFPageProxy,
  PageViewport,
  getDocument,
} from "pdfjs-dist";
import { RenderParameters } from "pdfjs-dist/types/src/display/api";
import { Connection, FormField } from "../utilities/ConnectionHandler";

export class Pdf {
  pdfDoc!: PDFDocument;
  pageCount!: number;
  formFields!: PDFField[];
  onFieldMouseDown!: (field: FormField) => void;

  constructor(
    container: HTMLElement,
    file: File,
    onFieldMouseDown: (field: FormField) => void
  ) {
    container.textContent = "";
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
    this.onFieldMouseDown = onFieldMouseDown;

    container.appendChild(canvas);

    GlobalWorkerOptions.workerSrc =
      "../../node_modules/pdfjs-dist/build/pdf.worker.min.mjs";

    this.initializePdf(file, container, canvas, context);
  }

  async initializePdf(
    file: File,
    container: HTMLElement,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ) {
    const pdfBytes: ArrayBuffer = await this.parseFile(file);

    const pages = await this.parsePdf(pdfBytes);

    const rasterizedPages = await this.rasterizePdf(pdfBytes);
    this.drawPages(canvas, context, rasterizedPages);
    this.addFormFieldComponents(
      container,
      this.formFields,
      rasterizedPages,
      pages
    );
  }

  async parseFile(file: File): Promise<ArrayBuffer> {
    const pdfBytes: ArrayBuffer = await file.arrayBuffer();
    return pdfBytes;
  }

  async parsePdf(pdfBytes: ArrayBuffer): Promise<PDFPage[]> {
    this.pdfDoc = await PDFDocument.load(pdfBytes);
    const pages: PDFPage[] = this.pdfDoc.getPages();
    this.pageCount = pages.length;
    const form: PDFForm = this.pdfDoc.getForm();
    this.formFields = form.getFields();
    return pages;
  }

  async rasterizePdf(pdfBytes: ArrayBuffer): Promise<HTMLCanvasElement[]> {
    const pdfDocument: PDFDocumentProxy = await getDocument(pdfBytes).promise;

    const rasterizedPages = await Promise.all(
      Array(this.pageCount)
        .fill(1)
        .map(async (_, i) => {
          const currentPage: PDFPageProxy = await pdfDocument.getPage(i + 1);
          const canvas: HTMLCanvasElement = document.createElement("canvas");
          const canvasContext: CanvasRenderingContext2D =
            canvas.getContext("2d")!;
          const viewport: PageViewport = currentPage.getViewport({ scale: 1 });

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await currentPage.render({
            canvasContext: canvasContext,
            viewport: viewport,
          }).promise;

          return canvas;
        })
    );
    return rasterizedPages;
  }

  drawPages(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    rasterizedPages: HTMLCanvasElement[]
  ) {
    const canvasDimensions = rasterizedPages.reduce(
      (acc, page) => [Math.max(acc[0], page.width), acc[1] + page.height],
      [0, 0]
    );

    canvas.width = canvasDimensions[0];
    canvas.height = canvasDimensions[1];

    rasterizedPages.reduce((acc: number, page: HTMLCanvasElement): number => {
      const dWidth: number = page.width;
      const dHeight: number = page.height;
      const dx: number = 0;
      const dy: number = acc;
      context.drawImage(page, dx, dy, dWidth, dHeight);
      return page.height + acc;
    }, 0);
  }

  addFormFieldComponents(
    container: HTMLElement,
    fields: PDFField[],
    rasterizedPages: HTMLCanvasElement[],
    pages: PDFPage[]
  ): void {
    fields.forEach((field: PDFField, index: number) => {
      const pageNumber = this.getPageNumberOfField(field, pages);

      const pageOffset = rasterizedPages.reduce(
        (acc, page, index) => (index > pageNumber ? acc + page.height : acc),
        0
      );

      const widgets = field.acroField.getWidgets();
      widgets.forEach((widget: PDFWidgetAnnotation): void => {
        const rect = widget.Rect()?.asRectangle();

        const element = document.createElement("div");
        element.className = "field-box";
        element.style.width = `${rect?.width}px`;
        element.style.height = `${rect?.height}px`;
        element.style.left = `${rect?.x ?? 0 + 1}px`;
        element.style.bottom = `${(rect?.y ?? 0) + pageOffset + 2}px`;
        element.dataset.i = `${index}`;

        element.onmousedown = (ev) => {
          ev.preventDefault();
          this.onFieldMouseDown({ container: element, field: field });
        };

        container.appendChild(element);
      });
    });
  }

  getPageNumberOfField(field: PDFField, pages: PDFPage[]): number {
    const fieldPage = this.pdfDoc.findPageForAnnotationRef(field.ref);
    const pageNumber = pages.reduce(
      (acc, page, index) => (fieldPage === page ? index : acc),
      -1
    );
    return pageNumber;
  }

  getFormField(index: number): PDFField {
    return this.formFields[index];
  }

  getFormFieldCount(): number {
    return this.formFields.length;
  }

  async fillDocument(connections: Set<Connection>): Promise<Uint8Array> {
    connections.forEach((connection) => {
      if (connection.field.field instanceof PDFTextField) {
        (connection.field.field as PDFTextField).setText(
          connection.cell.innerText
        );
      } else if (connection.field.field instanceof PDFCheckBox) {
        if (connection.cell.innerText === "true") {
          (connection.field.field as PDFCheckBox).check();
        }
      } else if (connection.field.field instanceof PDFDropdown) {
        //TODO: Handle dropdown field type
      } else if (connection.field.field instanceof PDFRadioGroup) {
        //TODO: Handle radio group field type
      } else if (connection.field.field instanceof PDFSignature) {
        //TODO: Handle signature field type
      }
    });

    const pdfBytes = await this.pdfDoc.save();
    return pdfBytes;
  }

  async downloadDoc(connections: Set<Connection>): Promise<void> {
    const doc = await this.fillDocument(connections);
    download(doc, "pdf-tax-example.pdf", "application/pdf");
  }
}
