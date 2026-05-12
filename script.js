const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const startButton = document.getElementById('startButton');

let userImg = new Image();
document.getElementById('imageUpload').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (f) => userImg.src = f.target.result;
    reader.readAsDataURL(e.target.files[0]);
};

function onResults(results) {
    canvasElement.width = canvasElement.clientWidth;
    canvasElement.height = canvasElement.clientHeight;
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (userImg.src) {
        // Draw the Base Photo
        canvasCtx.drawImage(userImg, 0, 0, canvasElement.width, canvasElement.height);

        if (results.faceLandmarks) {
            // REPLICA MIMIC LOGIC
            const topLip = results.faceLandmarks[13];
            const botLip = results.faceLandmarks[14];
            const openAmt = Math.abs(topLip.y - botLip.y) * 1000;

            // Simple "Puppet" Mouth: Cuts a piece of the image and moves it
            canvasCtx.fillStyle = "black";
            canvasCtx.beginPath();
            canvasCtx.ellipse(canvasElement.width/2, canvasElement.height * 0.7, 30, openAmt, 0, 0, Math.PI*2);
            canvasCtx.fill();
        }
    }
}

const holistic = new Holistic({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`});
holistic.onResults(onResults);

startButton.onclick = () => {
    const camera = new Camera(videoElement, {
        onFrame: async () => { await holistic.send({image: videoElement}); },
        width: 640, height: 480
    });
    camera.start();
    startButton.style.display = 'none'; // Hide button after start
};
