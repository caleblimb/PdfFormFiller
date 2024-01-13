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
} from "pdf-lib";
import {
  GlobalWorkerOptions,
  PDFDocumentProxy,
  PDFPageProxy,
  PageViewport,
  getDocument,
} from "pdfjs-dist";
import { RenderParameters } from "pdfjs-dist/types/src/display/api";

enum FieldType {
  TEXT = "Text Field",
  CHECKBOX = "Checkbox",
  DROPDOWN = "Dropdown",
  RADIOGROUP = "Radio Group",
  SIGNATURE = "Signature",
}

export class Pdf {
  pdfDoc!: PDFDocument;
  pages!: PDFPage[];
  form!: PDFForm;
  formFields!: PDFField[];
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  onFieldMouseDown!: (Element: HTMLElement) => void;
  onFieldMouseUp!: (Element: HTMLElement) => void;

  constructor(
    container: HTMLElement,
    file: File,
    onFieldMouseDown: (element: HTMLElement) => void,
    onFieldMouseUp: (element: HTMLElement) => void
  ) {
    container.textContent = "";
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d")!;
    this.onFieldMouseDown = onFieldMouseDown;
    this.onFieldMouseUp = onFieldMouseUp;

    container.appendChild(this.canvas);

    GlobalWorkerOptions.workerSrc =
      "../../node_modules/pdfjs-dist/build/pdf.worker.min.mjs";

    this.initializePdf(file, container);
  }

  async initializePdf(file: File, container: HTMLElement) {
    const pdfBytes: ArrayBuffer = await this.parseFile(file);

    await this.parsePdf(pdfBytes);

    const rasterizedPages = await this.rasterizePdf(pdfBytes);
    this.drawPages(this.canvas, rasterizedPages);
    this.addFormFieldComponents(container, this.formFields, rasterizedPages);
  }

  async parseFile(file: File): Promise<ArrayBuffer> {
    const pdfBytes: ArrayBuffer = await file.arrayBuffer();
    return pdfBytes;
  }

  async parsePdf(pdfBytes: ArrayBuffer): Promise<void> {
    this.pdfDoc = await PDFDocument.load(pdfBytes);
    this.pages = this.pdfDoc.getPages();
    this.form = this.pdfDoc.getForm();
    this.formFields = this.form.getFields();
  }

  async rasterizePdf(pdfBytes: ArrayBuffer): Promise<HTMLCanvasElement[]> {
    const pdfDocument: PDFDocumentProxy = await getDocument(pdfBytes).promise;

    const rasterizedPages = await Promise.all(
      this.pages.map(async (_, i) => {
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

  drawPages(canvas: HTMLCanvasElement, pages: HTMLCanvasElement[]) {
    const canvasDimensions = pages.reduce(
      (acc, page) => [Math.max(acc[0], page.width), acc[1] + page.height],
      [0, 0]
    );

    canvas.width = canvasDimensions[0];
    canvas.height = canvasDimensions[1];

    pages.reduce((acc, page) => {
      const dWidth: number = page.width;
      const dHeight: number = page.height;
      const dx: number = 0;
      const dy: number = acc;
      this.context.drawImage(page, dx, dy, dWidth, dHeight);
      return page.height + acc;
    }, 0);
  }

  addFormFieldComponents(
    container: HTMLElement,
    fields: PDFField[],
    pages: HTMLCanvasElement[]
  ): void {
    fields.forEach((field: PDFField) => {
      const pageNumber = this.getPageNumberOfField(field);

      const pageOffset = pages.reduce(
        (acc, page, index) => (index > pageNumber ? acc + page.height : acc),
        0
      );

      const widgets = field.acroField.getWidgets();
      widgets.forEach((widget) => {
        const rect = widget.Rect()?.asRectangle();

        const element = document.createElement("div");
        element.className = "field-box";
        element.style.width = `${rect?.width}px`;
        element.style.height = `${rect?.height}px`;
        element.style.left = `${rect?.x ?? 0 + 1}px`;
        element.style.bottom = `${(rect?.y ?? 0) + pageOffset + 2}px`;

        element.onmousedown = (ev) => {
          ev.preventDefault();
          this.onFieldMouseDown(element);
        };
        element.onmouseup = (ev) => {
          ev.preventDefault();
          this.onFieldMouseUp(element);
        };

        container.appendChild(element);
      });
    });
  }

  getPageNumberOfField(field: PDFField): number {
    const fieldPage = this.pdfDoc.findPageForAnnotationRef(field.ref);
    const pageNumber = this.pages.reduce(
      (acc, page, index) => (fieldPage === page ? index : acc),
      -1
    );
    return pageNumber;
  }

  getFormFieldType(field: PDFField): FieldType | null {
    if (field instanceof PDFTextField) {
      return FieldType.TEXT;
    } else if (field instanceof PDFCheckBox) {
      return FieldType.CHECKBOX;
    } else if (field instanceof PDFDropdown) {
      return FieldType.DROPDOWN;
    } else if (field instanceof PDFRadioGroup) {
      return FieldType.RADIOGROUP;
    } else if (field instanceof PDFSignature) {
      return FieldType.SIGNATURE;
    }
    return null;
  }
}
