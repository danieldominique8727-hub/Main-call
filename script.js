const video = document.getElementById('input_video');
const canvas = document.getElementById('output_canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');

let userImg = new Image();
document.getElementById('imageUpload').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (f) => userImg.src = f.target.result;
    reader.readAsDataURL(e.target.files[0]);
};

// This is the main engine that mimics your movement
function onResults(results) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (userImg.src) {
        // 1. Draw the Base Photo
        ctx.drawImage(userImg, 0, 0, canvas.width, canvas.height);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
            const landmarks = results.multiFaceLandmarks[0];

            // 2. Track Mouth Opening (Points 13 & 14)
            const topLip = landmarks[13];
            const botLip = landmarks[14];
            const mouthOpen = Math.abs(topLip.y - botLip.y) * canvas.height * 2.8;

            // 3. Track Head Tilt (Using Eye Points)
            const leftEye = landmarks[33];
            const rightEye = landmarks[263];
            const tiltAngle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

            // 4. ANIMATION OVERLAY
            // This creates a 'talking' shadow on the replica
            ctx.translate(canvas.width / 2, canvas.height * 0.65); // Move to mouth area
            ctx.rotate(tiltAngle); // Tilt with your head
            
            // Draw the mimic mouth
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.beginPath();
            ctx.ellipse(0, 0, 35, mouthOpen, 0, 0, Math.PI * 2);
            ctx.fill();

            // 5. BLINKING (Tracks eye distance)
            const eyeGap = Math.abs(landmarks[159].y - landmarks[145].y) * 1000;
            if (eyeGap < 6) {
                // If you blink, we dim the replica's eyes
                ctx.fillStyle = "rgba(0,0,0,0.3)";
                ctx.fillRect(-canvas.width/2, -canvas.height*0.3, canvas.width, 50);
            }
        }
    }
    ctx.restore();
}

// Initialize the AI Mesh
const faceMesh = new FaceMesh({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
faceMesh.onResults(onResults);

// Start the Camera
startBtn.onclick = () => {
    const camera = new Camera(video, {
        onFrame: async () => { await faceMesh.send({image: video}); },
        width: 1280, height: 720
    });
    camera.start();
    startBtn.style.display = 'none';
};
