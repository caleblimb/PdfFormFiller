export class FileLoader {
  elementContainer: HTMLElement;

  constructor(
    elementContainer: HTMLElement,
    onFileLoad: (file: File) => void,
    contentType: string,
    label: string
  ) {
    this.elementContainer = elementContainer;

    const dropzoneElement: HTMLDivElement = document.createElement("div");
    dropzoneElement.className = "drop-zone";

    const imgElement: HTMLImageElement = document.createElement("img");
    imgElement.src = "./assets/document-upload.svg";

    const pElement: HTMLParagraphElement = document.createElement("p");
    pElement.textContent = label;

    dropzoneElement.appendChild(imgElement);
    dropzoneElement.appendChild(pElement);

    this.elementContainer.appendChild(dropzoneElement);

    function processFile(file: File) {
      const fileName: string = file.name;
      if (file.type === contentType) {
        onFileLoad(file);
      }
    }

    dropzoneElement.ondrop = function (ev: any) {
      ev.preventDefault();

      if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...ev.dataTransfer.items].forEach((item, i) => {
          if (item.kind === "file") {
            const file: File = item.getAsFile();
            processFile(file);
          }
        });
      } else {
        // Use DataTransfer interface to access the file(s)
        [...ev.dataTransfer.files].forEach((file, i) => {
          processFile(file);
        });
      }
    };

    dropzoneElement.ondragover = function (ev) {
      ev.preventDefault();
    };

    function selectFile(): Promise<File> {
      return new Promise((resolve) => {
        let input = document.createElement("input");
        input.type = "file";
        input.multiple = false;
        input.accept = contentType;

        input.onchange = () => {
          let files = Array.from(input.files!);
          resolve(files[0]);
        };

        input.click();
      });
    }

    dropzoneElement.onclick = async () => {
      const file = await selectFile();
      processFile(file);
    };
  }
}
