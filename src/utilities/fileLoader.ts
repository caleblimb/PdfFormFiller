export class FileLoader {
  htmlElement: HTMLElement;

  constructor(
    element: HTMLElement,
    onFileLoad: (file: File) => void,
    contentType: string,
    label: string
  ) {
    this.htmlElement = element;

    this.htmlElement.innerHTML = `
    <div class="drop-zone">
        <img src="./assets/document-upload.svg" />
        <p>${label}</p>
    </div>
    `;

    function processFile(file: File) {
      const fileName: string = file.name;
      console.log(`.name = ${file.name}`);
      if (file.type === contentType) {
        onFileLoad(file);
      }
      // if (acceptedExtensions.indexOf(fileName.split(".").pop() ?? "") > -1) {
      //   onFileLoad(file);
      // }
    }

    this.htmlElement.ondrop = function (ev: any) {
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

    this.htmlElement.ondragover = function (ev) {
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

    this.htmlElement.onclick = async () => {
      const file = await selectFile();
      processFile(file);
    };
  }
}
