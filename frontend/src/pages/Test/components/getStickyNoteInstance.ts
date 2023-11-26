import { fabric } from "fabric";

const MEMO_COLOR = {
  "memo-yellow": "#FEE490",
  "memo-border-yellow": "#F2C947"
};

export const getStickyNoteInstance = (mousePositionX: number, mousePositionY: number) => {
  const note = new fabric.Rect({
    left: mousePositionX,
    top: mousePositionY,
    width: 200,
    height: 150,
    fill: MEMO_COLOR["memo-yellow"],
    stroke: MEMO_COLOR["memo-border-yellow"],
    strokeWidth: 1
  });

  const text = new fabric.Textbox("텍스트 내용\n텍스트 내용텍스트", {
    left: mousePositionX + 10,
    top: mousePositionY + 10,
    width: 180,
    fill: "black",
    fontSize: 18,
    splitByGrapheme: true
  });

  const stickyMemo = new fabric.Group([note, text]);

  stickyMemo.set("name", "stickyMemo");

  return stickyMemo;
};