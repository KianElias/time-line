let selectedItem,
itemTL,
overlayTL,
scrollTL,
isExpanded = false;

const timeline = document.querySelector(".timeline");
const items = document.querySelectorAll(".timeline-item");
const itemImages = document.querySelectorAll(".timeline-item > .timeline-photo");

const itemHeadlines = document.querySelectorAll(
".timeline-item > .timeline-headline");

const overlay = document.querySelector(".timeline-overlay");
const backButton = document.querySelector(".timeline-back");

// 图片缓存和预加载策略
function preloadImageOnExpand(id) {
  const item = document.querySelector(`[data-timeline=${id}]`);
  if (item) {
    const images = item.querySelectorAll('.timeline-content img');
    images.forEach((img, index) => {
      // 预加载即将显示的图片
      if (index < 3) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'image';
        link.href = img.src;
        document.head.appendChild(link);
      }
    });
  }
}

for (item of items) {
  const randomId = Math.random().
  toString(36).
  replace(/[^a-z]+/g, "").
  substr(2, 10);
  item.setAttribute("data-timeline", randomId);

  item.addEventListener("click", e => {
    handleItemClick(randomId);
  });

  // 移除不必要的 hover 放大动画
  item.addEventListener("mouseover", e => {
    if (!isExpanded && e.target.tagName === "IMG") {
      // 仅显示 READ MORE 按钮，不放大图片
      e.target.parentNode.children.length > 1 &&
      TweenMax.fromTo(
      e.target.parentNode.children[1],
      0.3,
      { opacity: 0, scaleX: 0.5, scaleY: 0.1, y: -70 },
      { opacity: 1, scaleX: 1, scaleY: 1, y: -5, ease: Back.easeOut });
    }
  });

  item.addEventListener("mouseout", e => {
    if (!isExpanded && e.target.tagName === "IMG") {
      e.target.parentNode.children.length > 1 &&
      TweenMax.to(
      e.target.parentNode.children[1],
      0.3,
      { opacity: 0, scaleX: 1, scaleY: 1, y: 100 });
    }
  });
}

function handleItemClick(id) {
  if (overlayTL !== undefined) {
    overlayTL.progress(0);
    overlayTL.pause();
  }

  if (!isExpanded) {
    isExpanded = true;
    // 预加载点击项的图片
    preloadImageOnExpand(id);
    
    const item = document.querySelector(`[data-timeline=${id}]`);
    const itemHeadline = item.querySelector(".timeline-headline");
    const itemSubTitle = item.querySelector(".timeline-subtitle");
    const itemContent = item.querySelector(".timeline-content");
    const itemPhoto = item.querySelector(".timeline-photo");
    const itemCTA = item.querySelector(".timeline-cta");
    const itemExcerpt = item.querySelector(".timeline-excerpt");
    const itemChildContents = document.querySelectorAll(`[data-timeline=${id}] .timeline-content > *`);
    const itemPhotoImg = itemPhoto.querySelector("img");
    const unSelectedItems = document.querySelectorAll(`[data-timeline]:not([data-timeline=${id}])`);
    const unSelectedChildItems = document.querySelectorAll(`[data-timeline]:not([data-timeline=${id}]) > *:not(.timeline-photo)`);
    const itemOffsetTop = item.getBoundingClientRect().y * -1;
    selectedItem = item;
	
    // 快速隐藏其他项和 READ MORE 按钮
    TweenMax.to(itemCTA, 0.2, { opacity: 0 });
    TweenMax.to(unSelectedItems, 0.15, { opacity: 0 });

    for (_i of items) {_i.classList.remove("is-active");}
    timeline.classList.add("is-expanded");
    item.classList.add("is-active");
    backButton.classList.add("is-active");
    itemTL = new TimelineMax({ paused: false });

    // 快速展开动画 - 总耗时 0.4s
    itemTL.
    set(timeline, { maxWidth: 760 }).
    set(items, { clearProps: "all" }).
    set(itemSubTitle, { clearProps: "all" }).
    set(itemPhoto, { clearProps: "all" }).
    set(itemHeadline, { clearProps: "all" }).
    set(itemExcerpt, { display: "none" }).
    add("itemExpand").
	
    // 第1阶段：快速扩展到全屏 (0.35s)
    to(timeline, 0.08, { maxWidth: "100%" }, "itemExpand").
    to(item, 0.35, { y: itemOffsetTop, width: "100%", height: "100vh" }, "itemExpand").
    to(itemPhoto, 0.35, { borderRadius: 0, height: "100vh" }, "itemExpand").
    to(itemHeadline, 0.35, { top: 0, height: "100vh", padding: 0, opacity: 1 }, "itemExpand").
    add("showContent", "+=0.05").
    
    // 第2阶段：显示内容 (0.25s)
    set(itemPhoto, { height: 100, position: "fixed", top: 0 }, "showContent").
    set(itemHeadline, { position: "fixed", top: 0, height: 100, opacity: 1, fontSize: "calc(.4vw + 10px)", backgroundColor: "rgba(45, 45, 45, 0.8)" }, "showContent").
    set(item, { y: 0, height: "auto", marginTop: 0, clearProps: "transform" }, "showContent").
    set(unSelectedItems, { display: "none" }, "showContent").
    set(timeline, { paddingBottom: 0 }, "showContent").
    set(itemContent, { display: "block", top: 100 }, "showContent").
    set(window, { scrollTo: { y: 0 } }, "showContent").
    fromTo(itemContent, 0.2, { opacity: 0 }, { opacity: 1 }, "showContent");
  }
}

backButton.addEventListener("click", () => {
  if (isExpanded) {
    timeline.classList.remove("is-expanded");
    selectedItem.classList.remove("is-active");
    backButton.classList.remove("is-active");
    overlayTL = new TimelineMax({
      paused: false,
      onComplete: () => {
        itemTL.progress(0);
        itemTL.pause();
        TweenMax.staggerFromTo(
        items,
        0.3,
        { opacity: 0 },
        { opacity: 1 },
        0.02,
        () => {
          isExpanded = false;
        });

        TweenMax.set(itemHeadlines, { clearProps: "all" });
      } });

    // 快速关闭动画 - 总耗时 0.3s
    overlayTL.
    to(selectedItem, 0, { opacity: 0 }).
    to(overlay, 0, { height: "110vh", ease: Expo.easeOut }, "+=0.15").
    to(overlay, 0.15, { height: 0, top: "100%", ease: Expo.easeOut });
  }
});
