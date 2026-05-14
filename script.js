let selectedItem,
itemTL,
overlayTL,
scrollTL,
isExpanded = false,
isAnimating = false; // 防止动画中重复触发

const timeline = document.querySelector(".timeline");
const items = document.querySelectorAll(".timeline-item");
const itemImages = document.querySelectorAll(".timeline-item > .timeline-photo");

const itemHeadlines = document.querySelectorAll(
".timeline-item > .timeline-headline");

const overlay = document.querySelector(".timeline-overlay");
const backButton = document.querySelector(".timeline-back");

// 初始化所有图片的占位符（保留布局）
function initializeImagePlaceholders() {
  items.forEach(item => {
    const photoImg = item.querySelector('.timeline-photo img');
    const contentImages = item.querySelectorAll('.timeline-content img');
    
    // 预加载列表页的封面图片（第一张，固定尺寸）
    if (photoImg && photoImg.src) {
      const preloadImg = new Image();
      preloadImg.src = photoImg.src;
    }
    
    // 设置内容区图片的占位符
    contentImages.forEach(img => {
      // 设置 aspect-ratio 保留空间，防止文字堆叠
      img.style.aspectRatio = '16 / 9';
      img.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      // 重置 opacity 以便 CSS 动画生效
      img.style.opacity = '0';
      
      // 为内容区的第一张图片预加载（重点优化手机端）
      if (img === contentImages[0] && img.src) {
        const preloadImg = new Image();
        preloadImg.src = img.src;
      }
    });
  });
}

// 图片缓存和预加载策略 - 主动加载而不是预读
function preloadImageOnExpand(id) {
  const item = document.querySelector(`[data-timeline=${id}]`);
  if (item) {
    const images = item.querySelectorAll('.timeline-content img');
    images.forEach((img, index) => {
      // 优先加载前3张图片，使用高优先级
      if (index < 3) {
        // 创建一个隐藏的 Image 对象立即开始加载
        const preloadImg = new Image();
        preloadImg.src = img.src;
        preloadImg.onload = function() {
          // 图片加载完成后，更新 DOM 中的图片
          img.style.opacity = '0'; // 重置 opacity 以便动画生效
        };
      }
      
      // 为所有内容区图片使用 prefetch 作为备选
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'image';
      link.href = img.src;
      document.head.appendChild(link);
    });
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initializeImagePlaceholders();
  
  // 为所有图片添加 Intersection Observer，在即将进入视口时提前加载
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        // 提前 200px 开始加载
        if (img.dataset.preloaded !== 'true') {
          const preloadImg = new Image();
          preloadImg.onload = () => {
            img.dataset.preloaded = 'true';
          };
          preloadImg.src = img.src;
        }
      }
    });
  }, {
    rootMargin: '200px' // 提前 200px 加载
  });
  
  // 观察所有内容区的图片
  items.forEach(item => {
    const contentImages = item.querySelectorAll('.timeline-content img');
    contentImages.forEach(img => {
      imageObserver.observe(img);
    });
  });
});

for (item of items) {
  const randomId = Math.random().
  toString(36).
  replace(/[^a-z]+/g, "").
  substr(2, 10);
  item.setAttribute("data-timeline", randomId);

  // 点击图片直接进入
  const itemPhoto = item.querySelector(".timeline-photo");
  const readMoreBtn = itemPhoto.querySelector(".timeline-cta");
  
  // 统一处理点击事件（支持手机和电脑）
  function triggerExpand() {
    if (!isExpanded) {
      handleItemClick(randomId);
    }
  }
  
  // 点击事件
  itemPhoto.addEventListener("click", e => {
    e.preventDefault();
    triggerExpand();
  });

  // Hover 时显示提示（仅桌面端）
  itemPhoto.addEventListener("mouseover", e => {
    if (!isExpanded && readMoreBtn) {
      TweenMax.fromTo(
        readMoreBtn,
        0.3,
        { opacity: 0, scaleX: 0.5, scaleY: 0.1, y: -70 },
        { opacity: 1, scaleX: 1, scaleY: 1, y: -5, ease: Back.easeOut }
      );
    }
  });

  itemPhoto.addEventListener("mouseout", e => {
    if (!isExpanded && readMoreBtn) {
      TweenMax.to(readMoreBtn, 0.3, { opacity: 0, scaleX: 1, scaleY: 1, y: 100 });
    }
  });
  
  // 手机端 Touch 事件（防止二次触发）
  itemPhoto.addEventListener("touchstart", e => {
    // 在手机上，直接触发展开，不显示提示
    if (!isExpanded) {
      handleItemClick(randomId);
    }
  }, { passive: true });
}

