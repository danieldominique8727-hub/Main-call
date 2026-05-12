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

function onResults(results) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (userImg.src) {
        let tx = 0;
        let ty = 0;
        let rotation = 0;

        // BODY MOVEMENT (Shoulders/Pose)
        if (results.poseLandmarks) {
            const leftShoulder = results.poseLandmarks[11];
            const rightShoulder = results.poseLandmarks[12];
            
            // Calculate tilt based on shoulder height
            rotation = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);
            // Move photo left/right based on body position
            tx = (leftShoulder.x + rightShoulder.x) / 2 - 0.5;
        }

        // Apply Global Movement to the whole image
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotation);
        ctx.translate(-canvas.width / 2 - (tx * canvas.width), -canvas.height / 2);

        // Draw the body/image
        ctx.drawImage(userImg, 0, 0, canvas.width, canvas.height);

        // FACE MIMIC (Inside the body transform)
        if (results.faceLandmarks) {
            const topLip = results.faceLandmarks[13];
            const botLip = results.faceLandmarks[14];
            const mouthOpen = Math.abs(topLip.y - botLip.y) * canvas.height * 3;

            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.beginPath();
            ctx.ellipse(canvas.width/2, canvas.height * 0.65, 40, mouthOpen, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
}

const holistic = new Holistic({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`});
holistic.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5 });
holistic.onResults(onResults);

startBtn.onclick = () => {
    const camera = new Camera(video, {
        onFrame: async () => { await holistic.send({image: video}); },
        width: 1280, height: 720
    });
    camera.start();
    startBtn.style.display = 'none';
};
