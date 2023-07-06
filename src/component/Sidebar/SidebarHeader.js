export default class SidebarHeader {
  constructor({
    $target,
    onToggle,
    createNewDocument,
    searchAutoComplete,
    searchResults,
    pushToUrl,
  }) {
    this.$target = $target;
    this.pushToUrl = pushToUrl;

    // 사이드바 헤더
    this.$header = document.createElement("div");
    this.$header.classList.add("sidebar-header");

    // 새로운 문서 추가
    this.$newDocumentIcon = document.createElement("img");
    this.$newDocumentIcon.classList.add("new-button");
    this.$newDocumentIcon.src = "/assets/new-document.svg";

    this.$newDocumentIcon.addEventListener("click", () => {
      createNewDocument();
    });

    // 검색바 & 리스트 컨테이너
    this.$searchBarContainer = document.createElement("div");
    this.$searchBarContainer.classList.add("document-search-container");

    // 검색바
    this.$searchBar = document.createElement("input");
    this.$searchBar.classList.add("document-search-bar");
    this.$searchBar.placeholder = "검색할 문서 제목을 검색하세요!";
    this.$searchBar.addEventListener("input", (e) => {
      const keyword = e.target.value;
      // 자동 완성 리스트 가져오기
      const titleSuggestions = searchAutoComplete(keyword);
      if (titleSuggestions) this.renderTitleSuggestions(titleSuggestions);

      if (!keyword) {
        this.$suggestTitle.innerHTML = "";
      } else if (titleSuggestions) {
        this.renderTitleSuggestions(titleSuggestions);
      }

      // Sidebar로 키워드 보내주기
      searchResults(keyword);
    });

    // 자동완성 리스트 렌더링 보여주기 & 숨기기
    this.$searchBar.addEventListener("focus", () =>
      this.$searchBarContainer.classList.toggle("show")
    );
    this.$searchBar.addEventListener("blur", () =>
      this.$searchBarContainer.classList.toggle("show")
    );

    // 자동완성 리스트
    this.$suggestTitle = document.createElement("div");
    this.$suggestTitle.classList.add("search-suggestions");

    //사이드바 전체 토글
    this.$toggleButton = document.createElement("img");
    this.$toggleButton.classList.add("toggle-button");
    this.$toggleButton.src = "/assets/menu-close.svg";

    this.$toggleButton.addEventListener("click", () => {
      onToggle();
    });

    this.render();
  }

  // 자동완성 리스트 렌더링
  renderTitleSuggestions(titleSuggestions) {
    this.$suggestTitle.innerHTML = "";
    if (!titleSuggestions) return;
    for (const suggestion of titleSuggestions) {
      const suggestionElement = document.createElement("div");
      suggestionElement.classList.add("suggestion-list");
      suggestionElement.dataset.id = suggestion.id;
      suggestionElement.innerHTML = `<span>${suggestion.title}</span>`;

      this.$suggestTitle.appendChild(suggestionElement);
    }

    this.$suggestTitle.addEventListener("click", (event) => {
      console.log("event!!!!!");
      const clickedSuggestion = event.target.closest(".suggestion-list");
      if (clickedSuggestion) {
        const suggestionId = clickedSuggestion.dataset.id;
        //클릭한 문서로 이동하기
        this.pushToUrl(suggestionId);
      }
    });
  }
  // 전체 렌더링
  render = () => {
    this.$target.appendChild(this.$newDocumentIcon);
    this.$searchBarContainer.appendChild(this.$searchBar);
    this.$searchBarContainer.appendChild(this.$suggestTitle);
    this.$target.appendChild(this.$searchBarContainer);
    this.$target.appendChild(this.$toggleButton);
  };
}
