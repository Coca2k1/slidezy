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
            controls: true,
            controlTexts: ["&#10095", "&#10094"],
            prevButton: null,
            nextButton: null,
            slideBy: 1,
            autoPlay: false,
            autoPlayTimeout: 3000,
            autoPlayHoverPause: true,
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

    this.currentStep = this.opt.loop ? this.opt.items : 0;

    // buttons
    if (this.opt.controls) this._createButtons();

    // navigation
    this._createNavigation();

    if (this.opt.autoPlay) {
        this._startAutoPlay();

        if (this.opt.autoPlayHoverPause) {
            this.container.onmouseenter = () => {
                this._stopAutoPlay();
            };

            this.container.onmouseleave = () => {
                this._startAutoPlay();
            };
        }
    }
};

Slidezy.prototype._startAutoPlay = function () {
    if (this.autoPlayTimer) return;

    this.autoPlayTimer = setInterval(() => {
        this.moveSlide(this.opt.slideBy);
    }, this.opt.autoPlayTimeout);
};

Slidezy.prototype._stopAutoPlay = function () {
    clearInterval(this.autoPlayTimer);
    this.autoPlayTimer = null;
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
    this.preBtn = this.opt.prevButton
        ? document.querySelector(this.opt.prevButton)
        : document.createElement("button");

    if (!this.opt.prevButton) {
        this.preBtn.className = "slidezy-pre";
        this.preBtn.innerHTML = this.opt.controlTexts[1];
        this.container.append(this.preBtn);
    }

    this.nextBtn = this.opt.nextButton
        ? document.querySelector(this.opt.nextButton)
        : document.createElement("button");

    if (!this.opt.nextButton) {
        this.nextBtn.className = "slidezy-next";
        this.nextBtn.innerHTML = this.opt.controlTexts[0];
        this.container.append(this.nextBtn);
    }

    // events
    const stepSize =
        this.opt.slideBy === "page" ? this.opt.items : this.opt.slideBy;

    this.preBtn.onclick = () => this.moveSlide(-stepSize);
    this.nextBtn.onclick = () => this.moveSlide(stepSize);
};

Slidezy.prototype._createNavigation = function () {
    this.navWrapper = document.createElement("div");
    this.navWrapper.className = "slidezy-nav";
    this.container.append(this.navWrapper);

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
    // 4 5 6 (clone) 1 2 3 4 5 6 (clone) 1 2 3
    // 0 1 2         3 4 5 6 7 8         9 10 11
    if (this.opt.loop) {
        const slideCount = this._getSlideCount();
        if (this.currentStep > slideCount) {
            this.currentStep -= slideCount;
            this._updatePosition(true);
        }

        if (this.currentStep < this.opt.items) {
            this.currentStep += slideCount;
            this._updatePosition(true);
        }
    }
    this._isTransitioning = false;
};

Slidezy.prototype._getSlideCount = function () {
    return this.opt.loop
        ? this.slides.length - this.opt.items * 2
        : this.slides.length;
};

Slidezy.prototype._updateNav = function () {
    let realIndex = this.currentStep;

    if (this.opt.loop) {
        const slideCount = this._getSlideCount();

        realIndex =
            (this.currentStep - this.opt.items + slideCount) % slideCount;
    }

    const pageIndex = Math.floor(realIndex / this.opt.items);

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