function handleItemClick(id) {
  // 防止动画中重复触发
  if (isAnimating || isExpanded) {
    return;
  }
  
  isAnimating = true;
  
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
    
    // 先清除所有可能的残留样式
    items.forEach(it => {
      TweenMax.set(it, { clearProps: "all" });
    });
    TweenMax.set(timeline, { clearProps: "all" });
    TweenMax.set(itemHeadlines, { clearProps: "all" });
    
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
    
    // 内容平滑淡入 + 图片优雅加载动画
    fromTo(itemContent, 0.3, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.1");
    
    // 让每个内容项逐个出现，包括图片
    const contentElements = itemChildContents;
    contentElements.forEach((el, index) => {
      if (el.tagName === 'IMG') {
        // 图片：清除初始的 opacity: 0，让 CSS 动画接管
        itemTL.to(el, 0.01, { opacity: 0 }, "-=0.2" + (index * 0.08)).
                to(el, 0.5, { opacity: 1, y: 0 }, { ease: Power1.easeOut });
      } else {
        // 文字：正常淡入
        itemTL.fromTo(el, 0.25, { opacity: 0, y: 15 }, { opacity: 1, y: 0 }, "-=0.2" + (index * 0.08));
      }
    });
    
    // 动画完成后重置防护标志
    itemTL.call(() => {
      isAnimating = false;
    });
  }
}

backButton.addEventListener("click", () => {
  if (isExpanded && !isAnimating) {
    isAnimating = true;
    timeline.classList.remove("is-expanded");
    selectedItem.classList.remove("is-active");
    backButton.classList.remove("is-active");
    
    // 重置所有被修改的元素样式
    const itemHeadline = selectedItem.querySelector(".timeline-headline");
    const itemPhoto = selectedItem.querySelector(".timeline-photo");
    const itemContent = selectedItem.querySelector(".timeline-content");
    
    overlayTL = new TimelineMax({
      paused: false,
      onComplete: () => {
        itemTL.progress(0);
        itemTL.pause();
        
        // 完全清除所有 GSAP 修改的样式，恢复到初始状态
        TweenMax.set(selectedItem, { 
          clearProps: "all",
          height: "auto",
          width: "auto",
          margin: "10px 0",
          position: "relative"
        });
        
        TweenMax.set(itemPhoto, { 
          clearProps: "all",
          height: "100%",
          position: "relative",
          top: "auto"
        });
        
        TweenMax.set(itemHeadline, { 
          clearProps: "all",
          position: "absolute",
          top: "100%",
          width: "100%",
          height: "auto"
        });
        
        TweenMax.set(itemContent, { 
          clearProps: "all",
          display: "none"
        });
        
        // 清除所有 timeline-item 的样式，恢复初始状态
        items.forEach(item => {
          TweenMax.set(item, { 
            clearProps: "all",
            height: "30%",
            width: "40%",
            position: "relative",
            margin: "10px 0"
          });
        });
        
        // 清除 timeline 的样式
        TweenMax.set(timeline, { 
          clearProps: "all",
          maxWidth: "760px",
          paddingBottom: "100px"
        });
        
        // 重置所有 headlines
        TweenMax.set(itemHeadlines, { clearProps: "all" });
        
        // 最后淡入列表项
        TweenMax.staggerFromTo(
        items,
        0.4,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0 },
        0.03,
        () => {
          isExpanded = false;
          isAnimating = false;
        });
      } });

    // 平滑自然的关闭动画 - 总耗时 0.4s
    overlayTL.
    fromTo(overlay, 0.35, { height: 0, top: "100%" }, { height: "110vh", top: 0, ease: Power1.easeInOut }).
    to(overlay, 0.05, { height: 0, top: "100%", ease: Power1.easeInOut });
  }
});
