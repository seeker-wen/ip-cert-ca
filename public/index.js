async function loadExternalHTML(fileName) {
  const response = await fetch(fileName);
  const htmlText = await response.text();
  const parser = new DOMParser();
  const dom = parser.parseFromString(htmlText, 'text/html');
  return dom.firstElementChild;
}

class MyCustomElement extends HTMLElement {
  constructor() {
    super();
    // 创建 Shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });

    loadExternalHTML('/readme.html').then((dom) => {
      // 在 Shadow DOM 中添加元素和样式
      shadow.appendChild(dom);
    });

  }
}

customElements.define('omega-ca-readme', MyCustomElement);