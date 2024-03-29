import { getItem, setItem } from "../../utils/storage.js";
import { SIDEBAR_LIST_STORAGE_KEY } from "../../utils/constants.js";
import { push } from "../../utils/router.js";

export default class SidebarList {
  constructor({ $target, initialState, deleteDocument, addDocument }) {
    this.$target = $target;
    this.state = initialState;

    this.$target.addEventListener("click", (e) => {
      const target = e.target.closest(".list-item");
      if (!target) return;

      const targetId = target.dataset.id;
      const targetClass = e.target.classList;

      if (targetClass.contains("document-delete-button")) {
        deleteDocument(targetId);
        history.replaceState(null, null, `/`);
      } else if (targetClass.contains("document-add-button")) {
        addDocument(targetId);
        this.toggleList(target);
      } else if (
        targetClass.contains("list-toggle-button") ||
        e.target.closest(".list-toggle-button")
      ) {
        this.toggleList(target);
      } else {
        target.classList.toggle("active");
        push(`/documents/${targetId}`);
      }
    });

    this.render();
  }

  setState = (nextState) => {
    this.state = nextState;
    this.render();
  };

  setTitle = (title) => {
    this.state = this.state.map((item) => {
      if (item.id === this.selectedItemId) {
        return {
          ...item,
          title,
        };
      }
      return item;
    });

    this.render();
  };

  //하위 문서 리스트 토글
  toggleList = (target) => {
    const expendedItem = getItem(SIDEBAR_LIST_STORAGE_KEY, []);
    const targetId = target.dataset.id;
    if (expendedItem.includes(targetId)) {
      setItem(
        SIDEBAR_LIST_STORAGE_KEY,
        expendedItem.filter((item) => item !== targetId)
      );
    } else setItem(SIDEBAR_LIST_STORAGE_KEY, [...expendedItem, targetId]);

    this.render();
  };

  renderList = (documentData) => {
    const { pathname } = window.location;
    const [, , postId] = pathname.split("/");

    let listHTML = `<ul>`;
    documentData.forEach(({ id, title, documents }) => {
      const hasSubList = documents && documents.length > 0;
      const expanded = getItem(SIDEBAR_LIST_STORAGE_KEY, []);
      const isOpened = expanded.includes(String(id));

      listHTML += this.listItem(id, title, parseInt(postId), isOpened);

      if (hasSubList && isOpened) {
        const subListHTML = this.renderList(documents);
        listHTML += `${subListHTML}`;
      } else if (!hasSubList && isOpened) {
        listHTML += `<div class="no-subpages">하위 페이지 없음</div>`;
      }
    });
    listHTML += `</ul>`;

    return listHTML;
  };

  renderSearchResults = (results) => {
    let searchResultsHTML = "<p>검색 결과</p>";
    for (const result of results) {
      searchResultsHTML += this.listItem(
        result.id,
        result.title,
        result.postId,
        false
      );
    }
    this.$target.innerHTML = searchResultsHTML;
  };

  listItem = (id, title, postId, isOpened) => {
    return `
    <li>
    <div class="list-item ${postId === id ? "active" : ""}" data-id="${id}">
      <div class="document-info">
        <div class="list-toggle-button">
          <img class="toggle-icon" src="/assets/arrow${
            isOpened ? "-down" : "-right"
          }.svg" alt="toggle">
        </div>
        <img class="document-icon" src="/assets/document.svg" alt="document">
        <span>${title}</span>
      </div>
      <div class="item-options">
        <img class="document-add-button" src="/assets/document-add.svg" alt="documentAdd">
        <img class="document-delete-button" src="/assets/delete.svg" alt="documentAdd">
      </div>
    </div>
  </li>
    `;
  };

  render = () => {
    this.$target.innerHTML = this.renderList(this.state);
  };
}
