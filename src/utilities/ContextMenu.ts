export class ContextMenu {
  constructor(
    triggerElement: HTMLElement,
    items: { text: string; action: () => void }[]
  ) {
    const menuElement = document.createElement("div");
    menuElement.classList.add("jexcel_contextmenu");
    menuElement.classList.add("jcontextmenu");

    items.forEach((item) => {
      const divTag: HTMLDivElement = document.createElement("div");
      const aTag: HTMLAnchorElement = document.createElement("a");

      aTag.textContent = item.text;
      divTag.addEventListener("mousedown", () => {
        item.action();
      });
      divTag.appendChild(aTag);
      menuElement.appendChild(divTag);
    });

    menuElement.appendChild(document.createElement("div"));

    triggerElement.appendChild(menuElement);

    triggerElement.oncontextmenu = function (ev): void {
      ev.preventDefault();
      menuElement.classList.add("jcontextmenu-focus");
      menuElement.style.left = `${ev.clientX}px`;
      menuElement.style.top = `${ev.clientY}px`;
    };

    window.addEventListener("mousedown", function (ev): void {
      menuElement.classList.remove("jcontextmenu-focus");
    });
  }
}
