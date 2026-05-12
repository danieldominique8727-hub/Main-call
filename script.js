const video = document.getElementById('input_video');
const canvas = document.getElementById('output_canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');

let replicaImg = new Image();
document.getElementById('imageUpload').onchange = (e) => {
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
        
        // 1. Base Layer (The Photo)
        ctx.drawImage(replicaImg, 0, 0, canvas.width, canvas.height);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
            const mesh = results.multiFaceLandmarks[0];

            // 2. Head Tilt (Rotation) mapping
            // Uses eye positions to calculate angle
            const roll = Math.atan2(mesh[33].y - mesh[263].y, mesh[33].x - mesh[263].x);
            
            // 3. Mouth Mimic (Point 13 & 14)
            const mouthOpen = Math.abs(mesh[13].y - mesh[14].y) * canvas.height * 2;
            
            // Apply "Puppet Warp" - Darkens the mouth area to mimic opening
            ctx.fillStyle = "rgba(0,0,0,0.6)"; 
            ctx.beginPath();
            // Maps to the typical mouth position (around 68% down the face)
            ctx.ellipse(canvas.width/2, canvas.height * 0.68, 45, mouthOpen, roll, 0, Math.PI * 2);
            ctx.fill();

            // 4. Eyes (Blinking)
            const leftEye = Math.abs(mesh[159].y - mesh[145].y) * 1000;
            if (leftEye < 5) { // If distance is tiny, you are blinking
                ctx.fillStyle = "rgba(0,0,0,0.3)";
                ctx.fillRect(0, 0, canvas.width, canvas.height); // Dim the replica slightly
            }
        }
        ctx.restore();
    }
}

const faceMesh = new FaceMesh({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5 });
faceMesh.onResults(onResults);

startBtn.onclick = () => {
    const camera = new Camera(video, {
        onFrame: async () => { await faceMesh.send({image: video}); },
        width: 640, height: 480
    });
    camera.start();
    startBtn.innerText = "ACTIVE";
    startBtn.style.background = "red";
};
