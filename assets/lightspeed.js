/*
Mostly all from https://github.com/naidihr/discourse-star-wars-theme/blob/master/common/header.html
*/

/*
light speed jump hyperspace effect
adapted from  Sarang Mohaniraj
https://freesoft.dev/program/171092458
 */
var whopacity = 0.0005;
var wrotate = 0;
const STAR_COUNT = (window.innerWidth + window.innerHeight) / 4; //recommended star count
const THRESHOLD = 50;

var stars = [];

var canJump = true; //prevents spam jump
var velocity = { x: 0, y: 0, tailX: 0, tailY: 0, z: 0.000075 };
//var velocity = {x: 0, y: 0, tailX: 0, tailY: 0, z: 1};

var c = document.querySelector(".lightspeed");
var ctx = c.getContext("2d");

c.width = window.innerWidth;
c.height = window.innerHeight;

window.onresize = () => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    stars.forEach((star) => {
        star.x = Math.random() * c.width;
        star.y = Math.random() * c.height;
    }); //redraw stars when resized
};

class Star {
    constructor() {
        this.x = Math.random() * c.width;
        this.y = Math.random() * c.height;
        this.z = Math.random() * 0.8 + 0.2;
        this.opacity = Math.random() * 0.5 + 0.5;
        //		this.opacity_speed = Math.random()/80;
        this.opacity_speed = Math.random() / 160;
        this.opacity_factor = 1;
        this.size = Math.random() * 3.5 + 0.6;
    }
    // static size(size){ //works only sometimes
    // 	this.size = size;
    // }
}

Star.size = (size) => {
    this.size = size;
}; //this always works

generate();
refresh();

function generate() {
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
    }
}

function refresh() {
    ctx.clearRect(0, 0, c.width, c.height);
    update();
    render();
    requestAnimationFrame(refresh);
}

function render() {
    stars.forEach((star) => {
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineWidth = star.size;

        if (star.opacity <= 0) {
            star.opacity_factor = 1;
        } else if (star.opacity >= 1) {
            star.opacity_factor = -1;
        }

        star.opacity += star.opacity_speed * star.opacity_factor;

        if (velocity.z < 0.4) {
            ctx.strokeStyle = "rgba(255,255,255," + star.opacity + ")"; //white + animate opacity
        } else if (velocity.z < 1) {
            star.red = Math.random() * 255;
            star.green = Math.random() * 255;
            star.blue = 255;
            ctx.strokeStyle =
                "rgba(" +
                star.red +
                "," +
                star.green +
                "," +
                star.blue +
                "," +
                star.opacity +
                ")"; //blue + animate opacity
        } else {
            star.opacity = 1;

            if (star.opacity > 1) {
                star.opacity = 1;
            }
            wrotate += 0.00001;
            if (wrotate > 1) {
                wrotate = 0;
            }
            var deltaX = star.x - c.width / 2;
            var deltaY = star.y - c.height / 2;
            var rad = Math.atan2(deltaY, deltaX) / Math.PI;
            rad = Math.abs(rad + wrotate);
            if (rad > 1) {
                rad -= 1;
            }
            star.blue = Math.floor((255 / 2) * rad + 255 / 2);
            if (Math.abs(deltaX) + Math.abs(deltaY) < 50) {
                star.opacity = 0;
            }
            ctx.strokeStyle =
                "rgba(" + star.blue + "," + star.blue + ",255," + star.opacity + ")"; //blue + animate opacity
        }
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);

        let tailX = velocity.x * 2;
        let tailY = velocity.y * 2;

        if (Math.abs(tailX) < 0.1) tailX = 0.5;
        if (Math.abs(tailY) < 0.1) tailY = 0.5;

        //makes the jump to lightspeed lines instead of dots
        let lineX =
            (velocity.x * star.z + (star.x - c.width / 2) * velocity.z * star.z) *
            2 || 0;
        let lineY =
            (velocity.y * star.z + (star.y - c.height / 2) * velocity.z * star.z) *
            2 || 0;

        if (velocity.z > 0.0005) {
            lineX *= 5;
            lineY *= 5;
        }

        ctx.lineTo(star.x + tailX + lineX, star.y + tailY + lineY);
        ctx.stroke();
    });
}

function update() {
    velocity.tailX *= 0.96;
    velocity.tailY *= 0.96;

    velocity.x += (velocity.tailX - velocity.x) * 0.8;
    velocity.y += (velocity.tailY - velocity.y) * 0.8;

    stars.forEach((star) => {
        star.x +=
            velocity.x * star.z + (star.x - c.width / 2) * velocity.z * star.z;
        star.y +=
            velocity.y * star.z + (star.y - c.height / 2) * velocity.z * star.z;
        star.z += velocity.z;

        //recycle star if star is off screen
        if (
            star.x < -THRESHOLD ||
            star.x > c.width + THRESHOLD ||
            star.y < -THRESHOLD ||
            star.y > c.height + THRESHOLD
        )
            recycle(star);
    });
}

function recycle(star) {
    let direction = "z";

    let vx = Math.abs(velocity.x);
    let vy = Math.abs(velocity.y);

    if (vx > 1 || vy > 1) {
        let axis = "z";

        if (vx > vy) {
            axis = Math.random() < vx / (vx + vy) ? "horizontal" : "vertical";
        } else {
            axis = Math.random() < vy / (vx + vy) ? "vertical" : "horizontal";
        }

        if (axis === "horizontal") {
            direction = velocity.x > 0 ? "left" : "right";
        } else {
            direction = velocity.y > 0 ? "up" : "down";
        }
    }

    star.z = Math.random() * 0.8 + 0.2;

    if (direction === "z") {
        star.z = 0.1;
        star.x = Math.random() * c.width;
        star.y = Math.random() * c.height;
    } else if (direction === "left") {
        star.x = -THRESHOLD;
        star.y = c.height * Math.random();
    } else if (direction === "right") {
        star.x = c.width + THRESHOLD;
        star.y = c.height * Math.random();
    } else if (direction === "up") {
        star.x = c.width * Math.random();
        star.y = -THRESHOLD;
    } else if (direction === "down") {
        star.x = c.width * Math.random();
        star.y = c.height + THRESHOLD;
    }
}
