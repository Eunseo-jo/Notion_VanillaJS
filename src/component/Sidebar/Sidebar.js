import { getItem, setItem } from "../../utils/storage.js";
import { SIDEBAR_TOGGLE_STORAGE_KEY } from "../../utils/constants.js";
import { push } from "../../utils/router.js";
import SidebarHeader from "./SidebarHeader.js";
import SidebarList from "./SidebarList.js";

export default class Sidebar {
  constructor({ $target, sidebarStore, clearDocument }) {
    this.$target = $target;
    this.sidebarStore = sidebarStore;

    this.$headerContainer = document.createElement("div");
    this.$headerContainer.classList.add("header-container");

    this.sidebarHeader = new SidebarHeader({
      $target: this.$headerContainer,
      onToggle: this.toggleSidebar,
      createNewDocument: this.createNewDocument,
      searchAutoComplete: this.sidebarStore.searchAutoComplete,
      searchResults: this.updateSearchResults,
      pushToUrl: (url) => push(url),
    });

    this.$sidebarList = document.createElement("div");
    this.$sidebarList.classList.add("sidebar-list");

    this.sidebarList = new SidebarList({
      $target: this.$sidebarList,
      initialState: [],
      sidebarStore: this.sidebarStore,

      addDocument: async (id) => {
        const resId = await this.sidebarStore.addSubDocument(id);
        if (resId) {
          push(`/documents/${resId}`);
          this.setState();
        }
      },

      deleteDocument: async (id) => {
        const { pathname } = window.location;
        const [, , postId] = pathname.split("/");

        if (await this.sidebarStore.deleteDocument(id)) {
          if (postId === id) {
            history.replaceState(null, null, `/`);
            clearDocument();
          }
          this.setState();
        }
      },

      setActiveItem: (itemId) => {
        const listItems = this.$sidebarList.querySelectorAll(".list-item");
        listItems.forEach((item) => {
          const isActive = item.dataset.id === itemId;

          if (isActive) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
      },
    });

    // 새로운 문서 생성 버튼
    this.newBtn = document.createElement("button");
    this.newBtn.className = "new-document";
    this.newBtn.innerText = "+ Create New Document";

    this.newBtn.addEventListener("click", async (e) => {
      this.createNewDocument();
    });

    this.sidebarStore.subscribe(this.updateTitle);
    this.setState();
  }

  // 검색 결과로 사이드바 렌더링
  updateSearchResults = (keyword) => {
    const trimmedKeyword = keyword.trim();
    // 전체 리스트 렌더링
    if (trimmedKeyword === "") {
      this.sidebarList.setState(this.sidebarStore.state.sidebarData);
    }
    // 검색 결과 렌더링
    else {
      const results = this.sidebarStore.searchResults(trimmedKeyword);
      this.sidebarList.renderSearchResults(results);
    }
  };

  // 새로운 문서 API 호출
  createNewDocument = async () => {
    const newId = await this.sidebarStore.addNewDocument();
    if (newId) {
      push(`/documents/${newId}`);
      this.setState();
    }
  };

  //사이드바 전체 숨기기 & 보여지기
  toggleSidebar = () => {
    const isFolded = this.$target.classList.contains("fold-sidebar");
    setItem(SIDEBAR_TOGGLE_STORAGE_KEY, isFolded);
    this.$target.classList.toggle("fold-sidebar");
    this.render();
  };

  // 제목 수정 시 사이드바 재렌더링
  updateTitle = () => {
    this.setState();
  };

  setState = async () => {
    await this.sidebarStore.setInitialState();
    this.sidebarList.setState(this.sidebarStore.state.sidebarData);
    this.render();
  };

  render = () => {
    const sidebarState = getItem(SIDEBAR_TOGGLE_STORAGE_KEY, true);
    this.$target.innerHTML = "";
    this.sidebarList.render();

    // 사이드바가 열려 있을 때
    if (sidebarState) {
      this.$target.appendChild(this.$headerContainer);
      this.$target.appendChild(this.$sidebarList);
      this.$target.appendChild(this.newBtn);
    }
    // 사이드바가 닫혀 있을 때
    else {
      const $toggleButton = document.createElement("img");
      $toggleButton.classList.add("toggle-button");
      $toggleButton.src = "/assets/menu-open.svg";
      $toggleButton.addEventListener("click", this.toggleSidebar);

      this.$target.appendChild($toggleButton);
      this.$target.classList.add("fold-sidebar");
    }
  };
}
