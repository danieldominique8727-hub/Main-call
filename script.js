function animateMouth(results, userImg) {
    // MediaPipe points for lips
    const topLip = results.faceLandmarks[13];
    const bottomLip = results.faceLandmarks[14];
    
    // Calculate how wide the mouth is open
    const openDist = Math.abs(topLip.y - bottomLip.y);

    // DRAWING LOGIC:
    // 1. Draw the top half of the photo
    canvasCtx.drawImage(userImg, 0, 0, imgW, imgH/2, x, y, w, h/2);
    
    // 2. Draw the bottom half, but shift it down based on 'openDist'
    canvasCtx.drawImage(userImg, 0, imgH/2, imgW, imgH/2, x, y + (h/2) + (openDist * 500), w, h/2);
}
