import { fontColor } from "./textColorList.js";
import { textOptionList } from "./textOptionList.js";

// 텍스트 스타일 리스트
export const generateOptionList = () => {
  return textOptionList
    .map(
      ({ option, optionStyle, text }) => `
      <div class="text-option" data-option="${option}">
        <button style="${optionStyle}">${text}</button>
      </div>
    `
    )
    .join("");
};

// 텍스트 색상 리스트
export const generateColorList = () => {
  return `
  <div class="color-list">
  ${fontColor
    .map(
      ({ color, colorName }) => `
        <div class="color-option" data-color="${color}">
          <button style="color:${color};">A</button>
          <span>${colorName}</span>
        </div>`
    )
    .join("")}
    </div>
    `;
};

// 텍스트 스타일 설정
export const toggleTextStyle = (style) => {
  document.execCommand(style);
};

// 텍스트 색상 설정
export const setTextColor = (color) => {
  document.execCommand("styleWithCSS", false, true);
  document.execCommand("foreColor", false, color);
};
