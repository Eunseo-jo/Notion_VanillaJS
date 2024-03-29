import {
  toggleTextStyle,
  setTextColor,
  generateOptionList,
  generateColorList,
} from "../../utils/textStyleUtils/textStyleUtils.js";

export default class Editor {
  constructor({
    $target,
    initialState,
    saveDocument,
    handleInputChange,
    linkToSubDocument,
  }) {
    this.$target = $target;
    this.state = initialState;

    this.$editor = document.createElement("div");
    this.$editor.classList.add("editor-container");
    this.$editor.innerHTML = `
    <textarea class="title" name="title" placeholder="제목을 입력하세요"></textarea>
      <div class="content" name="content" contenteditable="true" placeholder="내용을 입력하세요"></div>
    `;

    this.$textOptions = document.createElement("div");
    this.$textOptions.className = "text-options";
    this.$textOptions.innerHTML = generateOptionList() + generateColorList();
    this.addEventListenersToTextOptions(this.$textOptions);

    this.$subDocument = document.createElement("div");
    this.$subDocument.classList.add("sub-document-list");

    this.saveDocument = saveDocument;
    this.handleInputChange = handleInputChange;

    this.$editor
      .querySelector("[name=title]")
      .addEventListener("input", this.editDocument);

    this.$editor
      .querySelector("[name=title]")
      .addEventListener("input", this.handleTitleHeight);

    this.$editor
      .querySelector("[name=title]")
      .addEventListener("keydown", this.handleTitleKeydownToMoveContent);

    this.$editor
      .querySelector("[name=content]")
      .addEventListener("input", this.editDocument);

    this.$editor
      .querySelector("[name=content]")
      .addEventListener("focusout", (e) => {
        if (!this.$textOptions.contains(e.relatedTarget)) {
          this.$textOptions.style.display = "none";
          this.$textOptions
            .querySelector(".color-list")
            .classList.remove("show");
        }
      });

    this.$editor
      .querySelector("[name=content]")
      .addEventListener("mouseup", this.handleTextSelection);

    this.$editor
      .querySelector("[name=content]")
      .addEventListener("keydown", this.handleContentKeydownToMoveTitle);

    this.$subDocument.addEventListener("click", (e) => {
      const clickedElement = e.target.closest(".sub-document-item");
      if (clickedElement) {
        const id = clickedElement.dataset.id;
        linkToSubDocument(id);
      }
    });

    const subDocumentListHeight = this.$subDocument.offsetHeight;
    this.$editor.style.maxHeight =
      subDocumentListHeight === 0
        ? "600px"
        : `calc(100% - ${subDocumentListHeight}px)`;

    this.render();
  }

  setState = (nextState) => {
    this.state = nextState;
    this.render();
  };

  // 하위 문서 렌더링
  renderSubDocumentList = () => {
    this.$subDocument.innerHTML = `
      ${this.state.documents
        ?.map(
          (doc) => `
          <div class="sub-document-item" data-id="${doc.id}">
            <img class="document-icon" src="/assets/document.svg" alt="document"/>
            <p>${doc.title}</p>
          </div>
        `
        )
        .join("")}
    `;
  };

  // 제목/내용 수정 시
  editDocument = (e) => {
    const { target } = e;

    if (target.className) {
      const nextState = {
        ...this.state,
        [target.className]: target.innerHTML.trim(),
      };

      const data = {
        postId: nextState.postId,
        title: nextState.title,
        content: nextState.content,
      };

      this.handleInputChange(data);
    }
  };

  handleTitleHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  handleTextSelection = (e) => {
    const selectedText = window.getSelection().toString();

    if (selectedText === "") {
      this.hideTextOptions();
    } else {
      this.showTextOptions(e.pageX, e.pageY);
    }
  };

  showTextOptions = (pageX, pageY) => {
    const colorList = this.$textOptions.querySelector(".color-list");

    // 옵션 박스 위치 설정하기
    this.$textOptions.style.display = "flex";
    this.$textOptions.style.position = "fixed";
    this.$textOptions.style.left = pageX + "px";
    this.$textOptions.style.top = pageY - 55 + "px";
    this.$textOptions.style.zIndex = "10";

    colorList.style.position = "fixed";
    colorList.style.left = pageX + 70 + "px";
    colorList.style.top = pageY - 20 + "px";
    colorList.style.zIndex = "20";

    this.$editor.appendChild(this.$textOptions);
  };

  hideTextOptions = () => {
    const colorList = this.$textOptions.querySelector(".color-list");

    if (this.$textOptions.parentNode) {
      this.$textOptions.remove();
    }

    this.$textOptions.style.display = "none";
    colorList.classList.remove("show");
  };

  addEventListenersToTextOptions = (textOptions) => {
    this.handleTextOptionsClick(textOptions);
    this.handleColorListClick(textOptions);
    this.preventSpanMouseDown(textOptions);
    this.preventDivMouseDown(textOptions);
  };

  // 텍스트 스타일 클릭 시
  handleTextOptionsClick = (textOptions) => {
    textOptions.addEventListener("click", (e) => {
      const target = e.target;
      const textOption = target.closest(".text-option");

      if (textOption) {
        const option = textOption.dataset.option;
        // 컬러 리스트 열기
        if (option === "color") {
          const colorList = textOptions.querySelector(".color-list");
          colorList.classList.toggle("show");
        }
        // 글자 스타일 설정
        else {
          toggleTextStyle(option);
        }
      }
    });
  };

  // 색상 리스트 선택 시
  handleColorListClick = (textOptions) => {
    const colorList = textOptions.querySelector(".color-list");

    colorList.addEventListener("click", (e) => {
      e.preventDefault();
      const target = e.target;
      const colorOption = target.closest(".color-option");
      const color = colorOption.dataset.color;

      if (colorOption) {
        setTextColor(color);
      }
    });
  };

  preventSpanMouseDown = (textOptions) => {
    const colorOptionSpans = textOptions.querySelectorAll(".color-option span");
    colorOptionSpans.forEach((span) => {
      span.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });
    });
  };

  preventDivMouseDown = (textOptions) => {
    const colorOptionSpans = textOptions.querySelectorAll(".color-option");
    colorOptionSpans.forEach((div) => {
      div.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });
    });
  };

  handleTitleKeydownToMoveContent = (e) => {
    if (e.key === "ArrowDown") {
      const titleElem = this.$editor.querySelector("[name=title]");
      const cursorPosition = titleElem.selectionStart;
      const titleLength = titleElem.value.length;

      if (cursorPosition === titleLength) {
        e.preventDefault();
        this.$editor.querySelector("[name=content]").focus();
      }
    }
  };

  handleContentKeydownToMoveTitle = (e) => {
    if (e.key === "ArrowUp") {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const isAtStart = range.startOffset === 0 && range.endOffset === 0;

        if (isAtStart) {
          e.preventDefault();
          this.$editor.querySelector("[name=title]").focus();
        }
      }
    }
  };

  render = () => {
    this.renderSubDocumentList();
    this.$editor.querySelector("[name=title]").innerHTML = this.state.title;
    this.$editor.querySelector("[name=content]").innerHTML = this.state.content;

    this.$target.appendChild(this.$editor);
    this.$target.appendChild(this.$subDocument);
  };
}
