let ctx = document.querySelector("canvas");
let c = ctx.getContext("2d");

ctx.width = innerWidth - 50
ctx.height = innerHeight;

let mp = new Map();
mp["small"] = 20
mp["big"] = 50

let h = ctx.height,
    w = ctx.width;

let MAX_OBJECTS = 1e8 + 5;


function distance(x1, y1, x2, y2) {
    const xDist = x2 - x1;
    const yDist = y2 - y1;
    return Math.sqrt(
        Math.pow(xDist, 2) + Math.pow(yDist, 2)
    );
}

function randomIntFromRange(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1) + min
    );
}

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}


function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.vel.x - otherParticle.vel.x;
    const yVelocityDiff = particle.vel.y - otherParticle.vel.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.vel, angle);
        const u2 = rotate(otherParticle.vel, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.vel.x = vFinal1.x;
        particle.vel.y = vFinal1.y;

        otherParticle.vel.x = vFinal2.x;
        otherParticle.vel.y = vFinal2.y;
    }
}



let arr = [];

function init() {
    arr = [];
    for (let i = 0; i < 10; i++) {
        let r = 10;
        let x = randomIntFromRange(r, w - r);
        let y = randomIntFromRange(r, h - r);

        console.color = 'blue';
        if (i !== 0) {
            for (let j = 0; j < arr.length; j++) {
                if (distance(x, y, arr[j].x, arr[j].y) - r * 2 < 0) {
                    x = randomIntFromRange(r, w - r);
                    y = randomIntFromRange(r, h - r);
                    j = -1;
                }
            }
        }
        arr.push(new Circle(x, y, r, Math.random() * 5 - 2.5, Math.random() * 5 - 2.5));
    }
}


class Circle {
    constructor(x, y, radius, dx, dy, color = "black") {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.mass = 10;
        this.vel = {
            x: dx,
            y: dy
        }
    }

    drow() {
        c.beginPath();
        c.fillStyle = this.color
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);

        c.fill();

    }

    update() {
        for (let i = 0; i < arr.length; ++i) {
            if (this === arr[i]) continue;
            let d = distance(this.x, this.y, arr[i].x, arr[i].y);
            if (d - this.radius * 2 < 0) {
                resolveCollision(this, arr[i])
            }


        }
        this.x += this.vel.x;
        this.y += this.vel.y;
        if (this.x + this.radius >= w || this.x - this.radius <= 0) {
            this.vel.x = -this.vel.x;
        }
        if (this.y + this.radius >= h || this.y - this.radius <= 0) {
            this.vel.y = -this.vel.y;
        }
        this.drow();
    }
}


let lineFlag = false;
document.getElementById("hide").onclick = function() {
    lineFlag = !lineFlag;
}


document.addEventListener("click", function(e) {
    if (e.x > ctx.width || e.y > ctx.height) return;
    arr.push(new Circle(e.x, e.y, 10, Math.random() * 10 - 5, Math.random() * 10 - 5))
})

init();

function animation() {
    c.clearRect(0, 0, w, h);

    for (let i = 0; i < arr.length; ++i) {
        arr[i].update();
    }

    if (lineFlag) {
        for (let i = 0; i < arr.length; ++i) {
            for (let j = 0; j < arr.length; ++j) {
                c.beginPath();
                c.moveTo(arr[i].x, arr[i].y);
                c.lineTo(arr[j].x, arr[j].y);
                c.lineWidth = 2;
                c.stroke();

            }
        }
    }

    requestAnimationFrame(animation);
}
requestAnimationFrame(animation);