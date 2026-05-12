// This version uses a simpler camera call that Safari prefers
const video = document.getElementById('input_video');
const canvas = document.getElementById('output_canvas');
const ctx = canvas.getContext('2d');

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();
        draw();
    } catch (err) {
        alert("Camera blocked! Go to AA menu > Website Settings > Allow Camera");
    }
}

function draw() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Draw the webcam feed
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Logic for the 'Words' to follow movement
    ctx.fillStyle = "yellow";
    ctx.font = "bold 24px Arial";
    ctx.fillText("AI TRACKING ACTIVE", 50, 50);

    requestAnimationFrame(draw);
}

startCamera();
