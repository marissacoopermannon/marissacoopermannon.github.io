let sizingUp = false;
let quickEntry = false;

const themeColors = [
  "#005A46",
  "#4F314C",
  "#621728",
  "#1B2138",
  "#B67432"
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function drawRightSpotlightEdgePoints(spotlight, canvas) {
  const cxD = spotlight.xPos;
  const cyD = canvas.height - spotlight.yPos;

  const lc = Math.sqrt(((canvas.width - cxD) ** 2) + (cyD ** 2));
  const la = Math.sqrt((lc ** 2) - (spotlight.size ** 2));

  const theta = Math.acos(la / lc);
  const beta = Math.atan(cyD / (canvas.width - cxD));

  const y = la * Math.sin(theta + beta);
  const x = canvas.width - (la * Math.cos(theta + beta));

  const yB = la * Math.sin(beta - theta);
  const xB = canvas.width - (la * Math.cos(beta - theta));

  return {
    p1: {
      xPos: x,
      yPos: canvas.height - y
    },
    p2: {
      xPos: xB,
      yPos: canvas.height - yB
    }
  };
}

function getLeftSpotlightEdgePoints(spotlight, canvas) {
  const cxD = spotlight.xPos;
  const cyD = canvas.height - spotlight.yPos;

  const lc = Math.sqrt((cxD ** 2) + (cyD ** 2));
  const la = Math.sqrt((lc ** 2) - (spotlight.size ** 2));

  const theta = Math.acos(la / lc);
  const beta = Math.atan(cyD / cxD);

  const y = la * Math.sin(theta + beta);
  const x = la * Math.cos(theta + beta);

  const yB = la * Math.sin(beta - theta);
  const xB = la * Math.cos(beta - theta);

  return {
    p1: {
      xPos: x,
      yPos: canvas.height - y
    },
    p2: {
      xPos: xB,
      yPos: canvas.height - yB
    }
  };
}

function getSpotlightEdgePoints2(spotlight, canvas) {
  const cxD = spotlight.xPos;
  const cyD = canvas.height - spotlight.yPos;

  const lc = Math.sqrt((cxD ** 2) + (cyD ** 2));
  const la = Math.sqrt((lc ** 2) - (spotlight.size ** 2));

  const theta = Math.acos(la / lc);
  const beta = Math.atan(cyD / cxD);

  const y = la * Math.sin(theta + beta);
  const x = la * Math.cos(theta + beta);

  const ctxx = canvas.getContext("2d");
  ctxx.globalCompositeOperation = 'destination-out';
  ctxx.beginPath();
  ctxx.arc(x, canvas.height - y, 20, 0, 2 * Math.PI);
  ctxx.fillStyle = "rgba(255, 0, 0, .5)";
  ctxx.fill();
}

function lineCircleIntersection(ox, oy, sx, sy, cx, cy, r) {
    // Step 1: Calculate the slope of the line
    const m = (sy - oy) / (sx - ox);

    // Step 2: Determine the y-intercept (c) of the line
    const c = oy - m * ox;

    // Step 3: Calculate the coefficients of the quadratic equation
    const A = 1 + m * m;
    const B = 2 * (m * c - m * cy - cx);
    const C = cx * cx + cy * cy + c * c - 2 * c * cy - r * r;

    // Step 4: Solve the quadratic equation
    const discriminant = B * B - 4 * A * C;
    if (discriminant < 0) {
        // No real roots, no intersection
        return [];
    }

    const x1 = (-B + Math.sqrt(discriminant)) / (2 * A);
    const x2 = (-B - Math.sqrt(discriminant)) / (2 * A);

    // Step 5: Calculate the y-coordinates of the intersection points
    const y1 = m * x1 + c;
    const y2 = m * x2 + c;

    // Step 6: Check if the intersection points are within the range of the line segment
    const points = [];
    if (x1 >= Math.min(ox, sx) && x1 <= Math.max(ox, sx)) {
        points.push({ x: x1, y: y1 });
    }
    if (x2 >= Math.min(ox, sx) && x2 <= Math.max(ox, sx)) {
        points.push({ x: x2, y: y2 });
    }

    return points;
}

function fromOrigin(spotlight, c, x1, y1c) {
  const r = spotlight.size;
  const cx = spotlight.xPos;
  const cy = spotlight.yPos;
  const y1 = y1c;

  const x = Math.sqrt(r * r - ((y1 / x1) - cy) ** 2) + cx;
  const y = (y1 / x1) * x;

  c.beginPath()
  c.arc(x, y, 10, 0, Math.PI * 2);
  c.fillStyle = "rgb(255, 0, 0)";
  c.fill();

  return { xPos: x, yPos: y };
}

function getSpotlightEdgePoints(spotlight, c) {
  const originPoint = spotlight.originPoint;
  const dx = spotlight.xPos - originPoint.xPos;
  const dy = spotlight.yPos - originPoint.yPos;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const theta = Math.atan2(dy, dx);
  const beta = Math.asin(spotlight.size / distance);

  const x1 = distance * Math.cos(theta + beta);
  const y1 = distance * Math.sin(theta + beta);

  const x2 = distance * Math.cos(theta - beta);
  const y2 = distance * Math.sin(theta - beta);

  fromOrigin(spotlight, c, originPoint.xPos + x1, originPoint.yPos + y1);

  return {
    topPoint: {
      xPos: originPoint.xPos + x1,
      yPos: originPoint.yPos + y1
    },
    bottomPoint: {
      xPos: originPoint.xPos + x2,
      yPos: originPoint.yPos + y2
    }
  };
}

function drawSpotlight2(canvas, spotlight) {
  const originPoint = spotlight.originPoint;

  const ctxx = canvas.getContext("2d");
  ctxx.globalCompositeOperation = 'destination-out';
  ctxx.beginPath();
  ctxx.arc(spotlight.xPos, spotlight.yPos, spotlight.size, 0, 2 * Math.PI);
  ctxx.fillStyle = "rgba(0, 0, 0, .7)";
  ctxx.fill();

  let edgePoints = {};
  let sAngle, eAngle;

  if (spotlight.originPoint.xPos === 0) {
    edgePoints = getLeftSpotlightEdgePoints(spotlight, canvas);
    sAngle = Math.acos((edgePoints.p1.xPos - spotlight.xPos) / spotlight.size);
    eAngle = Math.acos((edgePoints.p2.xPos - spotlight.xPos) / spotlight.size);
  } else {
    edgePoints = drawRightSpotlightEdgePoints(spotlight, canvas);
    sAngle = Math.acos((edgePoints.p1.xPos - spotlight.xPos) / spotlight.size);
    eAngle = Math.acos((edgePoints.p2.xPos - spotlight.xPos) / spotlight.size);
  }

  ctxx.beginPath();
  ctxx.moveTo(originPoint.xPos, originPoint.yPos);

  ctxx.lineTo(edgePoints.p1.xPos, edgePoints.p1.yPos);

  ctxx.arc(spotlight.xPos, spotlight.yPos, spotlight.size, sAngle || 0, eAngle || 2 * Math.PI, spotlight.originPoint.xPos != 0);
  ctxx.lineTo(edgePoints.p2.xPos, edgePoints.p2.yPos);
  ctxx.lineTo(originPoint.xPos, originPoint.yPos);
  ctxx.fillStyle = "rgba(0, 0, 0, .5)";
  ctxx.fill();
}

function generateSpotlight(c, l) {
  return {
    xPos: Math.random() * c.width,
    yPos: Math.random() * c.height,
    size: c.width > 700 ? 140 : 50,
    xUp: Math.random() > .5,
    yUp: Math.random() > .5,
    xSpeed: c.width > 700 ? 5 + Math.random() * 2 : 2 + Math.random(),
    ySpeed: c.width > 700 ? 5 + Math.random() * 2 : 2 + Math.random(),
    originPoint: {
      xPos: l ? 0 : c.width,
      yPos: c.height
    }
  }
}

function moveSpotlight(c, spotty) {
  if (spotty.xUp) {
    spotty.xPos += spotty.xSpeed;
    if (spotty.xPos > c.width - 10) {
      spotty.xUp = false;
    }
  } else {
    spotty.xPos -= spotty.xSpeed;
    if (spotty.xPos < 10) {
      spotty.xUp = true;
    }
  }

  if (spotty.yUp) {
    spotty.yPos += spotty.ySpeed;
    if (spotty.yPos > c.height - 10) {
      spotty.yUp = false;
    }
  } else {
    spotty.yPos -= spotty.ySpeed;
    if (spotty.yPos < 10) {
      spotty.yUp = true;
    }
  }

  if (sizingUp) {
    spotty.size = spotty.size*1.005;
    c.style.opacity = 1 - (spotty.size / 4000);
    if (spotty.size > 2700) {
      endSpotlights();
    }
  }
}

const spotlights = [];
let warmUpId = null;
let spotlightsIntervalId = null;

function setCanvasSize(c) {
  const viewport = window.visualViewport;
  const scale = viewport ? viewport.scale : 1;
  const viewportWidth = viewport ? viewport.width * scale : window.innerWidth;
  const viewportHeight = viewport ? viewport.height * scale : window.innerHeight;

  c.width = viewportWidth;
  c.height = viewportHeight;
}

function startSpotlights(c, ctx) {
  clearInterval(warmUpId);
  
  setCanvasSize(c);
  
  const leftSpotlight = generateSpotlight(c, true);
  spotlights.push(leftSpotlight);

  const rightSpotlight = generateSpotlight(c, false);
  spotlights.push(rightSpotlight);

  spotlightsIntervalId = setInterval(() => {
    setCanvasSize(c);
    ctx.fillStyle = "rgba(0, 0, 0, .8)";
    ctx.fillRect(0, 0, c.width, c.height);
  
    for (let i = 0; i < spotlights.length; i++) {
      let currentSpot = spotlights[i];
      drawSpotlight2(c, currentSpot);
      moveSpotlight(c, currentSpot);
    }
  }, 5);
}

function endSpotlights() {
  clearInterval(spotlightsIntervalId);
  const c = document.getElementById("myCanvas");
  c.style.display = "none";
  document.querySelector(".overlay").style.display = "none";
}

function enter() {
  let alphaVal = quickEntry ? .002 : 1;
  const overlay = document.querySelector(".overlay");
  const openingEl = document.querySelector(".opening");

  // buttonEl.style.display = "none";
  // overlay.style.display = "none";
  // endSpotlights();

  warmUpId = setInterval(() => {
    alphaVal -= 0.004;
    openingEl.style.opacity = alphaVal;
    overlay.style.background = `rgba(0, 0, 0, ${alphaVal})`;
    if (alphaVal <= 0) {
      openingEl.style.zIndex = -1;
      sizingUp = true;
      clearTimeout(warmUpId);
      if (quickEntry) {
        endSpotlights();
      }
    }
  }, 1);
}

let currentScrollerTimeout = null;

document.addEventListener("DOMContentLoaded", () => {
  const c = document.getElementById("myCanvas");
  const ctx = c.getContext("2d");

  document.body.style.backgroundColor = "black";
  document.body.style.backgroundImage = "url(smallstars.gif)";
  document.body.style.backgroundSize = "500px";
  document.querySelector("#everything").style.display = "flex";
  startSpotlights(c, ctx);

  const ticketLinks = document.querySelectorAll(".ticket-link");
  const detailsTicket = document.querySelector("#ticket-details");
  detailsTicket.scrollIntoView({
    block: "center",
    inline: "center"
  });

  for (tl of ticketLinks) {
    tl.addEventListener("click", e => {
      clearTimeout(currentScrollerTimeout);
      scrollIndicator.querySelectorAll("path").forEach(p => {
        p.style.transition = "0s";
        p.style.stroke = "#00000000";
      });

      let clicked = e.target.parentElement;
      while (clicked.tagName !== "DIV") {
        clicked = clicked.parentElement;
      }

      const pageForLinkId = `#page-${clicked.id.split("ticket-")[1]}`;
      const pages = document.querySelectorAll(".page");

      for (currentTl of ticketLinks) {
        currentTl.classList.remove("selected")
      }

      clicked.classList.add("selected");
      clicked.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center"
      });

      for (page of pages) {
        page.classList.remove("main-selected");
      }

      const newSelectedPage = document.querySelector(`#page-${clicked.id.split("ticket-")[1]}`);
      newSelectedPage.classList.add("main-selected");

      let prevColor = null;
      newSelectedPage.querySelectorAll("div.box").forEach(d => {
        let newColor = pickRandom(themeColors);
        while (newColor == prevColor) {
          newColor = pickRandom(themeColors);
        }

        d.style.backgroundColor = newColor;
        prevColor = newColor;
      });
      

      let hasScrolled = false;
      

      // Detect user scroll
      newSelectedPage.addEventListener('scroll', function() {
        hasScrolled = true;
        document.querySelector('.scroll-indicator').querySelectorAll("path").forEach(p => p.style.stroke = "#00000000");
      });

      currentScrollerTimeout = setTimeout(function() {
        let mainSelected = document.querySelector('.main-selected');
        if (!hasScrolled && isScrollable(mainSelected)) {
          scrollIndicator.querySelectorAll("path").forEach(p => {
            p.style.transition = "1s";
            p.style.stroke = "#FFFFFFFF";
          });
          scrollIndicator.addEventListener('click', scrollToNext);
        }
      }, 5000);
    });
  }

  const weddingPartyCards = document.querySelectorAll(".full-card");

  for (card of weddingPartyCards) {
    card.addEventListener("click", e => {
      e.target.closest(".full-card").classList.toggle("flipped");
    });
  }

  const scrollIndicator = document.querySelector('.scroll-indicator');
  const mainSelected = document.querySelector('.main-selected');

  // Check if the content is scrollable
  function isScrollable(element) {
    return element.scrollHeight > element.clientHeight;
  }

  // Scroll the .main-selected div
  function scrollToNext() {
    const mainSelected = document.querySelector('.main-selected');
    if (isScrollable(mainSelected)) {
      mainSelected.scrollBy({ top: mainSelected.clientHeight / 2, behavior: 'smooth' });
      mainSelected.focus();
    }

    document.querySelector('.scroll-indicator').querySelectorAll("path").forEach(p => p.style.stroke = "#00000000");
  }

  // Detect user scroll
  mainSelected.addEventListener('scroll', function() {
    hasScrolled = true;
    document.querySelector('.scroll-indicator').querySelectorAll("path").forEach(p => p.style.stroke = "#00000000");
  });

});

function secretEntrance() {
  enter();
}
