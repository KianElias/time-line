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

  // 点击图片直接进入
  const itemPhoto = item.querySelector(".timeline-photo");
  itemPhoto.addEventListener("click", e => {
    if (!isExpanded) {
      handleItemClick(randomId);
    }
  });

  // Hover 时显示提示
  itemPhoto.addEventListener("mouseover", e => {
    if (!isExpanded) {
      // 显示 READ MORE 按钮提示用户可点击
      const readMoreBtn = itemPhoto.querySelector(".timeline-cta");
      if (readMoreBtn) {
        TweenMax.fromTo(
          readMoreBtn,
          0.3,
          { opacity: 0, scaleX: 0.5, scaleY: 0.1, y: -70 },
          { opacity: 1, scaleX: 1, scaleY: 1, y: -5, ease: Back.easeOut }
        );
      }
    }
  });

  itemPhoto.addEventListener("mouseout", e => {
    if (!isExpanded) {
      // 隐藏 READ MORE 按钮
      const readMoreBtn = itemPhoto.querySelector(".timeline-cta");
      if (readMoreBtn) {
        TweenMax.to(readMoreBtn, 0.3, { opacity: 0, scaleX: 1, scaleY: 1, y: 100 });
      }
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
	
    for (_i of items) {_i.classList.remove("is-active");}
    timeline.classList.add("is-expanded");
    item.classList.add("is-active");
    backButton.classList.add("is-active");
    itemTL = new TimelineMax({ paused: false });

    // 平滑自然的展开动画 - 总耗时 0.5s
    itemTL.
    set(timeline, { maxWidth: 760 }).
    set(items, { clearProps: "all" }).
    set(itemSubTitle, { clearProps: "all" }).
    set(itemPhoto, { clearProps: "all" }).
    set(itemHeadline, { clearProps: "all" }).
    set(itemExcerpt, { display: "none" }).
    set(unSelectedItems, { display: "none" }).
    set(itemContent, { display: "block", top: 100 }).
    set(window, { scrollTo: { y: 0 } }).
    add("expandStart").
    
    // 阶段1：平滑扩展 + 淡出其他项 (0.4s)
    to(timeline, 0.05, { maxWidth: "100%" }, "expandStart").
    to(item, 0.4, { y: itemOffsetTop, width: "100%", height: "100vh" }, "expandStart").
    to(itemPhoto, 0.4, { borderRadius: 0, height: "100vh" }, "expandStart").
    to(itemHeadline, 0.4, { top: 0, height: "100vh", padding: 0, opacity: 1 }, "expandStart").
    to(itemCTA, 0.2, { opacity: 0 }, "expandStart").
    to(unSelectedItems, 0.2, { opacity: 0 }, "expandStart").
    
    // 阶段2：内容淡入 + 顶部栏缩小 (0.3s，与前面重叠 0.1s)
    to(itemPhoto, 0.25, { height: 100, position: "fixed", top: 0 }, "-=0.1").
    to(itemHeadline, 0.25, { 
      height: 100, 
      opacity: 1, 
      fontSize: "calc(.4vw + 10px)", 
      backgroundColor: "rgba(45, 45, 45, 0.8)"
    }, "-=0.25").
    set(itemHeadline, { position: "fixed", top: 0 }, "-=0.15").
    set(item, { y: 0, height: "auto", marginTop: 0, clearProps: "transform" }, "-=0.15").
    set(timeline, { paddingBottom: 0 }, "-=0.15").
    
    // 内容平滑淡入
    fromTo(itemContent, 0.3, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.1").
    staggerFromTo(itemChildContents, 0.25, { opacity: 0, y: 15 }, { opacity: 1, y: 0 }, 0.05, "-=0.2");
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
        0.4,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0 },
        0.03,
        () => {
          isExpanded = false;
        });

        TweenMax.set(itemHeadlines, { clearProps: "all" });
      } });

    // 平滑自然的关闭动画 - 总耗时 0.4s
    overlayTL.
    fromTo(overlay, 0.35, { height: 0, top: "100%" }, { height: "110vh", top: 0, ease: Power1.easeInOut }).
    to(overlay, 0.05, { height: 0, top: "100%", ease: Power1.easeInOut });
  }
});
