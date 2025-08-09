function Slidezy(selector, options = {}) {
    this.container = document.querySelector(selector);

    if (!this.container) {
        console.error(`Slidezy: Container "${selector}" not found!`);
        return;
    }

    this.opt = Object.assign(
        {
            items: 1,
            speed: 300,
            loop: true,
            nav: true,
            autoPlay: false,
        },
        options
    );
    this.slides = Array.from(this.container.children);

    this._init();

    this._updatePosition();
}

Slidezy.prototype._init = function () {
    this.container.classList.add("slidezy-wrapper");

    // createTrack
    this._createTrack();

    // buttons
    this._createButtons();

    // navigation
    this._createNavigation();
};

Slidezy.prototype._createTrack = function () {
    this.track = document.createElement("div");
    this.track.className = "slidezy-track";

    if (this.opt.loop) {
        const cloneHead = this.slides
            .slice(-this.opt.items)
            .map((clone) => clone.cloneNode(true));

        const cloneTail = this.slides
            .slice(0, this.opt.items)
            .map((clone) => clone.cloneNode(true));

        this.slides = cloneHead.concat(this.slides.concat(cloneTail));
    }

    this.slides.forEach((slide, index) => {
        slide.classList.add("slidezy-slide");
        slide.style.flexBasis = `${100 / this.opt.items}%`;
        this.track.append(slide);
    });

    this.container.append(this.track);
};

Slidezy.prototype._createButtons = function () {
    this.nextBtn = document.createElement("button");
    this.preBtn = document.createElement("button");

    this.preBtn.className = "slidezy-pre";
    this.nextBtn.className = "slidezy-next";

    this.nextBtn.innerHTML = "&#10095";
    this.preBtn.innerHTML = "&#10094";

    this.container.append(this.nextBtn, this.preBtn);

    this.currentStep = this.opt.loop ? this.opt.items : 0;

    // events
    this.preBtn.onclick = () => this.moveSlide(-1);
    this.nextBtn.onclick = () => this.moveSlide(1);
};

Slidezy.prototype._createNavigation = function () {
    this.navWrapper = document.createElement("div");
    this.navWrapper.className = "slidezy-nav";

    this.navCount = Math.ceil(
        this.opt.loop
            ? (this.slides.length - this.opt.items * 2) / this.opt.items
            : this.slides.length / this.opt.items
    );

    for (let i = 0; i < this.navCount; i++) {
        const dot = document.createElement("button");
        dot.className = "slidezy-dot";

        this.navWrapper.append(dot);

        dot.onclick = () => {
            this.currentStep = this.opt.loop
                ? i * this.opt.items + this.opt.items
                : i * this.opt.items;

            this._updatePosition();
        };
    }

    this.container.append(this.navWrapper);
};

Slidezy.prototype.moveSlide = function (step) {
    if (this._isTransitioning) return;
    this._isTransitioning = true;

    // 0 <= this.currentStep + step <= this.slides.length - this.opt.items
    this.maxIndex = this.slides.length - this.opt.items;

    this.currentStep = Math.min(
        Math.max(this.currentStep + step, 0),
        this.maxIndex
    );

    // loop
    setTimeout(() => this._infiniteLoop(), this.opt.speed);

    this._updatePosition();
};

Slidezy.prototype._infiniteLoop = function () {
    if (this.opt.loop) {
        if (this.currentStep >= this.maxIndex) {
            this.currentStep = this.opt.items;
            this._updatePosition(true);
        }

        if (this.currentStep <= 0) {
            this.currentStep = this.maxIndex - this.opt.items;
            this._updatePosition(true);
        }
    }
    this._isTransitioning = false;
};

Slidezy.prototype._updateNav = function () {
    let realIndex = this.currentStep;

    if (this.opt.loop) {
        const slideCount = this.slides.length - this.opt.items * 2;

        realIndex =
            (this.currentStep - this.opt.items + slideCount) % slideCount;
    }

    let pageIndex = Math.floor(realIndex / this.opt.items);

    const dots = Array.from(this.navWrapper.children);

    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === pageIndex);
    });
};

Slidezy.prototype._updatePosition = function (instant = false) {
    this.track.style.transition = instant
        ? "none"
        : `transform ${this.opt.speed}ms ease`;

    this.track.style.transform = `translateX(${
        (-this.currentStep * 100) / this.opt.items
    }%)`;

    if (this.opt.nav & !instant) {
        this._updateNav();
    }
};

Slidezy.prototype.autoPlay = function () {
    setInterval(() => {
        this.moveSlide(1);
    }, 2000);
};
