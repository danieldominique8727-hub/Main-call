```JavaScript
const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const imageUpload = document.getElementById('imageUpload');
const filterText = document.getElementById('filterText');

let userImg = new Image();
imageUpload.onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (event) => userImg.src = event.target.result;
    reader.readAsDataURL(e.target.files[0]);
};

function onResults(results) {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // 1. Draw your real webcam feed first (optional)
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // 2. Track Face & Lips
    if (results.faceLandmarks) {
        const nose = results.faceLandmarks[1];
        const topLip = results.faceLandmarks[13];
        const bottomLip = results.faceLandmarks[14];
        
        // Calculate mouth opening for lip-sync
        const mouthOpen = Math.abs(topLip.y - bottomLip.y) * 500;

        // Draw the uploaded picture over your face
        if (userImg.src) {
            canvasCtx.drawImage(userImg, 
                (nose.x * canvasElement.width) - 100, 
                (nose.y * canvasElement.height) - 100, 
                200, 200 + mouthOpen // Picture height changes as you talk!
            );
        }

        // Add moving words
        canvasCtx.fillStyle = "white";
        canvasCtx.font = "30px Arial";
        canvasCtx.fillText(filterText.value, (nose.x * canvasElement.width) - 50, (nose.y * canvasElement.height) - 120);
    }
}

const holistic = new Holistic({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`});
holistic.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => { await holistic.send({image: videoElement}); },
    width: 1280, height: 720
});
camera.start();

```
