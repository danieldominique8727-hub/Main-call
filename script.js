const video = document.getElementById('input_video');
const canvas = document.getElementById('output_canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const imageUpload = document.getElementById('imageUpload');

let replicaImg = new Image();
imageUpload.onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (f) => replicaImg.src = f.target.result;
    reader.readAsDataURL(e.target.files[0]);
};

function onResults(results) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (replicaImg.src) {
        ctx.save();
        
        // 1. Draw the Base Photo
        ctx.drawImage(replicaImg, 0, 0, canvas.width, canvas.height);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
            const mesh = results.multiFaceLandmarks[0];

            // 2. Head Tilt (Tracking the rotation of your face)
            const leftEye = mesh[33];
            const rightEye = mesh[263];
            const tilt = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

            // 3. Mouth Warping (The "Mimic" part)
            const topLip = mesh[13];
            const botLip = mesh[14];
            const mouthOpen = Math.abs(topLip.y - botLip.y) * canvas.height * 2.5;

            // MOUTH OVERLAY: This blends a "talking" mouth into the photo
            // It uses a gradient to make it look like a real shadow, not just a black hole
            let grd = ctx.createRadialGradient(canvas.width/2, canvas.height*0.68, 5, canvas.width/2, canvas.height*0.68, 40);
            grd.addColorStop(0, "rgba(0,0,0,0.8)");
            grd.addColorStop(1, "transparent");

            ctx.translate(canvas.width/2, canvas.height * 0.68);
            ctx.rotate(tilt);
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.ellipse(0, 0, 35, mouthOpen, 0, 0, Math.PI * 2);
            ctx.fill();

            // 4. Eyes (Blinking)
            // If the eye distance is small, we "dim" the replica's eyes
            const eyeGap = Math.abs(mesh[159].y - mesh[145].y) * 1000;
            if (eyeGap < 6) {
                ctx.fillStyle = "rgba(0,0,0,0.4)";
                // Draws a small shadow over the eyes of the photo
                ctx.fillRect(0, canvas.height * 0.3, canvas.width, 40);
            }
        }
        ctx.restore();
    }
}

// AI Initialization
const faceMesh = new FaceMesh({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5 });
faceMesh.onResults(onResults);

startBtn.onclick = () => {
    const camera = new Camera(video, {
        onFrame: async () => { await faceMesh.send({image: video}); },
        width: 640, height: 480
    });
    camera.start();
    startBtn.style.display = 'none';
};
