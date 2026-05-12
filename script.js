const video = document.getElementById('input_video');
const canvas = document.getElementById('output_canvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('imageUpload');
const videoInput = document.getElementById('videoUpload');
const processBtn = document.getElementById('processBtn');

let replicaImg = new Image();

// Handle Image Upload
imageInput.onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (f) => replicaImg.src = f.target.result;
    reader.readAsDataURL(e.target.files[0]);
};

// Handle Video Upload
videoInput.onchange = (e) => {
    const file = e.target.files[0];
    video.src = URL.createObjectURL(file);
};

function onResults(results) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (replicaImg.src) {
        let rotation = 0;
        let tiltY = 0;

        // TRACK BODY LEANING
        if (results.poseLandmarks) {
            const leftS = results.poseLandmarks[11];
            const rightS = results.poseLandmarks[12];
            rotation = Math.atan2(rightS.y - leftS.y, rightS.x - leftS.x);
        }

        // DRAW REPLICA WITH BODY TILT
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(rotation);
        ctx.drawImage(replicaImg, -canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset for mouth

        // TRACK FACE/LIP SYNC
        if (results.faceLandmarks) {
            const top = results.faceLandmarks[13];
            const bot = results.faceLandmarks[14];
            const gap = Math.abs(top.y - bot.y) * canvas.height * 3;

            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.beginPath();
            ctx.ellipse(canvas.width/2, canvas.height * 0.65, 40, gap, rotation, 0, Math.PI*2);
            ctx.fill();
        }
    }
    ctx.restore();
}

const holistic = new Holistic({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`});
holistic.onResults(onResults);

processBtn.onclick = () => {
    video.play();
    async function update() {
        if (!video.paused && !video.ended) {
            await holistic.send({image: video});
            requestAnimationFrame(update);
        }
    }
    update();
};
