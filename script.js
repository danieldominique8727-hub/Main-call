const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const imageUpload = document.getElementById('imageUpload');

let userImg = new Image();
imageUpload.onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (f) => userImg.src = f.target.result;
    reader.readAsDataURL(e.target.files[0]);
};

// This alert will tell us if the AI engine actually starts
console.log("Starting AI Engine...");

function onResults(results) {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.faceLandmarks && userImg.src) {
        const nose = results.faceLandmarks[1];
        // This draws your uploaded picture right on your nose
        canvasCtx.drawImage(userImg, (nose.x * canvasElement.width) - 50, (nose.y * canvasElement.height) - 50, 100, 100);
    }
    canvasCtx.restore();
}

const holistic = new Holistic({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`});
holistic.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => { await holistic.send({image: videoElement}); },
    width: 640, height: 480
});
camera.start();
