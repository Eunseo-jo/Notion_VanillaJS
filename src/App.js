import { initRouter } from "./utils/router.js";
import Sidebar from "./component/Sidebar/Sidebar.js";
import Document from "./component/Document/Document.js";
import SidebarStore from "./stores/SidebarStore.js";
import DocumentStore from "./stores/DocumentStore.js";

export default class App {
  constructor({ $target }) {
    this.$target = $target;
    this.sidebarStore = new SidebarStore();
    this.documentStore = new DocumentStore();

    // 사이드바 컨테이너 생성
    this.$sidebarContainer = document.createElement("div");
    this.$sidebarContainer.className = "sidebar-container";

    // 문서 컨테이너 생성
    this.$documentContainer = document.createElement("div");
    this.$documentContainer.className = "document-container";

    this.sidebar = new Sidebar({
      $target: this.$sidebarContainer,
      sidebarStore: this.sidebarStore,
      clearDocument: this.clearDocument,
    });

    this.document = new Document({
      $target: this.$documentContainer,
      documentStore: this.documentStore,
      sidebarStore: this.sidebarStore,
    });

    // 뒤로 가기 했을 때 다시 렌더링
    window.addEventListener("popstate", () => this.route());

    this.route();
    initRouter(this.route);
  }

  // document Container 비우기
  clearDocument = () => {
    this.$documentContainer.innerHTML = "";
  };

  route = async () => {
    const { pathname } = window.location;

    // 문서 조회 시
    if (pathname.startsWith("/documents/")) {
      const data = await this.documentStore.fetchPost();
      if (data) {
        this.document.render();
      }
    }
    // home 일 때
    else {
      this.clearDocument();
    }

    this.sidebar.render();
    this.$target.appendChild(this.$sidebarContainer);
    this.$target.appendChild(this.$documentContainer);
  };
}
