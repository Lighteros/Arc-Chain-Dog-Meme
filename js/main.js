(() => {
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("nav-toggle");
  const caChip = document.querySelector(".ca-chip");
  const caStatus = document.getElementById("ca-status");
  const addArc = document.getElementById("add-arc");
  const bloom = document.getElementById("cursor-bloom");
  const canvas = document.getElementById("night-field");
  const banner = document.querySelector(".join-banner");
  const magnetTargets = document.querySelectorAll(".buy-btn, .ghost-btn, .icon-btn");

  const CA = "0x5e613a6578b531F99A5E39e2dC127b485B57d588";
  const BUY = "https://app.uniswap.org/swap?chain=arc&outputCurrency=" + CA;

  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });

  window.addEventListener("scroll", () => {
    nav.classList.toggle("compact", window.scrollY > 18);
  }, { passive: true });

  window.addEventListener("pointermove", (event) => {
    bloom.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  }, { passive: true });

  const copyValue = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      window.prompt("Copy contract address", value);
    }
  };

  caChip.addEventListener("click", async () => {
    await copyValue(caChip.getAttribute("data-copy") || CA);
    caStatus.textContent = "Copied";
    window.setTimeout(() => {
      caStatus.textContent = "Copy";
    }, 1600);
  });

  addArc.addEventListener("click", async () => {
    if (!window.ethereum) {
      window.open(BUY, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x13b2",
          chainName: "Arc",
          nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
          rpcUrls: ["https://rpc.mainnet.arc.io"],
          blockExplorerUrls: ["https://explorer.arc.io"]
        }]
      });
    } catch (error) {
      console.warn(error);
    }
  });

  magnetTargets.forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const rect = node.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
      node.style.transform = `translate(${x}px, ${y}px)`;
    });
    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });

  if (banner) {
    banner.addEventListener("pointermove", (event) => {
      const rect = banner.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 6;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
      banner.style.transform = `rotateX(${-y}deg) rotateY(${x}deg)`;
    });
    banner.addEventListener("pointerleave", () => {
      banner.style.transform = "";
    });
  }

  const ctx = canvas.getContext("2d");
  const motes = [];
  const ripples = [];
  let width = 0;
  let height = 0;
  let tick = 0;

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    motes.length = 0;
    const count = Math.min(90, Math.floor(width / 18));
    for (let i = 0; i < count; i += 1) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.3,
        s: Math.random() * 0.35 + 0.08,
        a: Math.random() * 0.35 + 0.08,
        c: Math.random() > 0.86 ? "200,30,58" : "215,236,255"
      });
    }
  };

  const spawnRipple = () => {
    ripples.push({
      x: Math.random() * width,
      y: height * (0.35 + Math.random() * 0.35),
      r: 8,
      a: 0.22
    });
  };

  const draw = () => {
    tick += 1;
    ctx.clearRect(0, 0, width, height);

    motes.forEach((mote) => {
      mote.y -= mote.s;
      mote.x += Math.sin((tick + mote.y) * 0.01) * 0.25;
      if (mote.y < -10) {
        mote.y = height + 10;
        mote.x = Math.random() * width;
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(${mote.c},${mote.a})`;
      ctx.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (tick % 90 === 0) spawnRipple();

    for (let i = ripples.length - 1; i >= 0; i -= 1) {
      const ripple = ripples[i];
      ripple.r += 1.4;
      ripple.a -= 0.0025;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(126,200,255,${Math.max(ripple.a, 0)})`;
      ctx.lineWidth = 1.2;
      ctx.ellipse(ripple.x, ripple.y, ripple.r * 1.8, ripple.r * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (ripple.a <= 0) ripples.splice(i, 1);
    }

    window.requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize);
})();
