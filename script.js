// ... keep your existing variables at the top ...
let recordedChunks = [];
let mediaRecorder;

async function processVideo() {
    if (video.paused || video.ended) {
        status.innerText = "SYNC COMPLETE - PREPARING DOWNLOAD...";
        mediaRecorder.stop(); // Stop recording when video ends
        return;
    }
    
    status.innerText = "AI SYNCING: " + Math.round((video.currentTime / video.duration) * 100) + "%";
    await holistic.send({image: video});
    
    video.currentTime += 0.05; // Frame stepping
    requestAnimationFrame(processVideo);
}

renderBtn.onclick = () => {
    if (!photo.src || !video.src) return alert("Upload both files!");
    
    // SETUP RECORDER
    recordedChunks = [];
    const stream = canvas.captureStream(30); // Capture canvas at 30FPS
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
    
    mediaRecorder.ondataavailable = (e) => recordedChunks.push(e.data);
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const finalVid = document.getElementById('finalVideo');
        finalVid.src = url;
        finalVid.style.display = 'block';
        document.getElementById('downloadTitle').style.display = 'block';
    };

    mediaRecorder.start();
    video.currentTime = 0;
    processVideo();
};
