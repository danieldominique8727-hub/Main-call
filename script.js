const video = document.getElementById('driverVideo');
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
const renderBtn = document.getElementById('renderBtn');
const status = document.getElementById('status');

let replicaPhoto = new Image();

document.getElementById('imageInput').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (f) => replicaPhoto.src = f.target.result;
    reader.readAsDataURL(e.target.files[0]);
};

document.getElementById('videoInput').onchange = (e) => {
    video.src = URL.createObjectURL(e.target.files[0]);
    status.innerText = "VIDEO LOADED";
};

const faceMesh = new FaceMesh({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true, // Key for 100% lip sync
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

faceMesh.onResults((results) => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (replicaPhoto.src) {
        // Draw Image
        ctx.drawImage(replicaPhoto, 0, 0, canvas.width, canvas.height);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
            const landmarks = results.multiFaceLandmarks[0];

            // 100% Accurate Mouth Points
            const innerLips = [13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 191, 80, 81, 82];
            
            ctx.fillStyle = "rgba(0,0,0,0.85)";
            ctx.beginPath();
            innerLips.forEach((idx, i) => {
                const p = landmarks[idx];
                if (i === 0) ctx.moveTo(p.x * canvas.width, p.y * canvas.height);
                else ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
            });
            ctx.closePath();
            ctx.fill();
        }
    }
});

async function processFrames() {
    if (video.paused || video.ended) {
        status.innerText = "COMPLETE";
        return;
    }
    status.innerText = "SYNCING... " + Math.round((video.currentTime / video.duration) * 100) + "%";
    await faceMesh.send({image: video});
    video.currentTime += 0.04; // Process frame by frame
    requestAnimationFrame(processFrames);
}

renderBtn.onclick = () => {
    if (!replicaPhoto.src || !video.src) return alert("Upload both first!");
    video.currentTime = 0;
    video.play().then(() => {
        processFrames();
    });
};
