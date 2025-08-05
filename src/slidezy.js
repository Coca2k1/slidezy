function Slidezy(selector, options = {}) {
    this.container = document.querySelector(selector);

    if (!this.container) {
        console.error(`Slidezy: Container "${selector}" not found!`);
        return;
    }

    this.opt = Object.assign({}, options);
    this.slides = Array.from(this.container.children);

    this._init();
}

Slidezy.prototype._init = function () {
    this.container.classList.add("slidezy-wrapper");

    // createTrack
    this._createTrack();

    // button
    this._createNavigation();

    // event click
};

Slidezy.prototype._createTrack = function () {
    this.track = document.createElement("div");
    this.track.className = "slidezy-track";

    this.slides.forEach((slide) => {
        slide.classList.add("slidezy-slide");
        this.track.append(slide);
    });
    this.container.append(this.track);
};

Slidezy.prototype._createNavigation = function () {
    this.nextBtn = document.createElement("button");
    this.preBtn = document.createElement("button");

    this.preBtn.className = "slidezy-pre";
    this.nextBtn.className = "slidezy-next";

    this.nextBtn.innerHTML = "&#10095";
    this.preBtn.innerHTML = "&#10094";

    this.container.append(this.nextBtn, this.preBtn);

    this.currentStep = 0;
    // events
    this.preBtn.onclick = () => this.moveSlide(-1);
    this.nextBtn.onclick = () => this.moveSlide(1);
};

Slidezy.prototype.moveSlide = function (step) {
    this.currentStep = Math.min(
        Math.max(this.currentStep + step, 0),
        this.slides.length - 3
    );

    this.track.style.transform = `translateX(${
        (-this.currentStep * 100) / 3
    }%)`;
};
